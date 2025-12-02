import EventTypeDAO from '../dao/EventTypeDAO.js';
import RestaurantDAO from '../dao/RestaurantDAO.js';

class EventTypeService {
  static async listAll() {
    return await EventTypeDAO.getAll();
  }

  static async createEventType(data) {
    const { name } = data;
    if (!name) throw new Error('name required');
    return await EventTypeDAO.addEventType(name);
  }

  static async assignEventTypeToRestaurant(restaurantID, eventTypeID, actorUserId) {
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) {
      throw new Error('Not authorized to modify this restaurant');
    }
    return await EventTypeDAO.addEventTypeToRestaurant(restaurantID, eventTypeID);
  }

  static async removeEventTypeFromRestaurant(restaurantID, eventTypeID, actorUserId) {
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) {
      throw new Error('Not authorized to modify this restaurant');
    }
    return await EventTypeDAO.removeEventTypeFromRestaurant(restaurantID, eventTypeID);
  }

  static async listForRestaurant(restaurantID) {
    return await EventTypeDAO.getAllByRestaurantID(restaurantID);
  }
}

export default EventTypeService;
