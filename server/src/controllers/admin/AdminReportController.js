// src/controllers/admin/AdminReportController.js
import ReportDAO from "../../dao/ReportDAO.js";
import db from "../../config/db.js";

class AdminReportController {
  // GET /api/admin/reports
  static async getAll(req, res) {
    try {
      const list = await ReportDAO.getAllWithDetails();
      res.json({ success: true, data: list });
    } catch (err) {
      console.error("AdminReportController.getAll ERROR:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // GET /api/admin/reports/:id
  static async getDetail(req, res) {
    try {
      const { id } = req.params;

      const r = await db.report.findByPk(id, {
        include: [
          { model: db.user, as: "user" },
          { model: db.restaurant, as: "restaurant" },
          {
            model: db.review,
            as: "review",
            include: [
              {
                model: db.customer,
                as: "customer",
                include: [{ model: db.user, as: "user" }],
              },
            ],
          },
        ],
      });

      if (!r)
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });

      res.json({ success: true, data: r });
    } catch (error) {
      console.error("AdminReportController.getDetail ERROR:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // PATCH /api/admin/reports/:id
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (status === undefined)
        return res.status(400).json({
          success: false,
          message: "Missing status field",
        });

      const updated = await ReportDAO.updateStatus(id, status);

      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });

      res.json({ success: true, message: "Status updated" });
    } catch (error) {
      console.error("AdminReportController.updateStatus ERROR:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // DELETE /api/admin/reports/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await ReportDAO.deleteReport(id);

      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });

      res.json({ success: true, message: "Report deleted" });
    } catch (error) {
      console.error("AdminReportController.delete ERROR:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

export default AdminReportController;
