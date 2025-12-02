import db from "../config/db.js";
import { Op } from 'sequelize';
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { promotion, sequelize, restaurantpromotion, promotionservice, service } = db;

class PromotionDAO {
    static async getAll() {
        const rows = await promotion.findAll({
            attributes: ['promotionID', 'restaurantID', 'name', 'description', 'minTable', 'discountType', 'discountValue', 'startDate', 'endDate', 'status']
        });
        return toDTOs(rows);
    }
    static async getByID(promotionID) {
        const r = await promotion.findByPk(promotionID, {
            attributes: ['promotionID', 'restaurantID', 'name', 'description', 'minTable', 'discountType', 'discountValue', 'startDate', 'endDate', 'status']
        });
        return toDTO(r);
    }
    static async getPromotionsByRestaurantID(restaurantID) {
        const now = new Date();
        // Only return promotions that have not expired (endDate >= now)
        const rows = await promotion.findAll({
            where: {
                status: true,
                restaurantID,
                endDate: {
                    [Op.gte]: now
                }
            },
            attributes: ['promotionID', 'restaurantID', 'name', 'description', 'minTable', 'discountType', 'discountValue', 'startDate', 'endDate', 'status']
        });
        return toDTOs(rows);
    }
    static async getServicesByPromotionID(promotionID) {
        // First, find all serviceIDs linked to the given promotionID
        const serviceLinks = await promotionservice.findAll({
            where: { promotionID },
            attributes: ['serviceID']
        });
        const serviceIDs = serviceLinks.map(link => link.serviceID);
        if (serviceIDs.length === 0) {
            return [];
        }
        // Now, fetch all services with these serviceIDs
        const rows = await service.findAll({
            where: {
                serviceID: {
                    [Op.in]: serviceIDs
                }
            },
            attributes: ['serviceID', 'restaurantID', 'eventTypeID', 'name', 'price', 'unit', 'status']
        });
        return toDTOs(rows);
    }
    static async addPromotion({ name, description = null, discountType = 0, discountValue = null, startDate, endDate, restaurantID, status = true, minTable = 0, serviceIDs = [] }) {
        const t = await sequelize.transaction();
        try {
            const p = await promotion.create(
                { restaurantID, name, description, minTable, discountType, discountValue, startDate, endDate, status },
                { transaction: t }
            );

            // if discountType is "Free", link the promotion to the provided services
            if (Number(discountType) === 1 && Array.isArray(serviceIDs) && serviceIDs.length > 0) {
                const links = serviceIDs.map(serviceID => ({ promotionID: p.promotionID, serviceID }));
                await promotionservice.bulkCreate(links, { transaction: t });
            }

            await t.commit();

            return {
                promotionID: p.promotionID,
                name: p.name,
                description: p.description,
                minTable: p.minTable,
                discountValue: p.discountValue,
                discountType: p.discountType,
                startDate: p.startDate,
                endDate: p.endDate,
                status: p.status,
                restaurantID: p.restaurantID,
            };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
    static async updatePromotion(promotionID, promotionData) {
        const [count] = await promotion.update(promotionData, { where: { promotionID } });
        return count > 0;
    }
    static async updateStatus(promotionID, statusData) {
        const [count] = await promotion.update(statusData, { where: { promotionID } });
        return count > 0;
    }
    static async deletePromotion(promotionID) {
        const count = await promotion.destroy({ where: { promotionID } });
        return count > 0;
    }

    // get promotions by eventypeID and restaurantID
    static async getPromotionsByEventTypeAndRestaurant(eventTypeID, restaurantID) {
        // First, find all serviceIDs linked to the given eventTypeID and restaurantID
        const serviceRows = await service.findAll({
            where: { eventTypeID, restaurantID },
            attributes: ['serviceID']
        });
        const serviceIDs = serviceRows.map(row => row.serviceID);
        if (serviceIDs.length === 0) {
            return [];
        }
        // Then, find all promotionIDs linked to these serviceIDs
        const promotionLinks = await promotionservice.findAll({
            where: {
                serviceID: {
                    [Op.in]: serviceIDs
                }
            },
            attributes: ['promotionID']
        });
        const promotionIDs = promotionLinks.map(link => link.promotionID);
        if (promotionIDs.length === 0) {
            return [];
        }
        // Finally, fetch all promotions with these promotionIDs
        const rows = await promotion.findAll({
            where: {
                promotionID: {
                    [Op.in]: promotionIDs
                }
            },
            attributes: ['promotionID', 'restaurantID', 'name', 'description', 'minTable', 'discountType', 'discountValue', 'startDate', 'endDate', 'status']
        });
        return toDTOs(rows);
    }
}

export default PromotionDAO;
