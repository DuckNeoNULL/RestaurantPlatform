import ReviewService from '../services/ReviewService.js';
import { authMiddleware, ensureCustomer } from '../middlewares/jwtToken.js';

class ReviewController {
  // POST /api/restaurants/:restaurantId/reviews
  static async createForRestaurant(req, res) {
    try {
      const restaurantID = req.params.restaurantId || req.params.restaurantID;
      const { bookingID, rating, comment } = req.body;
      const actor = req.user?.userId;
      const created = await ReviewService.createReviewForRestaurant({ restaurantID, bookingID, rating, comment }, actor);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/restaurants/:restaurantId/reviews
  static async listForRestaurant(req, res) {
    try {
      const restaurantID = req.params.restaurantId || req.params.restaurantID;
      if (!restaurantID) return res.status(400).json({ error: 'restaurantId required' });
      const data = await ReviewService.listForRestaurant(restaurantID);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // GET /api/restaurants/:restaurantId/reviews/booking/:bookingID
  static async getByBooking(req, res) {
    try {
      const { bookingID } = req.params;
      const data = await ReviewService.getByBookingID(bookingID);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // PUT /api/restaurants/:restaurantId/reviews/:id
  static async update(req, res) {
    try {
      const reviewID = req.params.id;
      const patch = req.body;
      const actor = req.user?.userId;
      const isAdmin = req.user?.role === 'admin';
      const ok = await ReviewService.updateReview(reviewID, patch, actor, isAdmin);
      res.json({ success: !!ok });
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  // DELETE /api/restaurants/:restaurantId/reviews/:id
  static async delete(req, res) {
    try {
      const reviewID = req.params.id;
      const actor = req.user?.userId;
      const isAdmin = req.user?.role === 'admin';
      const ok = await ReviewService.deleteReview(reviewID, actor, isAdmin);
      res.json({ success: !!ok });
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }
}

export default ReviewController;
