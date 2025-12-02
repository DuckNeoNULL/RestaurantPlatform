import DishService from '../services/DishService.js';

function formatSequelizeError(err) {
  if (err && /^Sequelize/.test(err.name) && Array.isArray(err.errors) && err.errors.length) {
    return err.errors.map(e => e.message || `${e.path} ${e.type}`).join('; ');
  }
  return err?.message || 'Unknown error';
}

class DishController {
  static async create(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const payload = req.body;
      const created = await DishService.addDishForPartner(actorUserId, payload);
      res.status(201).json(created);
    } catch (err) {
      console.error('Dish create error', err);
      res.status(400).json({ error: formatSequelizeError(err) });
    }
  }

  static async update(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const dishID = req.params.id;
      const patch = req.body;
      const updated = await DishService.updateDishForPartner(actorUserId, dishID, patch);
      res.json(updated);
    } catch (err) {
      console.error('Dish update error', err);
      res.status(400).json({ error: formatSequelizeError(err) });
    }
  }

  static async delete(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const dishID = req.params.id;
      const ok = await DishService.deleteDishForPartner(actorUserId, dishID);
      if (!ok) return res.status(404).json({ error: 'Not found or not authorized' });
      res.json({ success: true });
    } catch (err) {
      console.error('Dish delete error', err);
      res.status(400).json({ error: formatSequelizeError(err) });
    }
  }

  static async listByRestaurant(req, res) {
    try {
      const restaurantID = req.params.restaurantId;
      const rows = await DishService.listByRestaurant(restaurantID);
      res.json(rows);
    } catch (err) {
      console.error('Dish list error', err);
      res.status(400).json({ error: formatSequelizeError(err) });
    }
  }
}

export default DishController;
