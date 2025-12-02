import ReviewDAO from "../../dao/ReviewDAO.js";
import db from "../../config/db.js";

class PartnerReviewController {
  // GET /api/partners/:partnerID/reviews
  static async listByPartner(req, res) {
    try {
      const { partnerID } = req.params;
      if (!partnerID) return res.status(400).json({ success: false, message: "partnerID is required" });

      const list = await ReviewDAO.getByRestaurantPartnerIDWithDetails(Number(partnerID));
      return res.json({ success: true, data: list });
    } catch (err) {
      console.error("PartnerReviewController.listByPartner ERROR:", err);
      return res.status(500).json({ success: false, message: err?.message || "Server error" });
    }
  }
}

export default PartnerReviewController;
