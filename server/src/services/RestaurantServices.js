import RestaurantDAO from "../dao/RestaurantDAO.js";
import RestaurantImageDAO from "../dao/RestaurantImageDAO.js";
import BookingDAO from "../dao/BookingDAO.js";
import EventTypeDAO from "../dao/EventTypeDAO.js";
import AmenityDAO from "../dao/AmenityDAO.js";
class RestaurantService {
  static async getAll() {
    return await RestaurantDAO.getAll();
  }

  static async getByPartnerID(restaurantPartnerID) {
    if (!restaurantPartnerID) throw new Error("Missing partnerID");
    return await RestaurantDAO.getByPartnerID(Number(restaurantPartnerID));
  }

  static async getAvailable() {
    return await RestaurantDAO.getAvailable();
  }

  static async getByID(restaurantID) {
    return await RestaurantDAO.getByID(restaurantID);
  }

  static async getSummaryByID(restaurantID) {
    return await RestaurantDAO.getSummaryByID(restaurantID);
  }

  static async create(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid payload");
    }
    const { name, restaurantPartnerID, address, thumbnailURL, phone } = data;
    if (!name || !restaurantPartnerID) {
      throw new Error("Restaurant name and restaurantPartnerID are required");
    }
    if (!thumbnailURL || typeof thumbnailURL !== "string") {
      throw new Error("thumbnailURL is required");
    }
    if (!address || typeof address !== "object") {
      throw new Error("address is required with { number, street, ward }");
    }
    const { number, street, ward } = address;
    if (!number || !street || !ward) {
      throw new Error(
        "address.number, address.street and address.ward are required"
      );
    }
    return await RestaurantDAO.createRestaurant(data);
  }

  static async update(restaurantID, data){
    // validate phone if present
  
    if (data && Object.prototype.hasOwnProperty.call(data, 'phone')) {
      const phone = data.phone;
      if (phone !== null && phone !== undefined && typeof phone !== 'string') {
        throw new Error('phone must be a string');
      }
    }
  
    // Extract eventTypes & amenities (arrays of IDs) if provided
    const { eventTypes, amenities, ...patch } = data || {};
    const updated = await RestaurantDAO.updateRestaurant(restaurantID, patch);
    // If eventTypes specified, replace the mapping
    if (Array.isArray(eventTypes)) {
      await EventTypeDAO.setEventTypesForRestaurant(restaurantID, eventTypes);
    }
    // If amenities specified, replace the mapping
    if (Array.isArray(amenities)) {
      await AmenityDAO.setAmenitiesForRestaurant(restaurantID, amenities);
    }
    // refetch full to include updated relations if any
    if (Array.isArray(eventTypes) || Array.isArray(amenities)) {
      return await RestaurantDAO.getByID(restaurantID);
    }
    return updated;
  }

  static async changeRestaurantStatus(id) {
    return await RestaurantDAO.toggleRestaurantStatus(id);
  }

  static async addImage(restaurantID, imageURL) {
    if (!restaurantID) throw new Error("restaurantID is required");
    if (!imageURL || typeof imageURL !== "string")
      throw new Error("imageURL is required");
    return await RestaurantImageDAO.addImage(restaurantID, imageURL);
  }

  static async deleteImage(imageID) {
    if (!imageID) throw new Error("imageID is required");
    return await RestaurantImageDAO.deleteImage(imageID);
  }

  static async search(filter) {
    console.log("🔧 [RestaurantService] Final search filter:", filter);
    return await RestaurantDAO.search(filter);
  }
  static async getTopBookedRestaurants() {
    const result = await BookingDAO.getTopBookedRestaurants();
    // from result get restaurant details can add cron job to cache this later
    const restaurantIDs = result.map(r => r.restaurantID);
    const restaurants = await Promise.all(restaurantIDs.map(id => RestaurantDAO.getByID(id)));
    // Filter out nulls in case some restaurants were removed or unavailable
    return restaurants.filter(Boolean);
  }
  static async getTopRatedRestaurants() {
    const result = await BookingDAO.topRatedRestaurantReview();
    // from result get restaurant details can add cron job to cache this later
    const restaurantIDs = result.map(r => r.restaurantID);
    const restaurants = await Promise.all(restaurantIDs.map(id => RestaurantDAO.getByID(id)));
    // Filter out nulls in case some restaurants were removed or unavailable
    return restaurants.filter(Boolean);
  }
}
export default RestaurantService;
