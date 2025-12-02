import MenuDAO from '../dao/MenuDAO.js';
import RestaurantDAO from '../dao/RestaurantDAO.js';

class MenuService {
  static async createMenuForPartner(actorUserId, payload) {
    const { restaurantID, name, price, imageURL, status, dishIDs } = payload;
    if (!restaurantID) throw new Error('restaurantID required');
    // verify ownership
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    const created = await MenuDAO.createMenu({ restaurantID, name, price, imageURL, status, dishIDs });
    // Return with dishes included so FE has menuID and dishIDs context
    return await MenuDAO.getByID(created.menuID, { includeDishes: true });
  }

  static async updateMenuForPartner(actorUserId, menuID, patch) {
    // fetch menu to get restaurantID
    const menu = await MenuDAO.getByID(menuID, { includeDishes: false });
    if (!menu) throw new Error('Menu not found');
    const r = await RestaurantDAO.getByID(menu.restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    await MenuDAO.updateMenu(menuID, patch);
    // Return with dishes included for convenience after update
    return await MenuDAO.getByID(menuID, { includeDishes: true });
  }

  static async deleteMenuForPartner(actorUserId, menuID) {
    const menu = await MenuDAO.getByID(menuID, { includeDishes: false });
    if (!menu) throw new Error('Menu not found');
    const r = await RestaurantDAO.getByID(menu.restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    return await MenuDAO.deleteMenu(menuID);
  }

  static async listByRestaurant(restaurantID, { onlyActive = false, includeDishes = true } = {}) {
    return await MenuDAO.getByRestaurantID(restaurantID, { onlyActive, includeDishes });
  }

  static async getById(menuID, { includeDishes = true } = {}) {
    return await MenuDAO.getByID(menuID, { includeDishes });
  }
}

export default MenuService;
