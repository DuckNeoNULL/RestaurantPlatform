import db from "../config/db.js";
import { fn, col, literal, Op } from "sequelize";

class PartnerDashboardController {
  static async revenue(req, res) {
    try {
      const { partnerID } = req.params;
      const { payment, booking, hall, restaurant } = db;

      // Restaurants owned by partner
      const restaurants = await restaurant.findAll({
        where: { restaurantPartnerID: partnerID },
        attributes: ["restaurantID"],
        raw: true,
      });
      const restIds = restaurants.map((r) => r.restaurantID);
      if (!restIds.length)
        return res.json({ totalRevenue: 0, totalBookings: 0, avgRevenuePerBooking: 0, cancellationRate: 0, revenueByMonth: [] });

      const totalRevenue =
        (await payment.sum("amount", { where: { status: 2, restaurantID: { [Op.in]: restIds } } })) || 0;

      // Bookings for partner
      const halls = await hall.findAll({ where: { restaurantID: { [Op.in]: restIds } }, attributes: ["hallID"], raw: true });
      const hallIds = halls.map((h) => h.hallID);
      const totalBookings = hallIds.length
        ? await booking.count({ where: { hallID: { [Op.in]: hallIds } } })
        : 0;

      const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      const cancelled = hallIds.length
        ? await booking.count({ where: { hallID: { [Op.in]: hallIds }, status: 6 } })
        : 0;
      const cancellationRate = totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0;

      const revenueByMonth = await payment.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("paymentDate"), "%Y-%m"), "month"],
          [fn("SUM", col("amount")), "revenue"],
        ],
        where: { status: 2, restaurantID: { [Op.in]: restIds } },
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
      console.error("PartnerDashboardController.revenue ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async bookings(req, res) {
    try {
      const { partnerID } = req.params;
      const { booking, hall, restaurant } = db;

      const restaurants = await restaurant.findAll({ where: { restaurantPartnerID: partnerID }, attributes: ["restaurantID"], raw: true });
      const restIds = restaurants.map((r) => r.restaurantID);
      if (!restIds.length) return res.json({ bookingsByMonth: [] });

      const halls = await hall.findAll({ where: { restaurantID: { [Op.in]: restIds } }, attributes: ["hallID"], raw: true });
      const hallIds = halls.map((h) => h.hallID);
      if (!hallIds.length) return res.json({ bookingsByMonth: [] });

      const bookingsByMonth = await booking.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
          [fn("COUNT", col("bookingID")), "count"],
        ],
        where: { hallID: { [Op.in]: hallIds } },
        group: [literal("month")],
        order: [[literal("month"), "ASC"]],
        raw: true,
      });

      res.json({ bookingsByMonth });
    } catch (err) {
      console.error("PartnerDashboardController.bookings ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async customers(req, res) {
    try {
      const { partnerID } = req.params;
      const { booking, hall, restaurant } = db;

      const restaurants = await restaurant.findAll({ where: { restaurantPartnerID: partnerID }, attributes: ["restaurantID"], raw: true });
      const restIds = restaurants.map((r) => r.restaurantID);
      if (!restIds.length) return res.json({ customersByMonth: [], totalCustomers: 0, repeatedRate: 0, avgBookingPerCustomer: 0 });

      const halls = await hall.findAll({ where: { restaurantID: { [Op.in]: restIds } }, attributes: ["hallID"], raw: true });
      const hallIds = halls.map((h) => h.hallID);
      if (!hallIds.length) return res.json({ customersByMonth: [], totalCustomers: 0, repeatedRate: 0, avgBookingPerCustomer: 0 });

      const customersByMonth = await db.sequelize.query(
        `SELECT DATE_FORMAT(b.createdAt, '%Y-%m') AS month, COUNT(DISTINCT b.customerID) AS customers
         FROM booking b
         WHERE b.hallID IN (:hallIds)
         GROUP BY month
         ORDER BY month ASC;`,
        { type: db.sequelize.QueryTypes.SELECT, replacements: { hallIds } }
      );

      const totalCustomersRow = await db.sequelize.query(
        `SELECT COUNT(DISTINCT b.customerID) AS total FROM booking b WHERE b.hallID IN (:hallIds);`,
        { type: db.sequelize.QueryTypes.SELECT, replacements: { hallIds } }
      );
      const totalCustomers = Number(totalCustomersRow?.[0]?.total || 0);

      const repeated = await db.sequelize.query(
        `SELECT customerID, COUNT(*) AS bookings FROM booking WHERE hallID IN (:hallIds) GROUP BY customerID HAVING bookings > 1;`,
        { type: db.sequelize.QueryTypes.SELECT, replacements: { hallIds } }
      );
      const repeatedRate = totalCustomers > 0 ? ((repeated.length / totalCustomers) * 100).toFixed(1) : 0;

      const avgBooking = await db.sequelize.query(
        `SELECT AVG(cnt) AS avgBooking FROM (SELECT COUNT(*) AS cnt FROM booking WHERE hallID IN (:hallIds) GROUP BY customerID) AS t;`,
        { type: db.sequelize.QueryTypes.SELECT, replacements: { hallIds } }
      );
      const avgBookingPerCustomer = Number(avgBooking?.[0]?.avgBooking || 0).toFixed(1);

      res.json({ customersByMonth, totalCustomers, repeatedRate, avgBookingPerCustomer });
    } catch (err) {
      console.error("PartnerDashboardController.customers ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async restaurants(req, res) {
    try {
      const { partnerID } = req.params;
      const rows = await db.sequelize.query(
        `SELECT r.restaurantID, r.name,
                IFNULL(SUM(p.amount), 0) AS revenue,
                COUNT(DISTINCT b.bookingID) AS bookings,
                IFNULL(AVG(rv.rating), 0) AS rating
         FROM restaurant r
         LEFT JOIN payment p ON p.restaurantID = r.restaurantID AND p.status = 2
         LEFT JOIN hall h ON h.restaurantID = r.restaurantID
         LEFT JOIN booking b ON b.hallID = h.hallID
         LEFT JOIN review rv ON rv.bookingID = b.bookingID
         WHERE r.restaurantPartnerID = :partnerID
         GROUP BY r.restaurantID
         ORDER BY revenue DESC;`,
        { type: db.sequelize.QueryTypes.SELECT, replacements: { partnerID } }
      );
      res.json({ restaurants: rows });
    } catch (err) {
      console.error("PartnerDashboardController.restaurants ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default PartnerDashboardController;
