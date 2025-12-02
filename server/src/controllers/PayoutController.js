import PaymentService from "../services/payment/PaymentServices.js";
import PayoutStatus from "../models/enums/PayoutStatus.js";

class PayoutController {
  static async create(req, res) {
    try {
      const data = req.body || {};
      const created = await PaymentService.createPayout(data);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      console.error("[PayoutController] create ERROR:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }

  static async listByPartner(req, res) {
    try {
      const { partnerID } = req.params;
      const rows = await PaymentService.getPayoutsByRestaurantPartnerID(Number(partnerID));
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error("[PayoutController] listByPartner ERROR:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }

  static async listByPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const rows = await PaymentService.getPayoutsByPaymentID(Number(paymentId));
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error("[PayoutController] listByPayment ERROR:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }

  static async listByStatus(req, res) {
    try {
      const statusList = req.query.status || [];
      const list = Array.isArray(statusList) ? statusList : String(statusList).split(",");
      const rows = await PaymentService.getPayoutsByStatus(list);
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error("[PayoutController] listByStatus ERROR:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { payoutId } = req.params;
      const { status } = req.body || {};
      const ok = await PaymentService.updatePayoutStatus(Number(payoutId), status);
      return res.json({ success: !!ok });
    } catch (err) {
      console.error("[PayoutController] updateStatus ERROR:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }

  static async markReleased(req, res) {
    try {
      const { payoutId } = req.params;
      const { releasedBy = null, releasedAt = null, status = PayoutStatus.status.COMPLETED, transactionRef = null } = req.body || {};
      const ok = await PaymentService.markPayoutReleased(Number(payoutId), { releasedBy, releasedAt, status, transactionRef });
      return res.json({ success: !!ok });
    } catch (err) {
      console.error("[PayoutController] markReleased ERROR:", err);
      return res.status(400).json({ success: false, message: err?.message || String(err) });
    }
  }
}

export default PayoutController;
