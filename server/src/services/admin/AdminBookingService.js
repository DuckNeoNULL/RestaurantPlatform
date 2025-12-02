// src/services/admin/AdminBookingService.js
import AdminBookingDAO from "../../dao/admin/AdminBookingDAO.js";

class AdminBookingService {
  static async getAllBookings() {
    return await AdminBookingDAO.getAllBookings();
  }

  static async getBookingDetail(id) {
    return await AdminBookingDAO.getBookingDetail(id);
  }

  static async updateStatus(id, status) {
    return await AdminBookingDAO.updateStatus(id, status);
  }

  static async deleteBooking(id) {
    return await AdminBookingDAO.deleteBooking(id);
  }
}

export default AdminBookingService;
