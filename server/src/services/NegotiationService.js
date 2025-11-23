// src/services/NegotiationService.js
import NegotiationDAO from "../dao/NegotiationDAO.js";
import db from "../config/db.js";
import { negoStatus } from "../models/enums/UserStatus.js";

const RestaurantPartnerModel = db.restaurantpartner;

class NegotiationService {
  // Get negotiation history
  static async getHistory(restaurantPartnerID) {
    if (!restaurantPartnerID) throw new Error("restaurantPartnerID is required");
    return await NegotiationDAO.getHistoryByPartnerID(restaurantPartnerID);
  }

  // Create a new offer (from admin or partner)
  static async createOffer({ restaurantPartnerID, proposedBy, role, commissionRate, message = null }) {
    if (!restaurantPartnerID || !proposedBy || role === undefined || commissionRate === null || commissionRate === undefined) {
      throw new Error("Missing required fields");
    }

    // Validate commissionRate (0.00 - 1.00)
    if (commissionRate < 0 || commissionRate > 1) {
      throw new Error("Commission rate must be between 0 and 1");
    }

    // Update partner's current commissionRate
    await RestaurantPartnerModel.update(
      { commissionRate },
      { where: { restaurantPartnerID } }
    );

    // Create history record
    return await NegotiationDAO.createOffer({
      restaurantPartnerID,
      proposedBy,
      role,
      commissionRate,
      message,
    });
  }

  // Accept current offer (partner accepts admin's offer or vice versa)
  static async acceptOffer(restaurantPartnerID, acceptedBy) {
    const partner = await RestaurantPartnerModel.findByPk(restaurantPartnerID);
    if (!partner) throw new Error("Partner not found");

    if (partner.status !== negoStatus.negotiating) {
      throw new Error("Partner is not in negotiating status");
    }

    // Move to active status
    await RestaurantPartnerModel.update(
      { status: negoStatus.active },
      { where: { restaurantPartnerID } }
    );

    // Also activate user account
    await db.user.update(
      { status: 1 },
      { where: { userID: restaurantPartnerID } }
    );

    return await RestaurantPartnerModel.findByPk(restaurantPartnerID);
  }

  // Get partner info with negotiation data
  static async getPartnerNegotiationData(restaurantPartnerID) {
    return await NegotiationDAO.getPartnerWithLatestOffer(restaurantPartnerID);
  }
}

export default NegotiationService;

