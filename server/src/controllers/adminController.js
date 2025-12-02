import UserDAO from "../dao/userDao.js";

class AdminController {
  // GET /admin/users/partners/pending
  static async getPendingPartners(req, res) {
    try {
      const data = await UserDAO.getPartnersByStatus(1);
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /admin/users/partners/approved
  static async getApprovedPartners(req, res) {
    try {
      const data = await UserDAO.getPartnersByStatus(3);
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /admin/users/partners/negotiating
  static async getNegotiatingPartners(req, res) {
    try {
      const data = await UserDAO.getPartnersByStatus(2);
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
}

export default AdminController;
