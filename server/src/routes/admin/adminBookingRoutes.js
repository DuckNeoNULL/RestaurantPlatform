// src/routes/admin/adminBookingRoutes.js
import { Router } from "express";
import AdminBookingController from "../../controllers/admin/AdminBookingController.js";

const router = Router();

/**
 * ⚠️ Lưu ý:
 * Bạn CHƯA có chức năng login admin nên không có token.
 * Vì vậy tạm thời bỏ authenticateJWT + ensureAdmin.
 * Sau khi bạn làm xong login admin → bật lại để bảo mật.
 */

// ======================
// 📌 ADMIN BOOKING ROUTES
// ======================

// GET /api/admin/bookings - Lấy danh sách tất cả booking
router.get("/", AdminBookingController.getAllBookings);

// GET /api/admin/bookings/:id - Lấy chi tiết booking
router.get("/:id", AdminBookingController.getBookingDetail);

// PUT /api/admin/bookings/:id/status - Admin cập nhật trạng thái booking
router.put("/:id/status", AdminBookingController.updateStatus);

// DELETE /api/admin/bookings/:id - Admin xóa booking
router.delete("/:id", AdminBookingController.deleteBooking);

export default router;
