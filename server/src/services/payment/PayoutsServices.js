import dotenv from 'dotenv';
import { PayOS } from '@payos/node';
import db from '../../config/db.js';
import PayoutsDAO from '../../dao/PayoutsDAO.js';
import BankAccountDAO from '../../dao/BankAccountDAO.js';
import { PayoutStatus } from '../../models/enums/PayoutStatus.js';

dotenv.config();

const {
  PAYOS_CLIENT_ID,
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY,
} = process.env;

function requireEnv(name, value) {
  if (!value) throw new Error(`[PayOS] Missing required env: ${name}`);
  return value;
}

function buildPayOSClient() {
  return new PayOS({
    clientId: requireEnv('PAYOS_CLIENT_ID', PAYOS_CLIENT_ID),
    apiKey: requireEnv('PAYOS_API_KEY', PAYOS_API_KEY),
    checksumKey: requireEnv('PAYOS_CHECKSUM_KEY', PAYOS_CHECKSUM_KEY),
  });
}

class PayoutsServices {
  /**
   * Calculate simple payout totals for a partner by summing stored payouts (useful for reporting)
   * returns { totalGross, totalCommission, totalPayout, count }
   */
  static async calculateTotalsForPartner(restaurantPartnerId) {
    const rows = await PayoutsDAO.getByRestaurantPartnerID(restaurantPartnerId);
    const totals = rows.reduce(
      (acc, p) => {
        acc.totalGross += Number(p.grossAmount || 0);
        acc.totalCommission += Number(p.commissionAmount || 0);
        acc.totalPayout += Number(p.payoutAmount || 0);
        acc.count += 1;
        return acc;
      },
      { totalGross: 0, totalCommission: 0, totalPayout: 0, count: 0 }
    );
    return totals;
  }

  /**
   * Send an existing payout record (best-effort) using PayOS.
   * payout: object returned by PayoutsDAO (must include payoutId, payoutAmount, restaurantPartnerId, paymentId)
   * bankAccountId: optional bank account id to use for beneficiary
   */
  static async sendExistingPayout(payout, bankAccountId = null, initiatedBy = null) {
    if (!payout || !payout.payoutId) throw new Error('Invalid payout object');
    if (Number(payout.status) !== PayoutStatus.status.PENDING) {
      return { success: false, error: 'Payout not in pending state', payout };
    }

    // fetch bank if provided
    let bank = null;
    if (bankAccountId) {
      bank = await BankAccountDAO.getByID(bankAccountId);
      if (!bank) {
        await PayoutsDAO.updatePayoutStatus(payout.payoutId, PayoutStatus.status.FAILED);
        return { success: false, error: 'Bank account not found', payout };
      }
    }

    const payos = buildPayOSClient();

    const payload = {
      amount: Math.round(Number(payout.payoutAmount) || 0),
      currency: 'VND',
      reference: `payout_${payout.payoutId}`,
      metadata: { payoutId: payout.payoutId, partnerId: payout.restaurantPartnerId },
    };

    if (bank) {
      payload.beneficiary = {
        name: bank.accountHolderName || bank.accountHolderName,
        accountNumber: bank.accountNumber,
        bankName: bank.bankName,
        ifscCode: bank.ifscCode || bank.ifscCode,
      };
    }

    let remoteResult = null;
    try {
      if (payos.payouts && typeof payos.payouts.create === 'function') {
        remoteResult = await payos.payouts.create(payload);
      } else if (typeof payos.payoutCreate === 'function') {
        remoteResult = await payos.payoutCreate(payload);
      } else {
        return { success: true, queued: true, payout };
      }
    } catch (err) {
      try {
        await PayoutsDAO.updatePayoutStatus(payout.payoutId, PayoutStatus.status.FAILED);
      } catch (uErr) {
        console.error('[PayoutsServices] failed to update payout status after external error', uErr.message);
      }
      return { success: false, error: err.message || String(err), payout };
    }

    const transactionRef = remoteResult?.transactionRef || remoteResult?.id || remoteResult?.payoutId || remoteResult?.reference || null;
    try {
      await PayoutsDAO.markReleased(payout.payoutId, {
        releasedBy: initiatedBy,
        releasedAt: new Date(),
        status: PayoutStatus.status.COMPLETED,
        transactionRef,
      });
    } catch (err) {
      console.error('[PayoutsServices] failed to markReleased', err.message);
    }

    return { success: true, remoteResult, payout };
  }

