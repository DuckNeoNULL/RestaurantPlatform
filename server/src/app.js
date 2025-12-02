import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import hallRoutes from "./routes/hallRoutes.js";
import aiSuggestRoutes from "./routes/aiSuggestRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/PaymentRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import amenityRoutes from "./routes/AmenityRoutes.js";
import eventTypeRoutes from "./routes/eventTypeRoutes.js";
import bankAccountRoutes from "./routes/restaurants/bankAccountRoutes.js";
import menuRoutes from "./routes/restaurants/menuRoutes.js";
import dishRoutes from "./routes/restaurants/dishRoutes.js";
import dishCategoryRoutes from "./routes/restaurants/dishCategoryRoutes.js";
import promotionRoutes from "./routes/restaurants/promotionRoutes.js";
import serviceRoutes from "./routes/restaurants/serviceRoutes.js";
import reviewRoutes from "./routes/restaurants/reviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminBookingRoutes from "./routes/admin/adminBookingRoutes.js";
import adminPaymentRoutes from "./routes/admin/adminPaymentRoutes.js";
import adminReviewRoutes from "./routes/admin/adminReviewRoutes.js";
import adminReportRoutes from "./routes/admin/adminReportRoutes.js";
import adminUserRoutes from "./routes/admin/adminUserRoutes.js";
import partnerReviewRoutes from "./routes/partnerReviewRoutes.js";
import partnerDashboardRoutes from "./routes/partnerDashboardRoutes.js";
import payoutRoutes from "./routes/PayoutRoutes.js";

import wardRoutes from "./routes/wardRoutes.js";
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory (contracts, images, etc.)
const uploadsDir = path.resolve(process.cwd(), 'server', 'uploads');
console.log('📁 [app.js] Static files directory:', uploadsDir);
app.use("/uploads", express.static(uploadsDir, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    console.log('📄 [static] Serving file:', filePath);
  }
}));

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/ai", aiSuggestRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/eventtypes", eventTypeRoutes);
// Nested restaurant-scoped mounts (non-breaking: keep top-level mounts)
// app.use("/api/restaurants/:restaurantId/amenities", amenityRoutes);
// app.use("/api/restaurants/:restaurantId/eventtypes", eventTypeRoutes);
app.use("/api/bankaccounts", bankAccountRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/dishcategories", dishCategoryRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/restaurants/:restaurantId/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);


app.use("/api/admin/users", adminUserRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/partners", partnerReviewRoutes);
app.use("/api/dashboard/partner", partnerDashboardRoutes);
app.use("/api/wards", wardRoutes);

export default app;
