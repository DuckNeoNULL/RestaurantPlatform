import express from 'express';
import MenuController from '../../controllers/MenuController.js';
import { authMiddleware, ensurePartner } from '../../middlewares/jwtToken.js';

const router = express.Router();

// Partner endpoints
router.post('/', authMiddleware, ensurePartner, MenuController.create);
router.put('/:id', authMiddleware, ensurePartner, MenuController.update);
router.delete('/:id', authMiddleware, ensurePartner, MenuController.delete);

// Public: list menus by restaurant
router.get('/restaurant/:restaurantId', MenuController.listByRestaurant);
// Public: get one menu with dishes
router.get('/:id', MenuController.getById);

export default router;
