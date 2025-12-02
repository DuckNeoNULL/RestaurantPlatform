import { Router } from "express";
import PayoutController from "../controllers/PayoutController.js";

const router = Router();

// Create a payout
router.post("/", PayoutController.create);

// List
router.get("/partner/:partnerID", PayoutController.listByPartner);
router.get("/payment/:paymentId", PayoutController.listByPayment);
router.get("/status", PayoutController.listByStatus); // ?status=PENDING&status=COMPLETED

// Update
router.patch("/:payoutId/status", PayoutController.updateStatus);
router.patch("/:payoutId/release", PayoutController.markReleased);

export default router;
