import dotenv from "dotenv";
import { PayOS } from "@payos/node";
import BookingDAO from "../../dao/BookingDAO.js";

dotenv.config();

const {
  PAYOS_CLIENT_ID,
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY,
  PAYOS_RETURN_URL,
  PAYOS_CANCEL_URL,
} = process.env;

// === Helpers ===
function requireEnv(name, value) {
  if (!value) throw new Error(`[PayOS] Missing required env: ${name}`);
  return value;
}

function buildPayOSClient() {
  return new PayOS({
    clientId: requireEnv("PAYOS_CLIENT_ID", PAYOS_CLIENT_ID),
    apiKey: requireEnv("PAYOS_API_KEY", PAYOS_API_KEY),
    checksumKey: requireEnv("PAYOS_CHECKSUM_KEY", PAYOS_CHECKSUM_KEY),
  });
}

/**
 * Generate a unique order code for each booking
 * => must be a positive integer and unique across all transactions
 */
function genOrderCode(bookingID) {
  // Use bookingID directly for traceability and webhook mapping
  const n = Number(bookingID);
  if (!Number.isFinite(n) || n <= 0) throw new Error("[PayOS] Invalid bookingID for orderCode");
  return n;
}

/**
 * Convert to valid VND integer (PayOS only accepts integers)
 */
function toVndInt(n) {
  const v = Math.round(Number(n) || 0);
  if (v <= 0) throw new Error("[PayOS] Invalid amount, must be > 0");
  return v;
}

// === Main Service Class ===
class PayosServices {
  /**
   * Tạo link thanh toán cho Booking (đặt cọc / full payment)
   * @param {number} bookingID
   * @param {object} buyer { name, email, phone }
   */
  static async createCheckoutForBooking(bookingID, buyer = {}, amountOverride = null) {
    const payos = buildPayOSClient();

    // --- 1. Lấy thông tin booking ---
    const booking = await BookingDAO.getBookingDetails(bookingID);
    if (!booking) throw new Error("Booking not found");

    // --- 2. Tính tổng tiền hợp lệ ---
    const amount = amountOverride != null
      ? toVndInt(amountOverride)
      : toVndInt(
          booking.depositAmount ??
          booking.totalAmount ??
          Number(booking.originalPrice || 0) -
          Number(booking.discountAmount || 0) +
          Number(booking.VAT || 0)
        );

    // --- 3. Chuẩn bị thông tin mô tả ---
    const restaurantName =
      booking?.hall?.restaurant?.name ||
      booking?.restaurantName ||
      "Nhà hàng";
    const hallName = booking?.hall?.name || booking?.hallName || "Sảnh";
    //    const description = `Đặt cọc đơn đặt tiệc #${bookingID} - ${restaurantName}`;
    const description = `Đặt cọc`;


    // --- 4. Sinh mã order duy nhất ---
    const orderCode = genOrderCode(bookingID);

    // --- 5. Build payload gửi PayOS ---
    const payload = {
      amount,
      orderCode,
      description,
      returnUrl: requireEnv("PAYOS_RETURN_URL", PAYOS_RETURN_URL),
      cancelUrl: requireEnv("PAYOS_CANCEL_URL", PAYOS_CANCEL_URL),
      buyerName: buyer.name || booking?.customer?.fullName || "",
      buyerEmail: buyer.email || booking?.customer?.email || "",
      buyerPhone: buyer.phone || booking?.customer?.phone || "",
      items: [
        {
          name: `Đặt tiệc ${restaurantName} - ${hallName}`,
          quantity: 1,
          price: amount,
        },
      ],
    };

    // --- 6. Gọi SDK để tạo link ---
    const link = await payos.paymentRequests.create(payload);

    return {
      bookingID,
      orderCode,
      amount,
      checkoutUrl: link?.checkoutUrl || link?.shortLink,
      raw: link,
    };
  }

  /**
   * Lấy thông tin chi tiết 1 giao dịch theo orderCode
   */
  static async getLinkInfo(orderCode) {
    const payos = buildPayOSClient();
    return await payos.paymentRequests.get(orderCode);
  }

  /**
   * Xác minh webhook từ PayOS (bắt buộc để đảm bảo an toàn)
   */
  static async verifyWebhook(webhookData) {
    const payos = buildPayOSClient();
    try {
      const verified = payos.webhooks.verify(webhookData);
      return verified;
    } catch (err) {
      console.error("[PayOS] Webhook verification failed:", err.message);
      return null;
    }
  }
}

export default PayosServices;
