import express from 'express';
import ReviewController from '../../controllers/ReviewController.js';
import { authMiddleware, ensureCustomer } from '../../middlewares/jwtToken.js';

const router = express.Router({ mergeParams: true });

// List reviews for a restaurant
router.get('/', ReviewController.listForRestaurant);

// Get reviews for a specific booking
router.get('/booking/:bookingID', ReviewController.getByBooking);

// Create a review (customer only)
router.post('/', authMiddleware, ensureCustomer, ReviewController.createForRestaurant);

// Update / delete (customer who created the review or admin)
router.put('/:id', authMiddleware, ensureCustomer, ReviewController.update);
router.delete('/:id', authMiddleware, ensureCustomer, ReviewController.delete);

export default router;
