import db from "../config/db.js";
import { Op } from "sequelize";
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { eventtype, sequelize, restaurant, restauranteventtype } = db;

class EventTypeDAO {
    static async getAll() {
        const rows = await eventtype.findAll({
            attributes: ['eventTypeID', 'name']
        });
        return toDTOs(rows);
    }
    static async getByID(eventTypeID) {
        const r = await eventtype.findByPk(eventTypeID, {
            attributes: ['eventTypeID', 'name']
        });
        return toDTO(r);
    }
    static async getAllByRestaurantID(restaurantID) {
        // First, find all eventTypeIDs linked to the given restaurantID
        const eventTypeLinks = await restauranteventtype.findAll({
            where: { restaurantID },
            attributes: ['eventTypeID']
        });
        const eventTypeIDs = eventTypeLinks.map(link => link.eventTypeID);
        if (eventTypeIDs.length === 0) {
            return [];
        }
        // Now, fetch all event types with these eventTypeIDs
        const rows = await eventtype.findAll({
            where: {
                eventTypeID: {
                    [Op.in]: eventTypeIDs
                }
            },
            attributes: ['eventTypeID', 'name']
        });
        return toDTOs(rows);
    }
    static async addEventType(name) {
        const e = await eventtype.create({ name });
        return toDTO(e);
    }


    static async removeEventTypeFromRestaurant(restaurantID, eventTypeID) {
        const count = await restauranteventtype.destroy({ where: { restaurantID, eventTypeID } });
        return count > 0;
    }

    /**
     * Replace all event types linked to a restaurant with the provided set.
     */
    static async setEventTypesForRestaurant(restaurantID, eventTypeIDs = []) {
        // normalize and unique IDs
        const ids = Array.from(new Set((eventTypeIDs || []).map((x) => Number(x)).filter((x) => Number.isInteger(x))));
        return await sequelize.transaction(async (t) => {
            await restauranteventtype.destroy({ where: { restaurantID }, transaction: t });
            if (ids.length === 0) return true;
            const rows = ids.map((eventTypeID) => ({ restaurantID, eventTypeID }));
            await restauranteventtype.bulkCreate(rows, { transaction: t, ignoreDuplicates: true });
            return true;
        });
    }
}
export default EventTypeDAO;