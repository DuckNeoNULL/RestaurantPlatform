import { Router } from 'express';
import { authenticateJWT, ensureCustomer, ensurePartner } from '../middlewares/jwtToken.js';
import ContractController from '../controllers/ContractController.js';

const router = Router();

// ====== TEST ENDPOINTS (for Postman testing) - Must be before /:id routes ======
// Generate contract from bookingID (test endpoint - no auth required)
router.post('/test/generate', ContractController.generateTest);
router.get('/test/generate', ContractController.generateTest); // Also support GET

// Get contract by bookingID (no auth required for testing) - Must be before /:id
router.get('/booking/:bookingID', ContractController.getContractByBooking);

// Serve/download contract file - Must be before /:id routes
router.get('/:id/file', ContractController.serveContractFile);

// ====== PRODUCTION ENDPOINTS ======
// Customer signs (uploads signed file) - allowed only after booking DEPOSITED
router.post('/:id/customer/sign', authenticateJWT, ensureCustomer, ContractController.signContract);

// Partner uploads signed contract (optional)
router.post('/:id/partner/upload', authenticateJWT, ensurePartner, ContractController.partnerUpload);

// Get contract by ID (no auth required for testing) - Must be last
router.get('/:id', ContractController.getContract);

export default router;
