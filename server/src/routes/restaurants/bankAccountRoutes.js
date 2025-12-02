import express from 'express';
import BankAccountController from '../../controllers/BankAccountController.js';
import { authMiddleware, ensurePartner } from '../../middlewares/jwtToken.js';

const router = express.Router();

// All routes require authenticated partner
router.post('/', authMiddleware, ensurePartner, BankAccountController.create);
router.get('/', authMiddleware, ensurePartner, BankAccountController.list);
router.get('/:id', authMiddleware, ensurePartner, BankAccountController.get);
router.put('/:id', authMiddleware, ensurePartner, BankAccountController.update);
router.delete('/:id', authMiddleware, ensurePartner, BankAccountController.delete);

export default router;
