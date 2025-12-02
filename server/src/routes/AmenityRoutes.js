import express from 'express';
import AmenityController from '../controllers/AmenityController.js';
import { authMiddleware, ensurePartner, ensureAdmin } from '../middlewares/jwtToken.js';

// mergeParams:true so parent route params (restaurantId) are available when mounted nested
const router = express.Router({ mergeParams: true });

// Public: list all global amenities
router.get('/', AmenityController.listAll);

// Admin: create global amenity
router.post('/', authMiddleware, ensureAdmin, AmenityController.create);

// Partner: assign/unassign amenity to their restaurant
export default router;
