import PayosServices from "../services/payment/PayosServices.js";
import BookingServices from "../services/Booking/BookingServices.js";
import PaymentService from "../services/payment/PaymentServices.js";
import { paymentStatus } from "../models/enums/paymentStatus.js";

class PaymentController {
  // ==============================
  // Generic Payment CRUD endpoints
  // ==============================
  static async createPayment(req, res) {
    try {
      const data = req.body || {};
      // Basic validation
      if (typeof data.amount === "undefined") {
        return res.status(400).json({ success: false, message: "amount is required" });
      }
      const created = await PaymentService.createPayment(data);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      console.error("[PaymentController] ❌ createPayment:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }

  static async getPaymentsByBooking(req, res) {
    try {
      const { bookingID } = req.params;
      const rows = await PaymentService.getPaymentsByBooking(bookingID);
      return res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error("[PaymentController] ❌ getPaymentsByBooking:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }

  static async getPaymentsByPartner(req, res) {
    try {
      const { partnerID } = req.params;
      if (!partnerID) return res.status(400).json({ success: false, message: "partnerID is required" });
      const rows = await PaymentService.getPaymentsByPartner(Number(partnerID));
      return res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error("[PaymentController] ❌ getPaymentsByPartner:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }

  /**
   * Tạo link thanh toán đặt cọc PayOS
   * @route POST /api/payments/deposit/:bookingID
   */
  static async createPayosCheckout(req, res) {
    try {
      const { bookingID } = req.params;
      const buyer = {
        name: req.body?.name,
        email: req.body?.email,
        phone: req.body?.phone,
      };

      // Ensure there is a pending DEPOSIT payment, and use its amount
      let amountOverride = null;
      try {
        const payments = await PaymentService.getPaymentsByBooking(bookingID);
        const depositPay = (payments || []).find(p => (p?.type === 0 || p?.type === (paymentStatus?.type?.DEPOSIT ?? 0)) && (p?.status === 0 || p?.status === (paymentStatus?.status?.PENDING ?? 0) || p?.status === (paymentStatus?.status?.PROCESSING ?? 1)));
        if (depositPay?.amount) amountOverride = Number(depositPay.amount);
        // If no deposit payment exists yet, create one now (fallback safety)
        if (!depositPay) {
          // Load booking total to compute deposit (30%)
          const booking = await BookingServices.getBookingById(bookingID);
          const total = Number(booking?.totalAmount || 0);
          const computed = Math.round(total * 0.3);
          if (computed > 0) {
            const created = await PaymentService.createPayment({
              bookingID,
              restaurantID: booking?.hall?.restaurant?.restaurantID || booking?.restaurantID || null,
              amount: computed,
              type: 0,
              paymentMethod: 0,
              status: 0,
            });
            amountOverride = computed;
          }
        }
      } catch (e) {
        console.error("[PaymentController] ensure deposit payment failed:", e?.message || e);
      }

      let result;
      try {
        result = await PayosServices.createCheckoutForBooking(bookingID, buyer, amountOverride);
      } catch (e) {
        const msg = String(e?.message || e || "");
        const isDuplicate = msg.includes("231") || msg.includes("đã tồn tại") || msg.toLowerCase().includes("already exists") || msg.includes("HTTP 200");
        if (isDuplicate) {
          // Fetch existing link info and return it gracefully
          const info = await PayosServices.getLinkInfo(Number(bookingID));
          const checkoutUrl = info?.data?.checkoutUrl || info?.checkoutUrl || info?.shortLink || null;
          const amount = amountOverride ?? info?.data?.amount ?? info?.amount ?? null;
          if (checkoutUrl) {
            return res.status(200).json({
              success: true,
              bookingID: Number(bookingID),
              orderCode: Number(bookingID),
              amount,
              checkoutUrl,
              reused: true,
            });
          }
        }
        throw e;
      }

      // (Tuỳ chọn) có thể lưu tạm payment record vào DB ở đây
      // await PaymentDAO.create({
      //   bookingID,
      //   orderCode: result.orderCode,
      //   amount: result.amount,
      //   method: paymentStatus.paymentMethod.PAYOS,
      //   type: paymentStatus.type.DEPOSIT,
      //   status: paymentStatus.status.PENDING,
      // });

      return res.status(200).json({
        success: true,
        bookingID: result.bookingID,
        orderCode: result.orderCode,
        amount: result.amount,
        checkoutUrl: result.checkoutUrl,
      });
    } catch (err) {
      console.error("[PaymentController] ❌ createPayosCheckout:", err);
      return res.status(400).json({
        success: false,
        message: err?.message || String(err),
      });
    }
  }

  /**
   * PayOS gọi webhook về khi giao dịch có thay đổi
   * @route POST /api/payments/payos/webhook
   */
  static async payosWebhook(req, res) {
    try {
      const payload = req.body;
      const verified = await PayosServices.verifyWebhook(payload);

      if (!verified) {
        return res.status(400).json({ success: false, message: "Invalid webhook signature" });
      }

      const { code, desc, data } = verified;
      const { orderCode, amount, status, transactionID } = data || {};

      console.log("[PayOS Webhook] 🔔 Received:", verified);

      // Kiểm tra trạng thái thành công từ PayOS
      if (status === "PAID" || status === "SUCCESS" || data?.status_code === "00") {
        // 1️⃣ Cập nhật payment record
        await BookingServices.updatePaymentStatusByOrderCode(orderCode, 2, transactionID);

        // 2️⃣ Cập nhật trạng thái booking -> DEPOSITED
        await BookingServices.deposit(orderCode);

        // 3️⃣ Phản hồi về PayOS để xác nhận webhook OK
        return res.status(200).json({
          success: true,
          message: "Payment successful and booking updated",
        });
      } else if (status === "CANCELLED" || status === "FAILED") {
        await BookingServices.updatePaymentStatusByOrderCode(orderCode, 3);
        return res.status(200).json({
          success: true,
          message: "Payment failed/cancelled, status updated",
        });
      }

      // Các trạng thái khác (pending, processing, v.v.)
      return res.status(200).json({
        success: true,
        message: `Webhook received: ${status}`,
      });
    } catch (err) {
      console.error("[PaymentController] ❌ payosWebhook:", err);
      return res.status(400).json({
        success: false,
        message: err?.message || String(err),
      });
    }
  }

  /**
   * Client có thể query trạng thái thanh toán theo orderCode
   * @route GET /api/payments/status/:orderCode
   */
  static async getPayosStatus(req, res) {
    try {
      const { orderCode } = req.params;
      const info = await PayosServices.getLinkInfo(Number(orderCode));

      const status =
        info?.data?.status ||
        info?.status ||
        "UNKNOWN";
      const amount = info?.data?.amount || info?.amount;
      const bookingID = info?.data?.orderCode || orderCode;

      return res.status(200).json({
        success: true,
        bookingID,
        orderCode,
        status,
        amount,
        raw: info,
      });
    } catch (err) {
      console.error("[PaymentController] ❌ getPayosStatus:", err);
      return res.status(400).json({
        success: false,
        message: err?.message || String(err),
      });
    }
  }
}

export default PaymentController;
