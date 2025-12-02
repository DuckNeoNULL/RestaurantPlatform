import db from "../config/db.js";
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { hallimage } = db;
class HallImageDAO {
    static async createHallImage(hallID, imageURL) {
        const result = await hallimage.create({ hallID, imageURL });
        return toDTO(result);
    }
    static async getByHallId(hallID) {
        const rows = await hallimage.findAll({ where: { hallID } });
        return toDTOs(rows);
    }
    static async deleteHallImage(imageID) {
        const count = await hallimage.destroy({ where: { imageID } });
        return count > 0;
    }
}
export default HallImageDAO;