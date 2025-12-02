// src/controllers/NegotiationController.js
import NegotiationService from "../services/NegotiationService.js";

class NegotiationController {
  // GET /api/negotiation/:partnerID/history
  static async getHistory(req, res) {
    try {
      const { partnerID } = req.params;
      const history = await NegotiationService.getHistory(partnerID);
      res.json({ success: true, data: history });
    } catch (error) {
      console.error("Get negotiation history error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/negotiation/:partnerID
  static async getNegotiationData(req, res) {
    try {
      const { partnerID } = req.params;
      const data = await NegotiationService.getPartnerNegotiationData(partnerID);
      if (!data) {
        return res.status(404).json({ success: false, message: "Partner not found" });
      }
      res.json({ success: true, data });
    } catch (error) {
      console.error("Get negotiation data error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/negotiation/:partnerID/offer
  static async createOffer(req, res) {
    try {
      const { partnerID } = req.params;
      const { commissionRate, message } = req.body;
      const proposedBy = req.user?.userId || req.user?.userID || req.user?.sub || req.user?.id;

      if (!proposedBy) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Determine role: 0 = PARTNER, 1 = ADMIN
      const role = req.user?.role === 2 ? 1 : 0; // Admin = 1, Partner = 0

      const offer = await NegotiationService.createOffer({
        restaurantPartnerID: partnerID,
        proposedBy,
        role,
        commissionRate: parseFloat(commissionRate),
        message,
      });

      res.json({ success: true, data: offer, message: "Offer created successfully" });
    } catch (error) {
      console.error("Create offer error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST /api/negotiation/:partnerID/accept
  static async acceptOffer(req, res) {
    try {
      const { partnerID } = req.params;
      const acceptedBy = req.user?.userId || req.user?.userID || req.user?.sub || req.user?.id;

      if (!acceptedBy) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const partner = await NegotiationService.acceptOffer(partnerID, acceptedBy);
      res.json({ success: true, data: partner, message: "Offer accepted. Partner is now active." });
    } catch (error) {
      console.error("Accept offer error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default NegotiationController;

