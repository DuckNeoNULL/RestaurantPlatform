import db from "../config/db.js";
import { Op } from 'sequelize';
const { refundpolicies: RefundPolicyModel } = db;
import { toDTO, toDTOs } from '../utils/convert/dto.js';

class RefundPolicyDAO {
	static async listByRestaurant(restaurantId) {
    	const rows = await RefundPolicyModel.findAll({ where: { restaurantId }, order: [['daysBeforeEvent', 'DESC']] });
    	return toDTOs(rows);
	}

	static async getById(policyId) {
		const row = await RefundPolicyModel.findByPk(policyId);
		return toDTO(row);
	}

	static async createPolicy(data) {
		const { restaurantId, daysBeforeEvent, refundPercent, description = null, isDefault = false } = data;
		if (typeof daysBeforeEvent === 'undefined' || Number(daysBeforeEvent) < 0) throw new Error('Invalid daysBeforeEvent');
		if (typeof refundPercent === 'undefined' || Number(refundPercent) < 0 || Number(refundPercent) > 100) throw new Error('Invalid refundPercent');

		// If setting default, unset other defaults for the restaurant in a transaction
		return await RefundPolicyModel.sequelize.transaction(async (t) => {
			if (isDefault) {
				await RefundPolicyModel.update({ isDefault: false }, { where: { restaurantId }, transaction: t });
			}

			const created = await RefundPolicyModel.create({ restaurantId, daysBeforeEvent, refundPercent, description, isDefault }, { transaction: t });
			return toDTO(created);
		});
	}

	static async updatePolicy(policyId, updates) {
		const { daysBeforeEvent, refundPercent, description, isDefault } = updates;
		return await RefundPolicyModel.sequelize.transaction(async (t) => {
			const policy = await RefundPolicyModel.findByPk(policyId, { transaction: t, lock: t.LOCK.UPDATE });
			if (!policy) throw new Error('Policy not found');

			if (typeof isDefault !== 'undefined' && isDefault) {
				// unset other defaults for the restaurant
				await RefundPolicyModel.update({ isDefault: false }, { where: { restaurantId: policy.restaurantId }, transaction: t });
			}

			const updated = await policy.update({
				daysBeforeEvent: typeof daysBeforeEvent !== 'undefined' ? daysBeforeEvent : policy.daysBeforeEvent,
				refundPercent: typeof refundPercent !== 'undefined' ? refundPercent : policy.refundPercent,
				description: typeof description !== 'undefined' ? description : policy.description,
				isDefault: typeof isDefault !== 'undefined' ? isDefault : policy.isDefault,
			}, { transaction: t });

				return toDTO(updated);
		});
	}

	static async deletePolicy(policyId) {
		const del = await RefundPolicyModel.destroy({ where: { policyId } });
		return del > 0;
	}

	// Find the default policy for a restaurant (isDefault = true)
	static async getDefaultPolicy(restaurantId) {
		const row = await RefundPolicyModel.findOne({ where: { restaurantId, isDefault: true } });
		return toDTO(row);
	}

	// Given daysBefore (number of days before event), find the applicable policy:
	// the policy with the largest daysBeforeEvent <= daysBefore. Fallback to default policy if none.
	static async getApplicablePolicy(restaurantId, daysBefore) {
		const row = await RefundPolicyModel.findOne({
			where: {
				restaurantId,
				daysBeforeEvent: { [Op.lte]: daysBefore }
			},
			order: [['daysBeforeEvent', 'DESC']]
		});
	if (row) return toDTO(row);
		// fallback to default
		return await this.getDefaultPolicy(restaurantId);
	}

}

export default RefundPolicyDAO;
