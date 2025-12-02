import EmailService from "./EmailServices.js";

class NotificationService {
  /**
   * Gửi thông báo khi có thay đổi trạng thái Booking
   * @param {Object} param0
   * @param {string} param0.bookingID
   * @param {string} param0.customerEmail
   * @param {string} param0.partnerEmail
   * @param {number} param0.status - BookingStatus enum
   */
  async sendBookingStatusChange({ bookingID, customerEmail, partnerEmail, status }) {
    // Only send notifications to customers. Partner notifications are disabled.
    if (!customerEmail) {
      console.log(`No customer email for booking ${bookingID}; skipping notification.`);
      return { success: true, sentTo: 'none' };
    }

    const subject = `Cập nhật đơn đặt tiệc #${bookingID}`;
    const html = `<p>Đơn đặt tiệc <b>${bookingID}</b> đã được cập nhật trạng thái: <b>${status}</b></p>`;
    await EmailService.sendMail(customerEmail, subject, html);
    console.log(`📩 Notification sent for booking ${bookingID} (target: customer)`);
    return { success: true, sentTo: 'customer' };
  }

  async sendCustomMail(to, subject, html) {
    if (!to) throw new Error("Recipient email is required.");
    await EmailService.sendMail(to, subject, html);
  }
}

export default new NotificationService();
