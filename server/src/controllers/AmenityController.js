import AmenityService from '../services/AmenityService.js';
import { authenticateJWT, authMiddleware, ensurePartner, ensureAdmin } from '../middlewares/jwtToken.js';

class AmenityController {
  static async listAll(req, res) {
    try {
      const all = await AmenityService.listAll();
      res.json(all);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      // only admin route — ensureAdmin will be used on route
      const created = await AmenityService.createAmenity(req.body);
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async assign(req, res) {
    try {
      // prefer restaurantId from URL params when present (nested route), fallback to body
      const restaurantID = req.params.restaurantId || req.params.restaurantID || req.body.restaurantID;
      const amenityID = req.body.amenityID || req.body.amenityId;
      if (!restaurantID || !amenityID) return res.status(400).json({ error: 'restaurantID and amenityID required' });
      const actor = req.user?.userId;
      const result = await AmenityService.assignAmenityToRestaurant(restaurantID, amenityID, actor);
      res.status(201).json(result);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  static async unassign(req, res) {
    try {
      const restaurantID = req.params.restaurantId || req.params.restaurantID || req.body.restaurantID;
      const amenityID = req.body.amenityID || req.body.amenityId;
      if (!restaurantID || !amenityID) return res.status(400).json({ error: 'restaurantID and amenityID required' });
      const actor = req.user?.userId;
      const result = await AmenityService.removeAmenityFromRestaurant(restaurantID, amenityID, actor);
      res.json({ success: !!result });
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  static async listForRestaurant(req, res) {
    try {
      // support nested mount (/api/restaurants/:restaurantId/amenities) and legacy /restaurant/:restaurantID
      const restaurantID = req.params.restaurantId || req.params.restaurantID;
      if (!restaurantID) return res.status(400).json({ error: 'restaurantID required' });
      const data = await AmenityService.listForRestaurant(restaurantID);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default AmenityController;
