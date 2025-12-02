import AmenityDAO from '../dao/AmenityDAO.js';
import RestaurantDAO from '../dao/RestaurantDAO.js';

class AmenityService {
  static async listAll() {
    return await AmenityDAO.getAll();
  }

  static async getByID(id) {
    return await AmenityDAO.getByID(id);
  }

  // Admin only: create global amenity
  static async createAmenity(data) {
    const { name, description } = data;
    if (!name) throw new Error('name is required');
    return await AmenityDAO.addAmenity(name, description);
  }

  // Partner: assign an existing amenity to a restaurant
  static async assignAmenityToRestaurant(restaurantID, amenityID, actorUserId) {
    // ensure restaurant belongs to actorUserId
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) {
      throw new Error('Not authorized to modify this restaurant');
    }
    return await AmenityDAO.addAmenityToRestaurant(restaurantID, amenityID);
  }

  static async removeAmenityFromRestaurant(restaurantID, amenityID, actorUserId) {
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) {
      throw new Error('Not authorized to modify this restaurant');
    }
    return await AmenityDAO.removeAmenityFromRestaurant(restaurantID, amenityID);
  }

  static async listForRestaurant(restaurantID) {
    return await AmenityDAO.getAmenitiesByRestaurantID(restaurantID);
  }
}

export default AmenityService;
