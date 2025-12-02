import db from "../config/db.js";
import { Op } from 'sequelize';
import { toDTO, toDTOs } from '../utils/convert/dto.js';

// Models from init-models.cjs (lowercase keys)
const { menu, dishmenu, dish, sequelize } = db;

export default class MenuDAO {
    // CRUD for Menu
    static async getByRestaurantID(restaurantID, { onlyActive, includeDishes = false } = {}) {
        const where = { restaurantID };
        if (onlyActive) where.status = true;

        const include = [];
        if (includeDishes) {
            include.push({
                model: dish,
                as: 'dishes',
                attributes: ['dishID','restaurantID','name','imageURL','categoryID'],
                through: { attributes: [] }
            });
        }

        const rows = await menu.findAll({
            where,
            attributes: ['menuID','restaurantID','name','price','imageURL','status'],
            include,
            order: [['menuID','ASC']]
        });
        return toDTOs(rows);
    }

    static async getByID(menuID, { includeDishes = false } = {}) {
        const include = [];
        if (includeDishes) {
            include.push({
                model: dish,
                as : 'dishes',
                attributes: ['dishID','restaurantID','name','imageURL','categoryID'],
                through: { attributes: [] }
            });
        }
        const r = await menu.findByPk(menuID, {
            attributes: ['menuID','restaurantID','name','price','imageURL','status'],
            include
        });
        return toDTO(r);
    }

    static async createMenu({ restaurantID, name, price, imageURL, status = true, dishIDs = [] }) {
        return await sequelize.transaction(async (t) => {
            const m = await menu.create({ restaurantID, name, price, imageURL, status }, { transaction: t });

            if (dishIDs && dishIDs.length) {
                // Validate dishes belong to the same restaurant
                const rows = await dish.findAll({
                    where: { dishID: { [Op.in]: dishIDs }, restaurantID },
                    attributes: ['dishID'],
                    transaction: t
                });
                const foundIDs = new Set(rows.map(r => r.dishID));
                const missing = dishIDs.filter(id => !foundIDs.has(id));
                if (missing.length) {
                    throw new Error(`Some dishes do not belong to restaurant ${restaurantID}: [${missing.join(', ')}]`);
                }
                // Bulk link
                const bulk = dishIDs.map(dishID => ({ menuID: m.menuID, dishID }));
                await dishmenu.bulkCreate(bulk, { transaction: t, ignoreDuplicates: true });
            }

            return { menuID: m.menuID, restaurantID: m.restaurantID, name: m.name, price: m.price, imageURL: m.imageURL, status: m.status };
        });
    }

    static async updateMenu(menuID, patch) {
        const { name, price, imageURL, status, dishIDs } = patch || {};

        return await sequelize.transaction(async (t) => {
            // Update core fields only if provided, avoid overwriting with undefined
            const toUpdate = {};
            if (name !== undefined) toUpdate.name = name;
            if (price !== undefined) toUpdate.price = price;
            if (imageURL !== undefined) toUpdate.imageURL = imageURL;
            if (status !== undefined) toUpdate.status = status;

            if (Object.keys(toUpdate).length > 0) {
                await menu.update(toUpdate, { where: { menuID }, transaction: t });
            }

            // Sync dishes if dishIDs is provided (even empty array means clear)
            if (dishIDs !== undefined) {
                // Get menu to retrieve restaurantID for validation
                const m = await menu.findByPk(menuID, { attributes: ['menuID','restaurantID'], transaction: t });
                if (!m) throw new Error('Menu not found');

                // Validate dishes belong to the same restaurant
                if (Array.isArray(dishIDs) && dishIDs.length > 0) {
                    const rows = await dish.findAll({
                        where: { dishID: { [Op.in]: dishIDs }, restaurantID: m.restaurantID },
                        attributes: ['dishID'],
                        transaction: t
                    });
                    const foundIDs = new Set(rows.map(r => r.dishID));
                    const missing = dishIDs.filter(id => !foundIDs.has(id));
                    if (missing.length) {
                        throw new Error(`Some dishes do not belong to restaurant ${m.restaurantID}: [${missing.join(', ')}]`);
                    }
                }

                // Clear existing links and insert new ones
                await dishmenu.destroy({ where: { menuID }, transaction: t });
                if (Array.isArray(dishIDs) && dishIDs.length > 0) {
                    const bulk = dishIDs.map(dishID => ({ menuID, dishID }));
                    await dishmenu.bulkCreate(bulk, { transaction: t, ignoreDuplicates: true });
                }
            }

            return true;
        });
    }

    static async deleteMenu(menuID) {
        const count = await menu.destroy({ where: { menuID } });
        return count > 0;
    }

    static async getByDishID(dishID) {
        const rows = await dishmenu.findAll({ where: { dishID }, attributes: ['menuID','dishID'] });
        return toDTOs(rows);
    }
    static async addDishMenu(dishID, menuID) {
        const dm = await dishmenu.create({ dishID, menuID }); 
        return { menuID: dm.menuID, dishID: dm.dishID };
    }

}