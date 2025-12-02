import PaymentDAO from "../../dao/PaymentDAO.js";
import PayoutsDAO from "../../dao/PayoutsDAO.js";
import db from "../../config/db.js";

class PaymentService {
  // Payments
  static async createPayment(data, opts = {}) {
    return await PaymentDAO.createPayment(data, opts);
  }

  static async getPaymentsByBooking(bookingID) {
    return await PaymentDAO.getByBookingID(bookingID);
  }

  static async getPaymentsByRestaurant(restaurantID) {
    return await PaymentDAO.getByRestaurantID(restaurantID);
  }

  static async getPaymentsByPartner(restaurantPartnerID) {
    return await PaymentDAO.getByRestaurantPartnerID(restaurantPartnerID);
  }

  static async getPaymentByTransactionRef(transactionRef) {
    return await PaymentDAO.getByTransactionRef(transactionRef);
  }

  static async updatePaymentStatus(paymentID, newStatus) {
    return await PaymentDAO.updatePaymentStatus(paymentID, newStatus);
  }

  static async markPaymentReleased(paymentID, options = {}) {
    return await PaymentDAO.markReleased(paymentID, options);
  }

  static async refundPayment(paymentID, options = {}) {
    return await PaymentDAO.refundPayment(paymentID, options);
  }

  static async getPaymentsByStatus(statusList = []) {
    return await PaymentDAO.getPaymentsByStatus(statusList);
  }

  // Payouts (kept as-is)
  static async createPayout(data, opts = {}) {
    // Validate payment exists and derive restaurantPartnerId if missing
    const { paymentId } = data || {};
    if (!paymentId) throw new Error("paymentId is required");

    const payment = await PaymentDAO.getByID(paymentId);
    if (!payment) throw new Error("Payment not found");

    let { restaurantPartnerId } = data;
    if (!restaurantPartnerId) {
      // derive from restaurant via payment.restaurantID
      const rest = await db.restaurant.findByPk(payment.restaurantID, { attributes: ["restaurantID", "restaurantPartnerID"] });
      if (!rest) throw new Error("Restaurant not found for payment");
      restaurantPartnerId = rest.restaurantPartnerID;
    } else {
      // Optional: ensure provided partner matches the payment's restaurant owner
      const rest = await db.restaurant.findByPk(payment.restaurantID, { attributes: ["restaurantPartnerID"] });
      if (!rest) throw new Error("Restaurant not found for payment");
      if (Number(restaurantPartnerId) !== Number(rest.restaurantPartnerID)) {
        throw new Error("restaurantPartnerId does not match payment's restaurant owner");
      }
    }

    return await PayoutsDAO.createPayout({ ...data, restaurantPartnerId }, opts);
  }

  static async getPayoutsByRestaurantPartnerID(restaurantPartnerId) {
    return await PayoutsDAO.getByRestaurantPartnerID(restaurantPartnerId);
  }

  static async getPayoutsByPaymentID(paymentId) {
    return await PayoutsDAO.getByPaymentID(paymentId);
  }

  static async getPayoutByTransactionRef(transactionRef) {
    return await PayoutsDAO.getByTransactionRef(transactionRef);
  }

  static async updatePayoutStatus(payoutId, newStatus) {
    return await PayoutsDAO.updatePayoutStatus(payoutId, newStatus);
  }

  static async markPayoutReleased(payoutId, options = {}) {
    return await PayoutsDAO.markReleased(payoutId, options);
  }

  static async getPayoutsByStatus(statusList = []) {
    return await PayoutsDAO.getPayoutsByStatus(statusList);
  }
}

export default PaymentService;
