import express from 'express';
import WardController from '../controllers/WardController.js';

const router = express.Router();

// GET /api/wards - Lấy danh sách tất cả các wards
router.get('/', WardController.getAllWards);

export default router;

