import db from "../config/db.js";
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { dishcategory } = db;

class DishCategoryDAO {
    static async getAll() {
        const rows = await dishcategory.findAll({
            attributes: ['categoryID', 'name', 'requiredQuantity', 'status', 'restaurantID']
        });
        return toDTOs(rows);
    }

    static async getByID(categoryID) {
        const r = await dishcategory.findByPk(categoryID, {
            attributes: ['categoryID', 'name', 'requiredQuantity', 'status', 'restaurantID']
        });
        return toDTO(r);
    }

    static async getByRestaurantID(restaurantID) {
        const rows = await dishcategory.findAll({
            where: { restaurantID },
            attributes: ['categoryID', 'name', 'requiredQuantity', 'status', 'restaurantID']
        });
        return toDTOs(rows);
    }

    static async addDishCategory({ name, restaurantID, requiredQuantity = 1, status = true }) {
        const dc = await dishcategory.create({ name, restaurantID, requiredQuantity, status });
        return toDTO(dc);
    }

    static async updateDishCategory(categoryID, dishCategoryData) {
        const [count] = await dishcategory.update(dishCategoryData, { where: { categoryID } });
        return count > 0;
    }

    static async deleteDishCategory(categoryID) {
        const count = await dishcategory.destroy({ where: { categoryID } });
        return count > 0;
    }
}
export default DishCategoryDAO;