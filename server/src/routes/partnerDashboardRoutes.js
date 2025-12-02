import { Router } from "express";
import PartnerDashboardController from "../controllers/PartnerDashboardController.js";

const router = Router();

// Base: /api/dashboard/partner
router.get("/:partnerID/revenue", PartnerDashboardController.revenue);
router.get("/:partnerID/bookings", PartnerDashboardController.bookings);
router.get("/:partnerID/customers", PartnerDashboardController.customers);
router.get("/:partnerID/restaurants", PartnerDashboardController.restaurants);

export default router;
