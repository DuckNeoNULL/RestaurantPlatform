import db from "../config/db.js";
import { Op } from "sequelize";
import PayoutStatus from "../models/enums/PayoutStatus.js";
const { sequelize, payouts: PayoutModel } = db;
import { toDTO, toDTOs } from '../utils/convert/dto.js';

function normalizeStatus(value) {
    if (value == null) return null;
    // if number, return number
    if (typeof value === 'number') return value;
    // try to map from string name (case-insensitive)
    const key = String(value).toUpperCase();
    if (PayoutStatus.status.hasOwnProperty(key)) return PayoutStatus.status[key];
    // try numeric parse
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

function normalizeStatusList(list) {
    if (!Array.isArray(list)) return [normalizeStatus(list)];
    return list.map(normalizeStatus).filter(v => v !== null);
}


class PayoutsDAO {
    static async getByRestaurantPartnerID(restaurantPartnerId) {
    const rows = await PayoutModel.findAll({ where: { restaurantPartnerId }, order: [['createdAt','DESC']] });
    return toDTOs(rows);
    }

    static async getByPaymentID(paymentId) {
    const rows = await PayoutModel.findAll({ where: { paymentId }, order: [['payoutId','ASC']] });
    return toDTOs(rows);
    }

    static async getByTransactionRef(transactionRef) {
    const row = await PayoutModel.findOne({ where: { transactionRef } });
    return toDTO(row);
    }

    // Create a payout. Accepts an optional transaction via opts.transaction
    static async createPayout(data, opts = {}) {
        const {
            paymentId,
            restaurantPartnerId,
            grossAmount,
            commissionAmount,
            payoutAmount,
            method = 0,
            status = 0,
            transactionRef = null,
            note = null,
            releasedBy = null,
            releasedAt = null,
        } = data;

        if (typeof grossAmount === 'undefined' || Number(grossAmount) < 0) throw new Error('Invalid grossAmount');
        if (typeof commissionAmount === 'undefined' || Number(commissionAmount) < 0) throw new Error('Invalid commissionAmount');
        if (typeof payoutAmount === 'undefined' || Number(payoutAmount) < 0) throw new Error('Invalid payoutAmount');

        const created = await PayoutModel.create({
            paymentId,
            restaurantPartnerId,
            grossAmount,
            commissionAmount,
            payoutAmount,
            method,
            status: normalizeStatus(status) ?? PayoutStatus.status.PENDING,
            transactionRef,
            note,
            releasedBy,
            releasedAt,
        }, { transaction: opts.transaction });

    return toDTO(created);
    }

    static async updatePayoutStatus(payoutId, newStatus) {
        const ns = normalizeStatus(newStatus);
        if (ns === null) throw new Error('Invalid payout status');
        const [updated] = await PayoutModel.update({ status: ns }, { where: { payoutId } });
        return updated > 0;
    }

    // Mark a payout as released: set releasedBy and releasedAt and optionally status/transactionRef
    static async markReleased(payoutId, { releasedBy = null, releasedAt = null, status = null, transactionRef = null } = {}) {
        const updates = {};
        if (releasedBy !== null) updates.releasedBy = releasedBy;
        updates.releasedAt = releasedAt ?? new Date();
        if (status !== null) updates.status = normalizeStatus(status) ?? status;
        if (transactionRef !== null) updates.transactionRef = transactionRef;

        const [updated] = await PayoutModel.update(updates, { where: { payoutId } });
        return updated > 0;
    }

    static async getPayoutsByStatus(statusList) {
        const normalized = normalizeStatusList(statusList);
    const rows = await PayoutModel.findAll({ where: { status: { [Op.in]: normalized } }, order: [['createdAt','DESC']] });
    return toDTOs(rows);
    }

    // convenience: get pending payouts
    static async getPendingPayouts() {
        return await this.getPayoutsByStatus([PayoutStatus.status.PENDING]);
    }
}

export default PayoutsDAO;