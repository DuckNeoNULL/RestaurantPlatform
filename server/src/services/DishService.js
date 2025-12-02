import DishDAO from '../dao/DishDAO.js';
import RestaurantDAO from '../dao/RestaurantDAO.js';

class DishService {
  static async addDishForPartner(actorUserId, { restaurantID, categoryID, name, imageURL, status }) {
    if (!restaurantID) throw new Error('restaurantID required');
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    return await DishDAO.addDish(restaurantID, categoryID, name, imageURL, status ?? 1);
  }

  static async updateDishForPartner(actorUserId, dishID, patch) {
    const dish = await DishDAO.getByID(dishID);
    if (!dish) throw new Error('Dish not found');
    const r = await RestaurantDAO.getByID(dish.restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    // Only allow columns that exist in schema
    const allowed = {};
    if (patch.name !== undefined) allowed.name = patch.name;
    if (patch.categoryID !== undefined) allowed.categoryID = patch.categoryID;
    if (patch.imageURL !== undefined) allowed.imageURL = patch.imageURL;
    if (patch.status !== undefined) allowed.status = patch.status;

    await DishDAO.updateDish(dishID, allowed);
    return await DishDAO.getByID(dishID);
  }

  static async deleteDishForPartner(actorUserId, dishID) {
    const dish = await DishDAO.getByID(dishID);
    if (!dish) throw new Error('Dish not found');
    const r = await RestaurantDAO.getByID(dish.restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    return await DishDAO.deleteDish(dishID);
  }

  static async listByRestaurant(restaurantID) {
    return await DishDAO.getByRestaurantID(restaurantID);
  }
}

export default DishService;
