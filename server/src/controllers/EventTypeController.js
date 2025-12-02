import EventTypeService from '../services/EventTypeService.js';
import { authMiddleware, ensurePartner, ensureAdmin } from '../middlewares/jwtToken.js';

class EventTypeController {
  static async listAll(req, res) {
    try {
      const all = await EventTypeService.listAll();
      res.json(all);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const created = await EventTypeService.createEventType(req.body);
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async assign(req, res) {
    try {
      const restaurantID = req.params.restaurantId || req.params.restaurantID || req.body.restaurantID;
      const eventTypeID = req.body.eventTypeID || req.body.eventTypeId;
      if (!restaurantID || !eventTypeID) return res.status(400).json({ error: 'restaurantID and eventTypeID required' });
      const actor = req.user?.userId;
      const result = await EventTypeService.assignEventTypeToRestaurant(restaurantID, eventTypeID, actor);
      res.status(201).json(result);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  static async unassign(req, res) {
    try {
      const restaurantID = req.params.restaurantId || req.params.restaurantID || req.body.restaurantID;
      const eventTypeID = req.body.eventTypeID || req.body.eventTypeId;
      if (!restaurantID || !eventTypeID) return res.status(400).json({ error: 'restaurantID and eventTypeID required' });
      const actor = req.user?.userId;
      const result = await EventTypeService.removeEventTypeFromRestaurant(restaurantID, eventTypeID, actor);
      res.json({ success: !!result });
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  static async listForRestaurant(req, res) {
    try {
      const restaurantID = req.params.restaurantId || req.params.restaurantID;
      if (!restaurantID) return res.status(400).json({ error: 'restaurantID required' });
      const data = await EventTypeService.listForRestaurant(restaurantID);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default EventTypeController;
