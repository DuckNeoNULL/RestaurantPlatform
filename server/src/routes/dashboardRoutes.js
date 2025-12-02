import express from "express";
import DashboardController from "../controllers/DashboardController.js";

const router = express.Router();

router.get("/revenue", DashboardController.getRevenueAnalytics);
router.get("/bookings", DashboardController.getBookingAnalytics);
router.get("/partners", DashboardController.getPartnerPerformance);
router.get("/customers", DashboardController.getCustomerAnalytics);
router.get("/system-settings", DashboardController.getSystemSettings);
router.put("/system-settings/:id", DashboardController.updateSystemSetting);

export default router;
