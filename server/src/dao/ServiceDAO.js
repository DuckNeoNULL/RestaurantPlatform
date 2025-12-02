import db from "../config/db.js";
import { Op } from 'sequelize';
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { service, sequelize, restauranteventtype, restau } = db;

class ServiceDAO {
    static async getAll() {
        const rows = await service.findAll({
            attributes: ['serviceID', 'restaurantID', 'eventTypeID', 'name', 'price', 'unit', 'status']
        });
        return toDTOs(rows);
    }
    static async getByID(serviceID) {
        const r = await service.findByPk(serviceID, {
            attributes: ['serviceID', 'restaurantID', 'eventTypeID', 'name', 'price', 'unit', 'status']
        });
        return toDTO(r);
    }
    static async addService(name, price, unit = null, status = true, restaurantID = null, eventTypeID = null) {
        // Kept for backward compatibility (not used by partner flow). Description field removed.
        const payload = { name, price };
        if (unit !== null) payload.unit = unit;
        if (typeof status !== 'undefined') payload.status = status;
        if (restaurantID !== null) payload.restaurantID = restaurantID;
        if (eventTypeID !== null) payload.eventTypeID = eventTypeID;
        const s = await service.create(payload);
        return toDTO(s);
    }
    static async updateService(serviceID, serviceData) {
        const [count] = await service.update(serviceData, { where: { serviceID } });
        return count > 0;
    }
    static async deleteService(serviceID) {
        const count = await service.destroy({ where: { serviceID } });
        return count > 0;
    }
    static async getServicesByEventType(eventTypeID, restaurantID = null) {
        // First, find all serviceIDs linked to the given eventTypeID
        const eventTypeLinks = await restauranteventtype.findAll({
            where: {
                eventTypeID,
                ...(restaurantID && { restaurantID })
            },
            attributes: ['serviceID']
        });
        const serviceIDs = eventTypeLinks.map(link => link.serviceID);
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
    static async getByRestaurantID(restaurantID) {
        const rows = await service.findAll({ where: { restaurantID }, attributes: ['serviceID', 'restaurantID', 'eventTypeID', 'name', 'price', 'unit', 'status'] });
        return toDTOs(rows);
    }
}
export default ServiceDAO;