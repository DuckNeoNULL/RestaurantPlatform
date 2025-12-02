import MenuService from '../services/MenuService.js';

class MenuController {
  static async create(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const payload = req.body;
      const created = await MenuService.createMenuForPartner(actorUserId, payload);
      res.status(201).json(created);
    } catch (err) {
      console.error('Menu create error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const menuID = req.params.id;
      const patch = req.body;
      const updated = await MenuService.updateMenuForPartner(actorUserId, menuID, patch);
      res.json(updated);
    } catch (err) {
      console.error('Menu update error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const menuID = req.params.id;
      const ok = await MenuService.deleteMenuForPartner(actorUserId, menuID);
      if (!ok) return res.status(404).json({ error: 'Not found or not authorized' });
      res.json({ success: true });
    } catch (err) {
      console.error('Menu delete error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async listByRestaurant(req, res) {
    try {
      const restaurantID = req.params.restaurantId;
      const onlyActive = String(req.query.onlyActive || '').trim() === '1' || String(req.query.active || '').trim() === '1';
      const includeDishes = (req.query.includeDishes === undefined) ? true : String(req.query.includeDishes).trim() === '1';
      const rows = await MenuService.listByRestaurant(restaurantID, { onlyActive, includeDishes });
      res.json(rows);
    } catch (err) {
      console.error('Menu list error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const id = req.params.id;
      const includeDishes = (req.query.includeDishes === undefined) ? true : String(req.query.includeDishes).trim() === '1';
      const m = await MenuService.getById(id, { includeDishes });
      if (!m) return res.status(404).json({ error: 'Not found' });
      res.json(m);
    } catch (err) {
      console.error('Menu get error', err);
      res.status(400).json({ error: err.message });
    }
  }
}

export default MenuController;
