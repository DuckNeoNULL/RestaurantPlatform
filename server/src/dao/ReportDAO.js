import db from "../config/db.js";
import { Op } from "sequelize";
import { toDTO, toDTOs } from "../utils/convert/dto.js";

const { report, sequelize } = db;

class ReportDAO {
  /**
   * Create a new report
   * reportData: { userID, restaurantID?, reviewID?, targetType, reasonType, content?, status?, seen? }
   */
  static async createReport(reportData) {
    const {
      userID,
      restaurantID = null,
      reviewID = null,
      targetType,
      reasonType,
      content = null,
      status = 0,
      seen = false,
    } = reportData;

    const r = await report.create({
      userID,
      restaurantID,
      reviewID,
      targetType,
      reasonType,
      content,
      status,
      seen,
    });
    return toDTO(r);
  }

  static async getByID(reportID) {
    const r = await report.findByPk(reportID);
    return toDTO(r);
  }

  /**
   * List reports with optional filters: { status, seen, userID, restaurantID, reviewID }
   */
  static async list({
    status,
    seen,
    userID,
    restaurantID,
    reviewID,
    limit,
    offset,
  } = {}) {
    const where = {};
    if (status !== undefined && status !== null) where.status = status;
    if (seen !== undefined && seen !== null) where.seen = seen;
    if (userID !== undefined && userID !== null) where.userID = userID;
    if (restaurantID !== undefined && restaurantID !== null)
      where.restaurantID = restaurantID;
    if (reviewID !== undefined && reviewID !== null) where.reviewID = reviewID;

    const rows = await report.findAll({
      where,
      order: [["createdAt", "DESC"]],
      ...(limit ? { limit } : {}),
      ...(offset ? { offset } : {}),
    });
    return toDTOs(rows);
  }

  static async getByUserID(userID) {
    const rows = await report.findAll({
      where: { userID },
      order: [["createdAt", "DESC"]],
    });
    return toDTOs(rows);
  }

  static async getByRestaurantID(restaurantID) {
    const rows = await report.findAll({
      where: { restaurantID },
      order: [["createdAt", "DESC"]],
    });
    return toDTOs(rows);
  }

  static async getByReviewID(reviewID) {
    const rows = await report.findAll({
      where: { reviewID },
      order: [["createdAt", "DESC"]],
    });
    return toDTOs(rows);
  }

  static async updateStatus(reportID, status) {
    const [count] = await report.update({ status }, { where: { reportID } });
    return count > 0;
  }

  static async markSeen(reportID, seen = true) {
    const [count] = await report.update({ seen }, { where: { reportID } });
    return count > 0;
  }

  static async deleteReport(reportID) {
    const count = await report.destroy({ where: { reportID } });
    return count > 0;
  }

  /**
   * Count reports optionally filtered by where-clause
   */
  static async count({ status, seen } = {}) {
    const where = {};
    if (status !== undefined && status !== null) where.status = status;
    if (seen !== undefined && seen !== null) where.seen = seen;
    return await report.count({ where });
  }

  static async getAllWithDetails() {
    return await report.findAll({
      include: [
        {
          model: db.user,
          as: "user",
          attributes: ["fullName", "email", "phone"],
        },
        {
          model: db.restaurant,
          as: "restaurant",
          attributes: ["name"],
        },
        {
          model: db.review,
          as: "review",
          attributes: ["reviewID", "rating", "comment"],
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: [
        "reportID",
        "userID",
        "restaurantID",
        "reviewID",
        "targetType",
        "reasonType",
        "content",
        "status",
        "seen",
        "createdAt",
      ],
    });
  }
}

export default ReportDAO;
