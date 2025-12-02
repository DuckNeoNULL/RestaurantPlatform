import db from "../config/db.js";
import { Op } from 'sequelize';
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { sequelize, contract } = db;
//   status TINYINT UNSIGNED NOT NULL DEFAULT 0,
//     -- 0: PENDING           (vừa generate)
//     -- 1: PARTNER_UPLOADED  (partner đã upload bản ký)
//     -- 2: CUSTOMER_UPLOADED (customer đã upload bản ký → hoàn tất)
//     -- 3: CANCELLED         (hủy)
//     -- 4: SUPERSEDED        (bị thay thế)
const status ={
    PENDING: 0,
    PARTNER_UPLOADED: 1,
    CUSTOMER_UPLOADED: 2,
    CANCELLED: 3,
    SUPERSEDED: 4,
}

class ContractDAO {
    static async getByBookingID(bookingID) {
        const r = await contract.findOne({
            where: { bookingID, isActive: true },
            order: [['createdAt', 'DESC']]
        });
        return toDTO(r);
    }
    static async getByRestaurantID(restaurantID) {
        // Query through booking -> hall -> restaurant
        const { sequelize } = db;
        const [rows] = await sequelize.query(`
            SELECT c.contractID, c.bookingID, c.fileOriginalUrl, c.status
            FROM Contract c
            INNER JOIN Booking b ON c.bookingID = b.bookingID
            INNER JOIN Hall h ON b.hallID = h.hallID
            WHERE h.restaurantID = :restaurantID
        `, {
            replacements: { restaurantID },
            type: sequelize.QueryTypes.SELECT
        });
        return toDTOs(rows || []);
    }
    static async getByID(contractID) {
        const r = await contract.findByPk(contractID);
        return toDTO(r);
    }
    static async addContract(bookingID, restaurantID, contractURL, signedDate, status) {
        // Note: contract table doesn't have restaurantID field, but we keep it in signature for compatibility
        // Map contractURL to fileOriginalUrl to match model
        const c = await contract.create({ 
            bookingID, 
            fileOriginalUrl: contractURL, 
            status 
        });
        return toDTO(c);
    }
    static async updateContract(contractID, contractData) {
        const [count] = await contract.update(contractData, { where: { contractID } });
        return count > 0;
    }
    static async deleteContract(contractID) {
        const count = await contract.destroy({ where: { contractID } });
        return count > 0;
    }
}
export default ContractDAO;
export const ContractStatus = status;