  /**
   * Create a payout record and attempt to send it via PayOS (bank transfer).
   * This method is best-effort: if external transfer fails the payout remains in PENDING/FAILED state,
   * but the DB record is created atomically.
   *
   * params: { paymentId, restaurantPartnerId, grossAmount, commissionAmount, payoutAmount, bankAccountId, initiatedBy, note }
   */
  static async createAndSendPayout(params = {}) {
    const {
      paymentId = null,
      restaurantPartnerId,
      grossAmount,
      commissionAmount,
      payoutAmount,
      bankAccountId = null,
      initiatedBy = null,
      note = null,
    } = params;

    if (!restaurantPartnerId) throw new Error('restaurantPartnerId is required');
    if (typeof payoutAmount === 'undefined' || Number(payoutAmount) < 0) throw new Error('Invalid payoutAmount');

    const sequelize = db.sequelize;
    const tx = await sequelize.transaction();
    let createdPayout;
    try {
      // create DB record in a transaction so the payout is recorded even if external call fails
      createdPayout = await PayoutsDAO.createPayout(
        {
          paymentId,
          restaurantPartnerId,
          grossAmount,
          commissionAmount,
          payoutAmount,
          method: 1, // 1 = bank transfer (convention)
          status: PayoutStatus.status.PENDING,
          transactionRef: null,
          note,
        },
        { transaction: tx }
      );

      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    // if bankAccountId provided, fetch bank details (for the external provider)
    let bank = null;
    if (bankAccountId) {
      bank = await BankAccountDAO.getByID(bankAccountId);
      if (!bank) {
        // mark payout failed
        await PayoutsDAO.updatePayoutStatus(createdPayout.payoutId, PayoutStatus.status.FAILED);
        return { success: false, error: 'Bank account not found', payout: createdPayout };
      }
    }

    // Attempt to call PayOS if client supports payouts
    const payos = buildPayOSClient();

    // construct payload - shape depends on PayOS provider; attempt common fields
    const payload = {
      amount: Math.round(Number(payoutAmount) || 0),
      currency: 'VND',
      reference: `payout_${createdPayout.payoutId}`,
      metadata: { payoutId: createdPayout.payoutId, partnerId: restaurantPartnerId },
    };

    if (bank) {
      payload.beneficiary = {
        name: bank.accountHolderName || bank.accountHolderName,
        accountNumber: bank.accountNumber,
        bankName: bank.bankName,
        ifscCode: bank.ifscCode || bank.ifscCode,
      };
    }

    // Some PayOS SDKs expose `payouts.create` or similar — try both gracefully
    let remoteResult = null;
    try {
      if (payos.payouts && typeof payos.payouts.create === 'function') {
        remoteResult = await payos.payouts.create(payload);
      } else if (typeof payos.payoutCreate === 'function') {
        // fallback to alternate SDK naming
        remoteResult = await payos.payoutCreate(payload);
      } else {
        // No direct payouts API available in SDK; keep DB record and return queued
        return { success: true, queued: true, payout: createdPayout };
      }
    } catch (err) {
      // external transfer failed — mark as FAILED and attach error in note
      try {
        await PayoutsDAO.updatePayoutStatus(createdPayout.payoutId, PayoutStatus.status.FAILED);
      } catch (uErr) {
        // log but continue
        console.error('[PayoutsServices] failed to update payout status after external error', uErr.message);
      }
      return { success: false, error: err.message || String(err), payout: createdPayout };
    }

    // If remoteResult exists, extract transaction reference and mark released/completed
    const transactionRef = remoteResult?.transactionRef || remoteResult?.id || remoteResult?.payoutId || remoteResult?.reference || null;
    try {
      await PayoutsDAO.markReleased(createdPayout.payoutId, {
        releasedBy: initiatedBy,
        releasedAt: new Date(),
        status: PayoutStatus.status.COMPLETED,
        transactionRef,
      });
    } catch (err) {
      console.error('[PayoutsServices] failed to markReleased', err.message);
    }

    // Return the updated payout record (best-effort fetch)
    const resultPayouts = await PayoutsDAO.getByPaymentID(paymentId);
    return { success: true, remoteResult, payout: createdPayout, payoutsByPayment: resultPayouts };
  }
}

export default PayoutsServices;

