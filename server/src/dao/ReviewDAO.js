import db from "../config/db.js";
import { Op } from "sequelize";
const { review, sequelize } = db;
import { toDTO, toDTOs } from "../utils/convert/dto.js";

class ReviewDAO {
  /**
   * Create a review. Enforces unique (bookingID, customerID) via DB constraint.
   * reviewData: { bookingID, customerID, rating, comment }
   */
  static async createReview(reviewData) {
    const { bookingID, customerID, rating = null, comment = null, restaurantID = null } = reviewData;
    // Use a transaction to ensure atomicity and to allow callers to extend later
    const r = await sequelize.transaction(async (t) => {
      const payload = { bookingID, customerID, rating, comment };
      if (
        restaurantID !== null && restaurantID !== undefined &&
        review?.rawAttributes && Object.prototype.hasOwnProperty.call(review.rawAttributes, "restaurantID")
      ) {
        payload.restaurantID = restaurantID;
      }
      const created = await review.create(payload, { transaction: t });
      return created;
    });
    return toDTO(r);
  }

  static async getByID(reviewID) {
    const r = await review.findByPk(reviewID);
    return toDTO(r);
  }

  static async getByBookingID(bookingID) {
    const rows = await review.findAll({
      where: { bookingID },
      order: [["createdAt", "DESC"]],
      attributes: ["reviewID", "bookingID", "customerID", "rating", "comment", "restaurantID"],
    });
    return toDTOs(rows);
  }

  static async getByCustomerID(customerID) {
    const rows = await review.findAll({
      where: { customerID },
      order: [["createdAt", "DESC"]],
      attributes: ["reviewID", "bookingID", "customerID", "rating", "comment", "restaurantID"],
    });
    return toDTOs(rows);
  }

  static async getByBookingAndCustomer(bookingID, customerID) {
    const r = await review.findOne({ where: { bookingID, customerID } });
    return toDTO(r);
  }

  /**
   * Generic list with optional filters: { bookingID, customerID, minRating, maxRating, limit, offset }
   */
  static async list({
    bookingID,
    customerID,
    minRating,
    maxRating,
    limit,
    offset,
  } = {}) {
    const where = {};
    if (bookingID !== undefined && bookingID !== null)
      where.bookingID = bookingID;
    if (customerID !== undefined && customerID !== null)
      where.customerID = customerID;
    if (minRating !== undefined && minRating !== null)
      where.rating = { ...(where.rating || {}), [Op.gte]: minRating };
    if (maxRating !== undefined && maxRating !== null)
      where.rating = { ...(where.rating || {}), [Op.lte]: maxRating };

    const rows = await review.findAll({
      where,
      order: [["createdAt", "DESC"]],
      ...(limit ? { limit } : {}),
      ...(offset ? { offset } : {}),
      attributes: ["reviewID", "bookingID", "customerID", "rating", "comment", "restaurantID"],
    });
    return toDTOs(rows);
  }

  static async updateReview(reviewID, patch) {
    const [count] = await review.update(patch, { where: { reviewID } });
    return count > 0;
  }

  static async deleteReview(reviewID) {
    const count = await review.destroy({ where: { reviewID } });
    return count > 0;
  }

  static async count({ bookingID, customerID } = {}) {
    const where = {};
    if (bookingID !== undefined && bookingID !== null)
      where.bookingID = bookingID;
    if (customerID !== undefined && customerID !== null)
      where.customerID = customerID;
    return await review.count({ where });
  }

