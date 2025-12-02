import db from '../config/db.js';
import BankAccountDAO from '../dao/BankAccountDAO.js';
import RestaurantDAO from '../dao/RestaurantDAO.js';

const { bankaccount } = db;

class BankAccountService {
  // partner creates a bank account for themselves
  static async createForPartner(actorUserId, { accountNumber, bankName, accountHolderName, ifscCode }) {
    if (!actorUserId) throw new Error('actorUserId required');
    if (!accountNumber || !bankName || !accountHolderName) throw new Error('accountNumber, bankName, accountHolderName required');

    // create directly using model so we can set restaurantPartnerID
    const created = await bankaccount.create({ restaurantPartnerID: actorUserId, accountNumber, bankName, accountHolderName, ifscCode });
    return {
      accountID: created.accountID,
      accountNumber: created.accountNumber,
      bankName: created.bankName,
      accountHolderName: created.accountHolderName,
      ifscCode: created.ifscCode,
    };
  }

  static async listForPartner(actorUserId) {
    if (!actorUserId) throw new Error('actorUserId required');
    const rows = await bankaccount.findAll({ where: { restaurantPartnerID: actorUserId }, attributes: ['accountID','accountNumber','bankName','accountHolderName','ifscCode'] });
    return rows.map(r => ({ accountID: r.accountID, accountNumber: r.accountNumber, bankName: r.bankName, accountHolderName: r.accountHolderName, ifscCode: r.ifscCode }));
  }

  static async getByIDForPartner(actorUserId, accountID) {
    if (!actorUserId) throw new Error('actorUserId required');
    const r = await BankAccountDAO.getByID(accountID);
    if (!r) throw new Error('Bank account not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');
    // return sanitized
    return { accountID: r.accountID, accountNumber: r.accountNumber, bankName: r.bankName, accountHolderName: r.accountHolderName, ifscCode: r.ifscCode };
  }

  static async updateForPartner(actorUserId, accountID, patch) {
    if (!actorUserId) throw new Error('actorUserId required');
    // First verify ownership
    const r = await BankAccountDAO.getByID(accountID);
    if (!r) throw new Error('Bank account not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    const updatable = {};
    ['accountNumber','bankName','accountHolderName','ifscCode'].forEach(k => { if (k in patch) updatable[k] = patch[k]; });

    // prefer DAO update if available
    if (typeof BankAccountDAO.updateBankAccountForPartner === 'function') {
      const ok = await BankAccountDAO.updateBankAccountForPartner(accountID, actorUserId, updatable);
      if (!ok) throw new Error('Update failed');
      return await BankAccountDAO.getByID(accountID);
    }

    // fallback: regular update
    const ok = await BankAccountDAO.updateBankAccount(accountID, updatable);
    if (!ok) throw new Error('Update failed');
    return await BankAccountDAO.getByID(accountID);
  }

  static async deleteForPartner(actorUserId, accountID) {
    if (!actorUserId) throw new Error('actorUserId required');
    const r = await BankAccountDAO.getByID(accountID);
    if (!r) throw new Error('Bank account not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    if (typeof BankAccountDAO.deleteBankAccountForPartner === 'function') {
      return await BankAccountDAO.deleteBankAccountForPartner(accountID, actorUserId);
    }
    return await BankAccountDAO.deleteBankAccount(accountID);
  }
}

export default BankAccountService;
