import db from "../config/db.js";

const { sequelize } = db;

/**
 * Chuyển đổi tên ward thành slug URL-friendly
 * @param {string} name - Tên ward
 * @returns {string} Slug
 */
function createSlug(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD') // Tách ký tự có dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-'); // Xóa nhiều dấu gạch ngang liên tiếp
}

class WardDAO {
  /**
   * Lấy danh sách các wards unique cùng với số lượng nhà hàng active trong mỗi ward
   * @returns {Promise<Array>} Mảng các wards với { name, slug, count }
   */
  static async getAllWardsWithCount() {
    const query = `
      SELECT 
        a.ward AS name,
        COUNT(DISTINCT r.restaurantID) AS count
      FROM Address a
      INNER JOIN Restaurant r ON r.addressID = a.addressID
      WHERE r.status = TRUE
      GROUP BY a.ward
      HAVING count > 0
      ORDER BY count DESC, a.ward ASC
    `;

    try {
      const [results] = await sequelize.query(query);
      console.log('WardDAO: Query results:', results);
      
      const wards = results.map((row) => ({
        name: row.name,
        slug: createSlug(row.name),
        count: parseInt(row.count, 10),
      }));
      
      console.log('WardDAO: Processed wards:', wards);
      return wards;
    } catch (error) {
      console.error('WardDAO: Error executing query:', error);
      throw error;
    }
  }
}

export default WardDAO;

