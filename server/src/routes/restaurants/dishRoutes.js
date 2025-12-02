import express from 'express';
import DishController from '../../controllers/DishController.js';
import { authMiddleware, ensurePartner } from '../../middlewares/jwtToken.js';

const router = express.Router();

router.post('/', authMiddleware, ensurePartner, DishController.create);
router.put('/:id', authMiddleware, ensurePartner, DishController.update);
router.delete('/:id', authMiddleware, ensurePartner, DishController.delete);
router.get('/restaurant/:restaurantId', DishController.listByRestaurant);

export default router;
