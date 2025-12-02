import ServiceService from '../services/ServiceService.js';

class ServiceController {
  static async create(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const payload = req.body;
      const created = await ServiceService.createForPartner(actorUserId, payload);
      res.status(201).json(created);
    } catch (err) {
      console.error('Service create error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const id = req.params.id;
      const patch = req.body;
      const updated = await ServiceService.updateForPartner(actorUserId, id, patch);
      res.json(updated);
    } catch (err) {
      console.error('Service update error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const id = req.params.id;
      const ok = await ServiceService.deleteForPartner(actorUserId, id);
      if (!ok) return res.status(404).json({ error: 'Not found or not authorized' });
      res.json({ success: true });
    } catch (err) {
      console.error('Service delete error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async listByRestaurant(req, res) {
    try {
      const restaurantID = req.params.restaurantId;
      const rows = await ServiceService.listByRestaurant(restaurantID);
      res.json(rows);
    } catch (err) {
      console.error('Service list error', err);
      res.status(400).json({ error: err.message });
    }
  }
}

export default ServiceController;
