import PromotionDAO from '../dao/PromotionDAO.js';
import RestaurantDAO from '../dao/RestaurantDAO.js';
import db from '../config/db.js';

class PromotionService {
  static async createPromotionForPartner(actorUserId, data) {
    const {
      // Accept both old and new FE keys
      title,
      name,
      description,
      discountPercentage,
      discountValue,
      startDate,
      endDate,
      restaurantID,
      discountType, // can be number (0/1) or string ("Percent"/"Free")
      serviceIDs,
      minTable,
      status,
    } = data;

    if (!restaurantID) throw new Error('restaurantID required');
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    // Normalize to model fields
    const promotionName = (name ?? title ?? '').trim();
    if (!promotionName) throw new Error('name required');
    if (!startDate || !endDate) throw new Error('startDate and endDate are required');

    // discountType: 0 -> Percent, 1 -> Free
    let dt;
    if (typeof discountType === 'string') {
      dt = discountType === 'Free' ? 1 : 0;
    } else if (typeof discountType === 'number') {
      dt = discountType;
    } else {
      dt = 0;
    }
    const dv = typeof discountValue !== 'undefined' ? discountValue : (typeof discountPercentage !== 'undefined' ? discountPercentage : null);

    return await PromotionDAO.addPromotion({
      restaurantID,
      name: promotionName,
      description: description ?? null,
      minTable: typeof minTable !== 'undefined' ? minTable : 0,
      discountType: dt,
      discountValue: dv,
      startDate,
      endDate,
      status: typeof status !== 'undefined' ? !!status : true,
      serviceIDs: Array.isArray(serviceIDs) ? serviceIDs : [],
    });
  }

  static async updateForPartner(actorUserId, promotionID, patch) {
    const existing = await PromotionDAO.getByID(promotionID);
    if (!existing) throw new Error('Promotion not found');
    // ensure this promotion belongs to a restaurant owned by actorUserId
    const restaurantID = existing.restaurantID;
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    // Normalize patch keys similarly
    const normalized = { ...patch };
    if (normalized.title && !normalized.name) {
      normalized.name = normalized.title;
      delete normalized.title;
    }
    if (typeof normalized.discountType === 'string') {
      normalized.discountType = normalized.discountType === 'Free' ? 1 : 0;
    }
    if (typeof normalized.discountPercentage !== 'undefined' && typeof normalized.discountValue === 'undefined') {
      normalized.discountValue = normalized.discountPercentage;
      delete normalized.discountPercentage;
    }

    const ok = await PromotionDAO.updatePromotion(promotionID, normalized);
    if (!ok) throw new Error('Update failed');
    return await PromotionDAO.getByID(promotionID);
  }

  static async deleteForPartner(actorUserId, promotionID) {
    const existing = await PromotionDAO.getByID(promotionID);
    if (!existing) throw new Error('Promotion not found');
    const restaurantID = existing.restaurantID;
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    const ok = await PromotionDAO.deletePromotion(promotionID);
    if (!ok) throw new Error('Delete failed');
    return true;
  }

  static async listForRestaurant(restaurantID) {
    return await PromotionDAO.getPromotionsByRestaurantID(restaurantID);
  }

  static async listFiltered({ date, tables, restaurantId }) {
    // Get all promotions and filter client-side for now
    // In production, this should be done in the database
    // const allPromotions = await PromotionDAO.getPromotionsByEventTypeAndRestaurant(eventType, restaurantId);
    const allPromotions = await PromotionDAO.getPromotionsByRestaurantID(restaurantId);
    return allPromotions.filter(promo => {
      // Filter by date if provided (check if date is within startDate and endDate)
      if (date) {
        const promoStart = new Date(promo.startDate);
        const promoEnd = new Date(promo.endDate);
        const checkDate = new Date(date);
        if (checkDate < promoStart || checkDate > promoEnd) return false;
      }
      
      // Filter by tables if provided (check minTable condition)
      if (tables && promo.minTable && tables < promo.minTable) return false;
      
      return true;
    });
  }

  static async listServicesForPromotion(promotionID) {
    return await PromotionDAO.getServicesByPromotionID(promotionID);
  }
}

export default PromotionService;