  static async getAllWithDetails() {
    return await review.findAll({
      include: [
        {
          model: db.customer,
          as: "customer",
          include: [
            {
              model: db.user,
              as: "user",
              attributes: ["fullName", "email", "phone", "avatarURL"],
            },
          ],
        },
        {
          model: db.booking,
          as: "booking",
          include: [
            {
              model: db.hall,
              as: "hall",
              include: [
                {
                  model: db.restaurant,
                  as: "restaurant",
                  attributes: ["restaurantID", "name"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: [
        "reviewID",
        "bookingID",
        "customerID",
        "rating",
        "comment",
        "restaurantID",
        "createdAt", // removed updatedAt
      ],
    });
  }

  static async getForRestaurantWithDetails(restaurantID) {
    const rows = await review.findAll({
      include: [
        {
          model: db.customer,
          as: "customer",
          include: [
            {
              model: db.user,
              as: "user",
              attributes: ["fullName", "email", "phone", "avatarURL"],
            },
          ],
        },
        {
          model: db.booking,
          as: "booking",
          include: [
            {
              model: db.hall,
              as: "hall",
              include: [
                {
                  model: db.restaurant,
                  as: "restaurant",
                  attributes: ["restaurantID", "name"],
                  where: { restaurantID: String(restaurantID) },
                  required: true,
                },
              ],
            },
          ],
          required: true,
        },
      ],
      order: [["reviewID", "DESC"]],
      attributes: ["reviewID", "bookingID", "customerID", "rating", "comment", "restaurantID"],
    });

    return rows.map((r) => {
      const plain = r.get({ plain: true });
      const customerName = plain?.customer?.user?.fullName || null;
      const avatarURL = plain?.customer?.user?.avatarURL || null;
      const restId = plain?.booking?.hall?.restaurant?.restaurantID || plain?.restaurantID || null;
      return {
        reviewID: plain.reviewID,
        bookingID: plain.bookingID,
        customerID: plain.customerID,
        rating: plain.rating,
        comment: plain.comment,
        customerName,
        avatarURL,
        restaurantID: restId,
      };
    });
  }

  /**
   * Reviews for all restaurants owned by a restaurant partner
   */
  static async getByRestaurantPartnerIDWithDetails(restaurantPartnerID) {
    const rows = await review.findAll({
      include: [
        {
          model: db.customer,
          as: "customer",
          include: [
            { model: db.user, as: "user", attributes: ["fullName", "avatarURL"] },
          ],
        },
        {
          model: db.booking,
          as: "booking",
          include: [
            {
              model: db.hall,
              as: "hall",
              include: [
                {
                  model: db.restaurant,
                  as: "restaurant",
                  attributes: ["restaurantID", "name", "restaurantPartnerID"],
                  where: { restaurantPartnerID: String(restaurantPartnerID) },
                  required: true,
                },
              ],
              required: true,
            },
          ],
          required: true,
        },
      ],
      order: [["reviewID", "DESC"]],
      attributes: ["reviewID", "bookingID", "customerID", "rating", "comment", "restaurantID", "createdAt"],
    });

    return rows.map((r) => {
      const p = r.get({ plain: true });
      return {
        reviewID: p.reviewID,
        bookingID: p.bookingID,
        customerID: p.customerID,
        rating: p.rating,
        comment: p.comment,
        restaurantID: p.booking?.hall?.restaurant?.restaurantID ?? p.restaurantID ?? null,
        restaurantName: p.booking?.hall?.restaurant?.name ?? null,
        customerName: p.customer?.user?.fullName ?? null,
        avatarURL: p.customer?.user?.avatarURL ?? null,
        date: p.createdAt || null,
      };
    });
  }

  /**
   * Direct filter by review.restaurantID (requires restaurantID populated).
   */
  static async getByRestaurantID(restaurantID) {
    const rows = await review.findAll({
      where: { restaurantID },
      order: [["reviewID", "DESC"]],
      attributes: ["reviewID", "bookingID", "customerID", "rating", "comment", "restaurantID"],
      include: [
        {
          model: db.customer,
          as: "customer",
          include: [
            { model: db.user, as: "user", attributes: ["fullName", "avatarURL"] }
          ]
        }
      ]
    });
    return rows.map(r => {
      const p = r.get({ plain: true });
      return {
        reviewID: p.reviewID,
        bookingID: p.bookingID,
        customerID: p.customerID,
        rating: p.rating,
        comment: p.comment,
        restaurantID: p.restaurantID,
        customerName: p.customer?.user?.fullName || null,
        avatarURL: p.customer?.user?.avatarURL || null
      };
    });
  }
}

export default ReviewDAO;
