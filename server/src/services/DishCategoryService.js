import DishCategoryDAO from '../dao/DishCategoryDAO.js';
import RestaurantDAO from '../dao/RestaurantDAO.js';

class DishCategoryService {
  static async createForPartner(actorUserId, { name, restaurantID, requiredQuantity = 1, status = true }) {
    if (!restaurantID) throw new Error('restaurantID required');
    if (!name) throw new Error('name required');
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    return await DishCategoryDAO.addDishCategory({ name, restaurantID, requiredQuantity, status });
  }

  static async updateForPartner(actorUserId, categoryID, patch) {
    const dc = await DishCategoryDAO.getByID(categoryID);
    if (!dc) throw new Error('DishCategory not found');
    const r = await RestaurantDAO.getByID(dc.restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    // Only allow updatable fields
    const allowed = {};
    if (patch.name !== undefined) allowed.name = patch.name;
    if (patch.requiredQuantity !== undefined) allowed.requiredQuantity = patch.requiredQuantity;
    if (patch.status !== undefined) allowed.status = patch.status;

    await DishCategoryDAO.updateDishCategory(categoryID, allowed);
    return await DishCategoryDAO.getByID(categoryID);
  }

  static async deleteForPartner(actorUserId, categoryID) {
    const dc = await DishCategoryDAO.getByID(categoryID);
    if (!dc) throw new Error('DishCategory not found');
    const r = await RestaurantDAO.getByID(dc.restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    return await DishCategoryDAO.deleteDishCategory(categoryID);
  }

  static async listByRestaurant(restaurantID) {
    return await DishCategoryDAO.getByRestaurantID(restaurantID);
  }
}

export default DishCategoryService;
