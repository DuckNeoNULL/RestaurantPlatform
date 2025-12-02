import express from 'express';
import EventTypeController from '../controllers/EventTypeController.js';
import { authMiddleware, ensurePartner, ensureAdmin } from '../middlewares/jwtToken.js';

// mergeParams:true so parent route params (restaurantId) are available when mounted nested
const router = express.Router({ mergeParams: true });

router.get('/', EventTypeController.listAll);
router.post('/', authMiddleware, ensureAdmin, EventTypeController.create);
router.post('/assign', authMiddleware, ensurePartner, EventTypeController.assign);
router.post('/unassign', authMiddleware, ensurePartner, EventTypeController.unassign);
router.get('/restaurant/:restaurantID', EventTypeController.listForRestaurant);

export default router;
