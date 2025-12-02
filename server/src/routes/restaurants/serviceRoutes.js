import express from 'express';
import ServiceController from '../../controllers/ServiceController.js';
import { authMiddleware, ensurePartner } from '../../middlewares/jwtToken.js';

const router = express.Router();

router.post('/', authMiddleware, ensurePartner, ServiceController.create);
router.put('/:id', authMiddleware, ensurePartner, ServiceController.update);
router.delete('/:id', authMiddleware, ensurePartner, ServiceController.delete);
router.get('/restaurant/:restaurantId', ServiceController.listByRestaurant);
export default router;
