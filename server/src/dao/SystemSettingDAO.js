import db from "../config/db.js";
import { Op } from 'sequelize';
import { toDTO, toDTOs } from '../utils/convert/dto.js';

const { systemsetting, sequelize } = db;

class SystemSettingDAO {
    /**
     * Get a setting by its primary ID
     */
    static async getByID(settingID) {
        const r = await systemsetting.findByPk(settingID);
        return toDTO(r);
    }

    /**
     * Get a setting by its unique key
     */
    static async getByKey(settingKey) {
        const r = await systemsetting.findOne({ where: { settingKey } });
        return toDTO(r);
    }

    /**
     * List settings with optional filters: { category, isActive }
     */
    static async list({ category, isActive, limit, offset } = {}) {
        const where = {};
        if (category !== undefined && category !== null) where.category = category;
        if (isActive !== undefined && isActive !== null) where.isActive = isActive;

        const rows = await systemsetting.findAll({ where, order: [['settingID','ASC']], ...(limit ? { limit } : {}), ...(offset ? { offset } : {}) });
        return toDTOs(rows);
    }

    /**
     * Create a system setting.
     * settingData: { category, settingKey, settingName, settingValue, dataType?, description?, isActive?, createdBy?, updatedBy? }
     */
    static async createSetting(settingData) {
        const {
            category,
            settingKey,
            settingName,
            settingValue,
            dataType = 0,
            description = null,
            isActive = true,
            createdBy = null,
            updatedBy = null
        } = settingData;

        const s = await systemsetting.create({ category, settingKey, settingName, settingValue, dataType, description, isActive, createdBy, updatedBy });
        return toDTO(s);
    }

    /**
     * Update a system setting (partial). Returns boolean success.
     */
    static async updateSetting(settingID, patch) {
        const [count] = await systemsetting.update(patch, { where: { settingID } });
        return count > 0;
    }

    static async deleteSetting(settingID) {
        const count = await systemsetting.destroy({ where: { settingID } });
        return count > 0;
    }

    /**
     * Activate or deactivate a setting
     */
    static async setActive(settingID, isActive = true) {
        const [count] = await systemsetting.update({ isActive }, { where: { settingID } });
        return count > 0;
    }

    /**
     * Count settings with optional filters
     */
    static async count({ category, isActive } = {}) {
        const where = {};
        if (category !== undefined && category !== null) where.category = category;
        if (isActive !== undefined && isActive !== null) where.isActive = isActive;
        return await systemsetting.count({ where });
    }

    /**
     * Upsert by key: create or update atomically. Returns the DTO of the upserted row.
     */
    static async upsertByKey(settingKey, values) {
        // Use transaction + findOrCreate/update for clarity across MySQL versions
        return await sequelize.transaction(async (t) => {
            const existing = await systemsetting.findOne({ where: { settingKey }, transaction: t });
            if (existing) {
                await existing.update(values, { transaction: t });
                return toDTO(existing);
            }
            const created = await systemsetting.create({ settingKey, ...values }, { transaction: t });
            return toDTO(created);
        });
    }
}

export default SystemSettingDAO;

// Optional: small enum-like helpers the service layer can import if desired
export const SystemSettingCategory = Object.freeze({
    GENERAL: 0,
    BOOKING: 1,
    PAYMENT: 2,
    COMMISSION: 3,
    NOTIFICATION: 4,
});

export const SystemSettingDataType = Object.freeze({
    STRING: 0,
    NUMBER: 1,
    BOOLEAN: 2,
    JSON: 3,
    DATE: 4,
});
