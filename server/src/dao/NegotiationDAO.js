// src/dao/NegotiationDAO.js
import db from "../config/db.js";
import { toDTO } from "../utils/convert/dto.js";

const RestaurantPartnerModel = db.restaurantpartner;
const UserModel = db.user;

class NegotiationDAO {
  // Get negotiation history for a partner (from JSON field)
  static async getHistoryByPartnerID(restaurantPartnerID) {
    const partner = await RestaurantPartnerModel.findByPk(restaurantPartnerID);
    if (!partner) return [];

    const historyJson = partner.negotiationHistory;
    if (!historyJson) return [];

    try {
      const history = JSON.parse(historyJson);
      
      // Enrich với thông tin user
      const enrichedHistory = await Promise.all(
        history.map(async (item) => {
          if (item.proposedBy) {
            const user = await UserModel.findByPk(item.proposedBy, {
              attributes: ["userID", "fullName", "email", "role"],
            });
            return {
              ...item,
              proposedBy_user: user ? toDTO(user) : null,
            };
          }
          return item;
        })
      );
      
      return enrichedHistory;
    } catch (err) {
      console.error("Error parsing negotiation history:", err);
      return [];
    }
  }

  // Create a new negotiation offer (append to JSON array)
  static async createOffer({ restaurantPartnerID, proposedBy, role, commissionRate, message = null }) {
    const partner = await RestaurantPartnerModel.findByPk(restaurantPartnerID);
    if (!partner) throw new Error("Partner not found");

    // Parse existing history or create new array
    let history = [];
    if (partner.negotiationHistory) {
      try {
        history = JSON.parse(partner.negotiationHistory);
      } catch (err) {
        console.error("Error parsing existing history:", err);
        history = [];
      }
    }

    // Create new offer entry
    const newOffer = {
      negotiationID: history.length > 0 ? Math.max(...history.map(h => h.negotiationID || 0)) + 1 : 1,
      restaurantPartnerID,
      proposedBy,
      role, // 0: PARTNER, 1: ADMIN
      commissionRate: parseFloat(commissionRate),
      message: message || null,
      createdAt: new Date().toISOString(),
    };

    // Add to history
    history.push(newOffer);

    // Update partner record
    await partner.update({
      commissionRate: parseFloat(commissionRate),
      negotiationHistory: JSON.stringify(history),
    });

    // Get user info for response
    const user = await UserModel.findByPk(proposedBy, {
      attributes: ["userID", "fullName", "email", "role"],
    });

    return {
      ...newOffer,
      proposedBy_user: user ? toDTO(user) : null,
    };
  }

  // Get current partner info
  static async getPartnerWithLatestOffer(restaurantPartnerID) {
    const partner = await RestaurantPartnerModel.findByPk(restaurantPartnerID, {
      include: [
        {
          model: UserModel,
          as: "owner",
          attributes: ["userID", "fullName", "email", "phone"],
        },
      ],
    });
    
    if (!partner) return null;
    
    const partnerData = partner.get({ plain: true });
    
    // Get latest offer from history
    if (partner.negotiationHistory) {
      try {
        const history = JSON.parse(partner.negotiationHistory);
        if (history.length > 0) {
          const latest = history[history.length - 1];
          // Get user info for latest offer
          if (latest.proposedBy) {
            const user = await UserModel.findByPk(latest.proposedBy, {
              attributes: ["userID", "fullName", "email", "role"],
            });
            partnerData.latestOffer = {
              ...latest,
              proposedBy_user: user ? toDTO(user) : null,
            };
          } else {
            partnerData.latestOffer = latest;
          }
        }
      } catch (err) {
        console.error("Error parsing history for latest offer:", err);
      }
    }
    
    return partnerData;
  }
}

export default NegotiationDAO;
