import express from 'express';
import PromotionController from '../../controllers/PromotionController.js';
import { authMiddleware, ensurePartner } from '../../middlewares/jwtToken.js';

const router = express.Router();

router.get('/', PromotionController.list);
router.post('/', authMiddleware, ensurePartner, PromotionController.create);
router.put('/:id', authMiddleware, ensurePartner, PromotionController.update);
router.delete('/:id', authMiddleware, ensurePartner, PromotionController.delete);
router.get('/restaurant/:restaurantId', PromotionController.listByRestaurant);
router.get('/:id/services', PromotionController.services);

export default router;
