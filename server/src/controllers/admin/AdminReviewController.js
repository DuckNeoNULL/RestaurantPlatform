// src/controllers/admin/AdminReviewController.js
import ReviewDAO from "../../dao/ReviewDAO.js";
import db from "../../config/db.js";

class AdminReviewController {
  // GET /api/admin/reviews
  static async getAll(req, res) {
    try {
      const list = await ReviewDAO.getAllWithDetails();
      res.json({ success: true, data: list });
    } catch (err) {
      console.error("AdminReviewController.getAll ERROR:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // GET /api/admin/reviews/:id
  static async getDetail(req, res) {
    try {
      const { id } = req.params;

      const review = await db.review.findByPk(id, {
        include: [
          {
            model: db.booking,
            as: "booking",
            include: [
              {
                model: db.hall,
                as: "hall",
                include: [{ model: db.restaurant, as: "restaurant" }],
              },
            ],
          },
          {
            model: db.customer,
            as: "customer",
            include: [{ model: db.user, as: "user" }],
          },
        ],
      });

      if (!review) {
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });
      }

      res.json({ success: true, data: review });
    } catch (error) {
      console.error("AdminReviewController.getDetail ERROR:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // PATCH /api/admin/reviews/:id/visibility
  static async updateVisibility(req, res) {
    try {
      const { id } = req.params;
      const { visible } = req.body;

      if (visible === undefined)
        return res.status(400).json({
          success: false,
          message: "Missing visible field in body",
        });

      const updated = await ReviewDAO.updateReview(id, { visible });

      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });

      res.json({ success: true, message: "Visibility updated" });
    } catch (error) {
      console.error("AdminReviewController.updateVisibility ERROR:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // DELETE /api/admin/reviews/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await ReviewDAO.deleteReview(id);

      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });

      res.json({ success: true, message: "Review deleted" });
    } catch (error) {
      console.error("AdminReviewController.delete ERROR:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

export default AdminReviewController;
