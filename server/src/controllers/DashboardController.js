import db from "../config/db.js";
import { fn, col, literal } from "sequelize";

const { payment: Payment, booking: Booking } = db;

class DashboardController {
  static async getRevenueAnalytics(req, res) {
    try {
      const totalRevenue =
        (await Payment.sum("amount", {
          where: { status: 2 },
        })) || 0;

      const totalBookings = await Booking.count();

      const avgRevenuePerBooking =
        totalBookings > 0 ? totalRevenue / totalBookings : 0;

      const cancelled = await Booking.count({ where: { status: 6 } });
      const cancellationRate =
        totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0;

      const revenueByMonth = await Payment.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("paymentDate"), "%Y-%m"), "month"],
          [fn("SUM", col("amount")), "revenue"],
        ],
        where: { status: 2 },
        group: [literal("month")],
        order: [[literal("month"), "ASC"]],
        raw: true,
      });

      res.json({
        totalRevenue,
        avgRevenuePerBooking,
        cancellationRate: Number(cancellationRate.toFixed(2)),
        totalBookings,
        revenueByMonth,
      });
    } catch (err) {
      console.error("Error in getRevenueAnalytics:", err);
      res.status(500).json({ error: err.message });
    }
  }
  static async getBookingAnalytics(req, res) {
    try {
      const { booking } = db;
      const bookingsByMonth = await booking.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
          [fn("COUNT", col("bookingID")), "count"],
        ],
        group: [literal("month")],
        order: [[literal("month"), "ASC"]],
        raw: true,
      });

      res.json({ bookingsByMonth });
    } catch (err) {
      console.error("Error in getBookingAnalytics:", err);
      res.status(500).json({ error: err.message });
    }
  }
  static async getPartnerPerformance(req, res) {
    try {
      const { restaurant } = db;

      // Tổng hợp doanh thu và review trung bình theo nhà hàng
      const partners = await db.sequelize.query(
        `
      SELECT 
        r.restaurantID,
        r.name,
        IFNULL(SUM(p.amount), 0) AS revenue,
        COUNT(DISTINCT b.bookingID) AS bookings,
        IFNULL(AVG(rv.rating), 0) AS rating
      FROM restaurant r
      LEFT JOIN payment p ON p.restaurantID = r.restaurantID AND p.status = 2
      LEFT JOIN booking b ON b.hallID IN (SELECT hallID FROM hall WHERE restaurantID = r.restaurantID)
      LEFT JOIN review rv ON rv.bookingID = b.bookingID
      GROUP BY r.restaurantID
      ORDER BY revenue DESC;
      `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      res.json({ partners });
    } catch (err) {
      console.error("Error in getPartnerPerformance:", err);
      res.status(500).json({ error: err.message });
    }
  }
  static async getCustomerAnalytics(req, res) {
    try {
      const customersByMonth = await db.sequelize.query(
        `
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        COUNT(*) AS customers
      FROM user
      WHERE role = 0
      GROUP BY month
      ORDER BY month ASC;
      `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      const totalCustomers = await db.user.count({ where: { role: 0 } });

      const repeated = await db.sequelize.query(
        `
      SELECT customerID, COUNT(*) AS bookings
      FROM booking
      GROUP BY customerID
      HAVING bookings > 1
      `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      const totalMultiBooking = repeated.length;
      const repeatedRate =
        totalCustomers > 0
          ? ((totalMultiBooking / totalCustomers) * 100).toFixed(1)
          : 0;

      const avgBooking = await db.sequelize.query(
        `
      SELECT AVG(cnt) AS avgBooking FROM (
        SELECT COUNT(*) AS cnt 
        FROM booking 
        GROUP BY customerID
      ) AS t;`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      res.json({
        customersByMonth,
        totalCustomers,
        repeatedRate,
        avgBookingPerCustomer: Number(avgBooking[0].avgBooking || 0).toFixed(1),
      });
    } catch (err) {
      console.error("Error customer analytics:", err);
      res.status(500).json({ error: err.message });
    }
  }

  // Lấy danh sách system settings
  static async getSystemSettings(req, res) {
    try {
      const settings = await db.systemsetting.findAll({
        order: [["category", "ASC"]],
      });

      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Cập nhật setting
  static async updateSystemSetting(req, res) {
    try {
      const { id } = req.params;
      const { settingValue } = req.body;

      const setting = await db.systemsetting.findByPk(id);
      if (!setting)
        return res.status(404).json({ message: "Setting not found" });

      setting.settingValue = settingValue;
      await setting.save();

      res.json({ success: true, setting });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default DashboardController;
