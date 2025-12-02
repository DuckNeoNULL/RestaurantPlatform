import AmenityDAO from "../dao/AmenityDAO.js";

class AmenityServices {
  static async getAll() {
    return await AmenityDAO.getAll();
  }

  static async getByID(amenityID) {
    return await AmenityDAO.getByID(amenityID);
  }

  static async getAmenitiesByRestaurant(restaurantID) {
    return await AmenityDAO.getAmenitiesByRestaurantID(restaurantID);
  }
}

export default AmenityServices;
