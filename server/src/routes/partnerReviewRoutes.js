import { Router } from "express";
import PartnerReviewController from "../controllers/partner/PartnerReviewController.js";

const router = Router();

// GET /api/partners/:partnerID/reviews
router.get("/:partnerID/reviews", PartnerReviewController.listByPartner);

export default router;
