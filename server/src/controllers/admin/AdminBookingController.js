// src/controllers/admin/AdminBookingController.js
import AdminBookingService from "../../services/admin/AdminBookingService.js";

class AdminBookingController {
  // GET /api/admin/bookings
  static async getAllBookings(req, res) {
    try {
      const data = await AdminBookingService.getAllBookings();
      return res.json({ success: true, data });
    } catch (err) {
      console.error("Admin getAllBookings:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/admin/bookings/:id
  static async getBookingDetail(req, res) {
    try {
      const { id } = req.params;
      const data = await AdminBookingService.getBookingDetail(id);

      if (!data)
        return res.status(404).json({ success: false, message: "Booking not found" });

      return res.json({ success: true, data });
    } catch (err) {
      console.error("Admin getBookingDetail:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // PUT /api/admin/bookings/:id/status
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await AdminBookingService.updateStatus(id, status);

      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error("Admin updateStatus:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // DELETE /api/admin/bookings/:id
  static async deleteBooking(req, res) {
    try {
      const { id } = req.params;

      const ok = await AdminBookingService.deleteBooking(id);
      if (!ok) return res.status(404).json({ success: false, message: "Not found" });

      return res.json({ success: true, message: "Deleted" });
    } catch (err) {
      console.error("Admin deleteBooking:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default AdminBookingController;
