import PaymentDAO from "../../dao/PaymentDAO.js";

class AdminPaymentController {
  static async getAll(req, res) {
    try {
      const payments = await PaymentDAO.getAllWithDetails();
      res.json({ success: true, data: payments });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDetail(req, res) {
    try {
      const { id } = req.params;

      const payment = await PaymentDAO.getDetail(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found"
        });
      }

      res.json({ success: true, data: payment });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const ok = await PaymentDAO.updateStatus(id, status);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: "Payment not found"
        });
      }

      res.json({
        success: true,
        message: "Payment status updated"
      });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default AdminPaymentController;
