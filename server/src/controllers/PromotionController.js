import PromotionService from '../services/PromotionService.js';

class PromotionController {
  static async create(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const payload = req.body;
      const created = await PromotionService.createPromotionForPartner(actorUserId, payload);
      res.status(201).json(created);
    } catch (err) {
      console.error('Promotion create error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const id = req.params.id;
      const patch = req.body;
      const updated = await PromotionService.updateForPartner(actorUserId, id, patch);
      res.json(updated);
    } catch (err) {
      console.error('Promotion update error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const id = req.params.id;
      const ok = await PromotionService.deleteForPartner(actorUserId, id);
      if (!ok) return res.status(404).json({ error: 'Not found or not authorized' });
      res.json({ success: true });
    } catch (err) {
      console.error('Promotion delete error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async listByRestaurant(req, res) {
    try {
      const restaurantID = req.params.restaurantId;
      const rows = await PromotionService.listForRestaurant(restaurantID);
      res.json(rows);
    } catch (err) {
      console.error('Promotion list error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async list(req, res) {
    try {
      // eventype not used currently
      const {  date, tables, restaurantId } = req.query;
      const rows = await PromotionService.listFiltered({ date, tables: tables ? parseInt(tables) : undefined, restaurantId });
      res.json(rows);
    } catch (err) {
      console.error('Promotion list error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async services(req, res) {
    try {
      const id = req.params.id;
      const rows = await PromotionService.listServicesForPromotion(id);
      res.json(rows);
    } catch (err) {
      console.error('Promotion services error', err);
      res.status(400).json({ error: err.message });
    }
  }
}

export default PromotionController;
