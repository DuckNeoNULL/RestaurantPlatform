// src/dao/admin/AdminBookingDAO.js
import db from "../../config/db.js";

const {
  booking: BookingModel,
  customer: CustomerModel,
  user: UserModel,
  hall: HallModel,
  restaurant: RestaurantModel,
  eventtype: EventTypeModel,
  menu: MenuModel,
  bookingdish: BookingDishModel,
  bookingservice: BookingServiceModel,
  bookingpromotion: BookingPromotionModel,
  dish: DishModel,
  service: ServiceModel,
  promotion: PromotionModel,
  payment: PaymentModel,
} = db;

class AdminBookingDAO {
  // LIST BOOKINGS
  static async getAllBookings() {
    return await BookingModel.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: CustomerModel,
          as: "customer",
          include: [{ model: UserModel, as: "user" }],
        },
        { model: EventTypeModel, as: "eventType" },
        {
          model: HallModel,
          as: "hall",
          include: [{ model: RestaurantModel, as: "restaurant" }],
        },
      ],
    });
  }

  // DETAIL BOOKING
  static async getBookingDetail(bookingID) {
    return await BookingModel.findByPk(bookingID, {
      include: [
        {
          model: CustomerModel,
          as: "customer",
          include: [{ model: UserModel, as: "user" }],
        },
        { model: EventTypeModel, as: "eventType" },
        {
          model: HallModel,
          as: "hall",
          include: [{ model: RestaurantModel, as: "restaurant" }],
        },
        { model: MenuModel, as: "menu" },

        {
          model: BookingDishModel,
          as: "bookingdishes",
          include: [{ model: DishModel, as: "dish" }],
        },
        {
          model: BookingServiceModel,
          as: "bookingservices",
          include: [{ model: ServiceModel, as: "service" }],
        },
        {
          model: BookingPromotionModel,
          as: "bookingpromotions",
          include: [{ model: PromotionModel, as: "promotion" }],
        },

        { model: PaymentModel, as: "payments" },
      ],
    });
  }

  // UPDATE STATUS
  static async updateStatus(bookingID, status) {
    await BookingModel.update({ status }, { where: { bookingID } });
    return await this.getBookingDetail(bookingID);
  }

  // DELETE
  static async deleteBooking(bookingID) {
    const rows = await BookingModel.destroy({ where: { bookingID } });
    return rows > 0;
  }
}

export default AdminBookingDAO;
