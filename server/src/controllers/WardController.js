import WardDAO from '../dao/WardDAO.js';

class WardController {
  /**
   * GET /api/wards
   * Lấy danh sách tất cả các wards cùng với số lượng nhà hàng
   */
  static async getAllWards(req, res) {
    try {
      console.log('WardController: Fetching wards...');
      const wards = await WardDAO.getAllWardsWithCount();
      console.log('WardController: Returning wards:', wards);
      res.json(wards);
    } catch (err) {
      console.error('WardController: Error fetching wards:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch wards' });
    }
  }
}

export default WardController;

