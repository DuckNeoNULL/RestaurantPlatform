import { Router } from "express";
import AdminPaymentController from "../../controllers/admin/AdminPaymentController.js";

const router = Router();

// GET /api/admin/payments
router.get("/", AdminPaymentController.getAll);

// GET /api/admin/payments/:id
router.get("/:id", AdminPaymentController.getDetail);

// PUT /api/admin/payments/:id/status
router.put("/:id/status", AdminPaymentController.updateStatus);

export default router;
