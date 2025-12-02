import db from "../config/db.js";
import { Op } from 'sequelize';
import {paymentStatus} from "../models/enums/paymentStatus.js";
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { payment: PaymentModel, sequelize } = db;

class PaymentDAO {
  static async getByID(paymentID) {
    const row = await PaymentModel.findByPk(paymentID);
    return toDTO(row);
  }
  // Return plain objects for easier handling in services/controllers
  static async getByBookingID(bookingID) {
    const rows = await PaymentModel.findAll({
      where: { bookingID },
      order: [["paymentID", "ASC"]],
    });
    return toDTOs(rows);
  }

  static async getByRestaurantID(restaurantID) {
    const rows = await PaymentModel.findAll({
      where: { restaurantID },
      order: [["paymentDate", "DESC"]],
    });
    return toDTOs(rows);
  }

  static async getByRestaurantPartnerID(restaurantPartnerID) {
    const rows = await PaymentModel.findAll({
      include: [
        {
          model: db.restaurant,
          as: "restaurant",
          attributes: ["restaurantID", "name", "restaurantPartnerID"],
          where: { restaurantPartnerID },
        },
      ],
      order: [["paymentDate", "DESC"]],
    });
    return toDTOs(rows);
  }

  static async getByTransactionRef(transactionRef) {
    const row = await PaymentModel.findOne({ where: { transactionRef } });
    return toDTO(row);
  }

  // Create a payment record. data may contain many optional fields matching the schema.
  static async createPayment(data) {
    const {
      bookingID,
      restaurantID,
      amount,
      type = 0,
      paymentMethod = 0,
      status = paymentStatus.PENDING ?? 0,
      transactionRef = null,
      paymentDate, // if undefined, let DB default apply
      released = false,
      refundedAmount = 0,
      refundReason = null,
      refundDate = null,
      refundTransactionRef = null,
      providerResponse = null,
    } = data;

    if (typeof amount === "undefined" || Number(amount) < 0) {
      throw new Error("Invalid amount for payment");
    }

    const createData = {
      bookingID,
      restaurantID,
      amount,
      type,
      paymentMethod,
      status,
      transactionRef,
      released: released ? 1 : 0,
      refundedAmount: refundedAmount ?? 0,
      refundReason,
      refundDate,
      refundTransactionRef,
      providerResponse,
    };
    if (typeof paymentDate !== 'undefined' && paymentDate !== null) {
      createData.paymentDate = paymentDate;
    }

    const created = await PaymentModel.create(createData);

    return toDTO(created);
  }

  static async updatePaymentStatus(paymentID, newStatus) {
    const updates = { status: newStatus };
    // If payment succeeds, stamp paymentDate if not set
    if (newStatus === (paymentStatus.status?.SUCCESS ?? 2)) {
      updates.paymentDate = new Date();
    }
    const [updatedRows] = await PaymentModel.update(
      updates,
      { where: { paymentID } }
    );
    return updatedRows > 0;
  }

  // Mark payment as released (bit) and optionally attach provider response
  static async markReleased(
    paymentID,
    { released = true, providerResponse = null } = {}
  ) {
    const [updatedRows] = await PaymentModel.update(
      { released: released ? 1 : 0, providerResponse },
      { where: { paymentID } }
    );
    return updatedRows > 0;
  }

  // Refund handling: supports partial refunds by accumulating refundedAmount
  static async refundPayment(
    paymentID,
    { amount = 0, refundTransactionRef = null, refundReason = null } = {}
  ) {
    return await sequelize.transaction(async (t) => {
      const pay = await PaymentModel.findByPk(paymentID, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!pay) throw new Error("Payment not found");

      const original = Number(pay.amount ?? 0);
      const alreadyRefunded = Number(pay.refundedAmount ?? 0);
      const toRefund = Number(amount);
      if (toRefund <= 0)
        throw new Error("Refund amount must be greater than zero");
      if (alreadyRefunded + toRefund > original)
        throw new Error("Refund amount exceeds original payment");

      const newRefunded = alreadyRefunded + toRefund;
      const updates = {
        refundedAmount: newRefunded,
        refundDate: new Date(),
        refundTransactionRef,
        refundReason,
        status:
          newRefunded >= original
            ? paymentStatus.REFUNDED ?? 4
            : paymentStatus.PROCESSING ?? 1,
      };

      await pay.update(updates, { transaction: t });
      return toDTO(pay);
    });
  }

  static async getPaymentsByStatus(statusList) {
    const rows = await PaymentModel.findAll({
      where: {
        status: {
          [Op.in]: statusList,
        },
      },
    });
    return toDTOs(rows);
  }

  static async getAllWithDetails() {
    return await PaymentModel.findAll({
      include: [
        {
          model: db.booking,
          as: "booking",
          include: [
            {
              model: db.customer,
              as: "customer",
              include: [
                {
                  model: db.user,
                  as: "user",
                  attributes: ["fullName", "phone"],
                },
              ],
            },
            {
              model: db.hall,
              as: "hall",
              include: [
                {
                  model: db.restaurant,
                  as: "restaurant",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });
  }

  static async getDetail(paymentID) {
    return await PaymentModel.findByPk(paymentID, {
      include: [
        {
          model: db.booking,
          as: "booking",
          include: [
            {
              model: db.customer,
              as: "customer",
              include: [
                {
                  model: db.user,
                  as: "user",
                  attributes: ["fullName", "phone"],
                },
              ],
            },
            {
              model: db.hall,
              as: "hall",
              include: [
                {
                  model: db.restaurant,
                  as: "restaurant",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });
  }
  
  static async updateStatus(paymentID, status) {
    const [updated] = await PaymentModel.update(
      { status },
      { where: { paymentID } }
    );
    return updated > 0;
  }
}

export default PaymentDAO;
