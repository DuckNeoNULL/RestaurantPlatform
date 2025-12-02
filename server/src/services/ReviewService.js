import ReviewDAO from '../dao/ReviewDAO.js';
import BookingDAO from '../dao/BookingDAO.js';

class ReviewService {
  /**
   * Create a review for a booking. actorUserId should be the customer creating the review.
   * If restaurantID is provided, verify the booking belongs to that restaurant.
   */
  static async createReviewForRestaurant({ restaurantID, bookingID, rating = null, comment = null }, actorUserId) {
    if (!bookingID) throw new Error('bookingID is required');
    // load booking details to verify ownership and restaurant
    const booking = await BookingDAO.getBookingDetails(bookingID);
    if (!booking) throw new Error('Booking not found');

    // ensure the actor is the customer who made the booking
    const bookingCustomerID = booking.customer?.customerID ?? booking.customerID;
    if (String(bookingCustomerID) !== String(actorUserId)) {
      throw new Error('Not authorized to review this booking');
    }

    // if restaurantID provided, verify booking belongs to that restaurant
    if (restaurantID) {
      const bookingRestaurantID = booking.hall?.restaurant?.restaurantID ?? booking.restaurantID;
      if (String(bookingRestaurantID) !== String(restaurantID)) {
        throw new Error('Booking does not belong to the specified restaurant');
      }
    }

    const derivedRestaurantID = booking.hall?.restaurant?.restaurantID ?? booking.restaurantID ?? restaurantID ?? null;
    const created = await ReviewDAO.createReview({ bookingID, customerID: actorUserId, rating, comment, restaurantID: derivedRestaurantID });
    return created;
  }

  static async getByBookingID(bookingID) {
    return await ReviewDAO.getByBookingID(bookingID);
  }

  static async listForRestaurant(restaurantID) {
    // Prefer direct filtering by review.restaurantID; fallback to join method if empty
    const direct = await ReviewDAO.getByRestaurantID(restaurantID);
    if (direct && direct.length) return direct;
    return await ReviewDAO.getForRestaurantWithDetails(restaurantID);
  }

  static async updateReview(reviewID, patch, actorUserId, isAdmin = false) {
    const r = await ReviewDAO.getByID(reviewID);
    if (!r) throw new Error('Review not found');
    if (!isAdmin && String(r.customerID) !== String(actorUserId)) throw new Error('Not authorized');
    return await ReviewDAO.updateReview(reviewID, patch);
  }

  static async deleteReview(reviewID, actorUserId, isAdmin = false) {
    const r = await ReviewDAO.getByID(reviewID);
    if (!r) throw new Error('Review not found');
    if (!isAdmin && String(r.customerID) !== String(actorUserId)) throw new Error('Not authorized');
    return await ReviewDAO.deleteReview(reviewID);
  }
}

export default ReviewService;
