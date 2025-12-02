import express from 'express';
import DishCategoryController from '../../controllers/DishCategoryController.js';
import { authMiddleware, ensurePartner } from '../../middlewares/jwtToken.js';

const router = express.Router();

router.post('/', authMiddleware, ensurePartner, DishCategoryController.create);
router.put('/:id', authMiddleware, ensurePartner, DishCategoryController.update);
router.delete('/:id', authMiddleware, ensurePartner, DishCategoryController.delete);
router.get('/restaurant/:restaurantId', DishCategoryController.listByRestaurant);

export default router;
