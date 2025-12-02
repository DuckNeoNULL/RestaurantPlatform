import { Router } from "express";
import { authenticateJWT, ensureCustomer, ensurePartner } from "../middlewares/jwtToken.js";
import BookingController from "../controllers/BookingController.js";
import PaymentController from "../controllers/PaymentController.js"; // ✅ thêm dòng này
import BookingStatus from "../models/enums/BookingStatus.js";
const router = Router();

// ======================
// 📌 Booking CRUD Routes
// ======================

// ⚠️ Route customer phải đặt TRÊN ":id"
router.get("/customer/:customerID", BookingController.getBookingsByCustomerId);
router.get("/restaurant/:restaurantID", BookingController.getBookingsByRestaurantId);

router.get("/", BookingController.getAllBookings);
// Authenticated customer gets own bookings
router.get('/me', authenticateJWT, ensureCustomer, BookingController.getMyBookings);
// Partner fetch own bookings (restaurants owned)
router.get('/partner/me', authenticateJWT, ensurePartner, BookingController.getBookingsByCurrentPartner);
router.get("/:id", BookingController.getBookingById);
router.post("/", BookingController.createBooking);
// Create manual/external booking (partner only)
router.post('/manual', authenticateJWT, ensurePartner, BookingController.createManualBooking);
router.put("/:id", BookingController.updateBooking);
router.delete("/:id", BookingController.deleteBooking);



// Partner accept booking
router.patch('/:id/partner/accept', authenticateJWT, ensurePartner, (req, res, next) => {
  req.body = req.body || {};
  req.body.status = BookingStatus.ACCEPTED;
  next();
}, BookingController.acceptByPartner);

// Generic status change endpoint (use role-based checks in controller)
router.put('/:id/status', authenticateJWT, BookingController.updateBookingStatus);
// Partner reject booking
router.patch('/:id/partner/reject', authenticateJWT, ensurePartner, (req, res, next) => {
  req.body = req.body || {};
  req.body.status = BookingStatus.REJECTED;
  next();
}, BookingController.updateBookingStatus);

router.patch('/:id/customer/cancel', authenticateJWT, ensureCustomer, (req, res, next) => {
  req.body = req.body || {};
  req.body.status = BookingStatus.CANCELLED;
  next();
}, BookingController.updateBookingStatus);

router.patch('/:id/customer/confirm', authenticateJWT, ensureCustomer, (req, res, next) => {
  req.body = req.body || {};
  req.body.status = BookingStatus.CONFIRMED;
  next();
}, BookingController.updateBookingStatus);

// ======================
// 💳 PayOS Payment Routes
// ======================
router.post(
  "/:bookingID/payment/payos",
  authenticateJWT,
  PaymentController.createPayosCheckout
);

router.post("/payment/payos/webhook", PaymentController.payosWebhook);

router.get(
  "/payment/payos/status/:orderCode",
  authenticateJWT,
  PaymentController.getPayosStatus
);

export default router;
