
import db from "../config/db.js";
import { toDTO, toDTOs } from '../utils/convert/dto.js';
import BookingStatus from '../models/enums/BookingStatus.js';
import { Op } from 'sequelize';

// Use Sequelize models from init-models
const { sequelize, hall, restaurant, booking } = db;

class HallDAO {
    static async createHall(hallData) {
        const {
            restaurantID,
            name,
            description,
            capacity, // legacy field -> map to maxTable
            minTable,
            maxTable,
            area,
            price,
            status
        } = hallData;

        // default status to true when not provided (keeps backwards compatibility)
        const finalStatus = (typeof status === 'boolean') ? status : true;

        return await sequelize.transaction(async (t) => {
            const newHall = await hall.create({
                restaurantID,
                name,
                description,
                minTable: typeof minTable === 'number' ? minTable : undefined,
                maxTable: typeof maxTable === 'number' ? maxTable : (typeof capacity === 'number' ? capacity : undefined),
                area,
                price,
                status: finalStatus
            }, { transaction: t });

            // increment hallCount on restaurant
            await restaurant.increment('hallCount', { by: 1, where: { restaurantID }, transaction: t });

            const dto = toDTO(newHall);
            // provide legacy capacity mapping
            return { ...dto, capacity: dto.maxTable };
        });
    }

    static async getHallById(hallID) {
        const h = await hall.findByPk(hallID);
        if (!h) return null;
        const dto = toDTO(h);
        return { ...dto, capacity: dto.maxTable };
    }

    static async getHallsByRestaurantId(restaurantID) {
        const rows = await hall.findAll({ where: { restaurantID } });
        const dtos = toDTOs(rows);
        return dtos.map(d => ({ ...d, maxTable: d.maxTable, capacity: d.maxTable * 10 }));
    }

    static async updateHall(hallID, hallData) {
        const data = { ...hallData };
        // Map legacy capacity to maxTable if provided
        if (typeof hallData.capacity === 'number' && data.maxTable === undefined) {
            data.maxTable = hallData.capacity;
            delete data.capacity;
        }
        const [count] = await hall.update(data, { where: { hallID } });
        return count > 0;
    }

    static async deleteHall(hallID) {
        return await sequelize.transaction(async (t) => {
            const h = await hall.findByPk(hallID, { transaction: t, attributes: ['hallID','restaurantID'] });
            if (!h) return false;
            const rId = h.restaurantID;

            const count = await hall.destroy({ where: { hallID }, transaction: t });
            if (!count) return false;

            // decrement hallCount but do not go below 0
            await restaurant.update(
                { hallCount: sequelize.literal('CASE WHEN hallCount > 0 THEN hallCount - 1 ELSE 0 END') },
                { where: { restaurantID: rId }, transaction: t }
            );
            return true;
        });
    }

    static async updateHallStatus(hallID, status) {
        const [affected] = await hall.update({ status }, { where: { hallID } });
        return affected > 0;
    }
    static async isAvailable(hallID) {
        // Backwards-compatible minimal check (returns hall status) — keep for callers that expect it
        const h = await hall.findByPk(hallID, { attributes: ['status'] });
        return h ? h.status : false;
    }

    /**
     * Check if a hall is available for a given date/time range.
     * Options:
     * - transaction: a Sequelize transaction to run the query inside
     * - lock: boolean, if true and transaction provided, use FOR UPDATE to avoid races
     * - blockingStatuses: array of booking statuses that block availability
     */
    static async isAvailableForRange(hallID, eventDate, startTime, endTime, options = {}) {
        const { transaction = null, lock = false, blockingStatuses = [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.CONFIRMED, BookingStatus.DEPOSITED] } = options;

        // Simple validation
        if (!hallID || !eventDate || !startTime || !endTime) return false;

        const where = {
            hallID,
            eventDate,
            [Op.and]: [
                { startTime: { [Op.lt]: endTime } },
                { endTime: { [Op.gt]: startTime } }
            ],
            status: { [Op.in]: blockingStatuses }
        };

        const lockOption = (lock && transaction) ? { lock: sequelize.Transaction.LOCK.UPDATE } : {};

        const rows = await booking.findAll({ where, transaction, ...lockOption });
        return rows.length === 0;
    }

    /**
     * Find ended bookings (whose eventDate + endTime < now) for a hall and mark them COMPLETED.
     * Returns number of updated rows.
     */
    static async markEndedBookingsCompleted(hallID, now = new Date()) {
        if (!hallID) return 0;

        // Find bookings likely ended (status CONFIRMED or DEPOSITED)
        const candidates = await booking.findAll({
            where: { hallID, status: { [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.DEPOSITED] } },
            attributes: ['bookingID', 'eventDate', 'endTime']
        });

        const toCompleteIds = [];
        for (const c of candidates) {
            const dt = new Date(`${c.eventDate}T${c.endTime}`);
            if (!isNaN(dt.getTime()) && dt.getTime() < now.getTime()) toCompleteIds.push(c.bookingID);
        }

        if (toCompleteIds.length === 0) return 0;

        const [affected] = await booking.update({ status: BookingStatus.COMPLETED }, { where: { bookingID: { [Op.in]: toCompleteIds } } });
        return affected;
    }
}

export default HallDAO;