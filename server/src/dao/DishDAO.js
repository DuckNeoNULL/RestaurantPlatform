import db from "../config/db.js";
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const {dish} = db;

class DishDAO {
    static async getByRestaurantID(restaurantID) {
        const rows = await dish.findAll({
            where: { restaurantID },
            attributes: ['dishID','restaurantID','categoryID','name','imageURL','status']
        });
        return toDTOs(rows);
    }
    static async getByID(dishID) {
        const r = await dish.findByPk(dishID, {
            attributes: ['dishID','restaurantID','categoryID','name','imageURL','status']
        });
        return toDTO(r);
    }
    static async addDish(restaurantID,categoryID, name, imageURL, status = 1) {
        const d = await dish.create({ restaurantID, categoryID, name, imageURL, status });
        return toDTO(d);
    }
    
    static async updateDish(dishID, dishData) {
        const [count] = await dish.update(dishData, { where: { dishID } });
        return count > 0;
    }
    static async deleteDish(dishID) {
        const count = await dish.destroy({ where: { dishID } });
        return count > 0;
    }
}
export default DishDAO;