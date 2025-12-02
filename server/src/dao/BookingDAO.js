import db from '../config/db.js';
import { Op } from 'sequelize';
import { toDTO, toDTOs } from '../utils/convert/dto.js';
import BookingStatus from '../models/enums/BookingStatus.js';
import UserDAO from './userDao.js';
import MenuDAO from './MenuDAO.js';
import DishDAO from './DishDAO.js';
import DishCategoryDAO from './DishCategoryDAO.js';
// Models from Sequelize
const {
  sequelize,
  booking: BookingModel,
  bookingdish: BookingDishModel,
  bookingservice: BookingServiceModel,
  bookingpromotion: BookingPromotionModel,
  hall: HallModel,
  restaurant: RestaurantModel,
  restaurantpartner: RestaurantPartnerModel,
  menu: MenuModel,
  dish: DishModel,
  service: ServiceModel,
  promotion: PromotionModel,
  customer: CustomerModel,
  eventtype: EventTypeModel,
  user: UserModel,
  address: AddressModel, // Add AddressModel
  dishcategory: DishCategoryModel,
} = db;

class BookingDAO {
  // Create a booking and optionally attach dishes, services, promotions using junction tables
  static async createBooking(
    bookingData,
    { dishIDs = [], services = [], promotionIDs = [], transaction = null } = {}
  ) {
    const runner = async (t) => {
      const newBooking = await BookingModel.create(bookingData, { transaction: t });

      // Attach dishes (bookingdish)
      if (Array.isArray(dishIDs) && dishIDs.length > 0) {
        const rows = dishIDs.map((dishID) => ({ bookingID: newBooking.bookingID, dishID }));
        await BookingDishModel.bulkCreate(rows, { ignoreDuplicates: true, transaction: t });
      }

      // Attach services (bookingservice): expect array of { serviceID, quantity, appliedPrice }
      if (Array.isArray(services) && services.length > 0) {
        const rows = services.map((s) => ({
          bookingID: newBooking.bookingID,
          serviceID: s.serviceID,
          quantity: s.quantity ?? 1,
          appliedPrice: s.appliedPrice,
        }));
        await BookingServiceModel.bulkCreate(rows, { ignoreDuplicates: true, transaction: t });
      }

      // Attach promotions (bookingpromotion)
      if (Array.isArray(promotionIDs) && promotionIDs.length > 0) {
        const rows = promotionIDs.map((promotionID) => ({ bookingID: newBooking.bookingID, promotionID }));
        await BookingPromotionModel.bulkCreate(rows, { ignoreDuplicates: true, transaction: t });
      }

      return toDTO(newBooking);
    };
    if (transaction) return runner(transaction);
    return sequelize.transaction(runner);
  }

  // Get bookings for a customer with optional filters
  static async getBookingsByCustomer({ customerID, status = null, isChecked = null }) {
    if (customerID == null) return [];
    const where = { customerID };
    if (status != null) where.status = status;
    if (isChecked != null) where.isChecked = !!isChecked;

    const rows = await BookingModel.findAll({
      where,
      include: [
        {
          model: CustomerModel,
          as: 'customer',
          attributes: { exclude: ['password'] },
          include: [
            { model: UserModel, as: 'user', attributes: { exclude: ['password'] } }
          ]
        },
        { model: EventTypeModel, as: 'eventType' },
        {
          model: HallModel,
          as: 'hall',
          include: [{
            model: RestaurantModel,
            as: 'restaurant',
            include: [
              { model: RestaurantPartnerModel, as: 'partner' },
              { model: AddressModel, as: 'address', attributes: ['fullAddress'] } // Only return fullAddress
            ]
          }]
        },
        { model: MenuModel, as: 'menu' },
        {
          model: BookingDishModel,
          as: 'bookingdishes',
          include: [{
            model: DishModel,
            as: 'dish',
            include: [{ model: DishCategoryModel, as: 'category' }]
          }]
        },
        {
          model: BookingServiceModel,
          as: 'bookingservices',
          include: [{ model: ServiceModel, as: 'service' }]
        },
        {
          model: BookingPromotionModel,
          as: 'bookingpromotions',
          include: [{ model: PromotionModel, as: 'promotion' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const dtos = toDTOs(rows);
    // Fetch menu data using MenuDAO and add categories for each booking
    for (const booking of dtos) {
      if (booking.menuID) {
        const menuData = await MenuDAO.getByID(booking.menuID, { includeDishes: false });
        if (menuData) {
          booking.menu = menuData;
          // Add categories to menu based on booking dishes
          const categoryMap = {};
          booking.bookingdishes.forEach(bd => {
            if (bd.dish && bd.dish.categoryID) {
              if (!categoryMap[bd.dish.categoryID]) {
                categoryMap[bd.dish.categoryID] = {
                  categoryID: bd.dish.categoryID,
                  name: bd.dish.category?.name || 'Unknown',
                  dishes: []
                };
              }
              categoryMap[bd.dish.categoryID].dishes.push(bd.dish);
            }
          });
          booking.menu.categories = Object.values(categoryMap);
        }
      }
    }
    // Replace addressID with fullAddress in restaurant
    dtos.forEach(booking => {
      if (booking.hall?.restaurant) {
        booking.hall.restaurant.fullAddress = booking.hall.restaurant.address?.fullAddress;
        delete booking.hall.restaurant.address;
      }
    });
    return dtos;
  }

  // Get the Restaurant Partner owning the hall where this booking is placed
  static async getRestaurantPartnerByHallID(hallID) {
    const hall = await HallModel.findByPk(hallID, {
      include: [{
        model: RestaurantModel,
        as: 'restaurant',
        include: [{ model: RestaurantPartnerModel, as: 'partner' }]
      }]
    });
    if (!hall) return null;
    const partner = hall.restaurant?.partner;
    return toDTO(partner);
  }

  // Back-compat: original code expected a list; return [partner] or []
  static async getRestaurantPartnersByHallID(hallID) {
    const p = await this.getRestaurantPartnerByHallID(hallID);
    return p ? [p] : [];
  }

  static async updateBookingStatus(bookingID, newStatus, { isChecked } = {}) {
    return this.updateBookingStatusWithTransaction(bookingID, newStatus, { isChecked });
  }

  // Transaction-aware update; Service should open transaction and pass it when required.
  static async updateBookingStatusWithTransaction(bookingID, newStatus, { isChecked = undefined, transaction = null } = {}) {
    const updates = { status: newStatus };
    if (typeof isChecked !== 'undefined') updates.isChecked = !!isChecked;
    const [affected] = await BookingModel.update(updates, { where: { bookingID }, transaction });
    return affected > 0;
  }

  // Get booking row with optional FOR UPDATE lock when a transaction is provided
  static async getBookingForUpdate(bookingID, { transaction = null } = {}) {
    if (transaction) {
      // lock the row within the provided transaction
      return BookingModel.findByPk(bookingID, { transaction, lock: transaction.LOCK.UPDATE });
    }
    return BookingModel.findByPk(bookingID);
  }

  static async markBookingChecked(bookingID) {
    const [affected] = await BookingModel.update({ isChecked: true }, { where: { bookingID } });
    return affected > 0;
  }

  // Find overlapping bookings for a hall on a given date and time range, and only hall is at deposit stage
  static async findByHallAndTime(hallID, eventDate, startTime, endTime) {
    const rows = await BookingModel.findAll({
      where: {
        hallID,
        status: { [Op.in]: [BookingStatus.DEPOSITED, BookingStatus.COMPLETED, BookingStatus.MANUAL_BLOCKED] }, 
        eventDate,
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime: { [Op.gt]: startTime } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    return toDTOs(rows);
  }
  static async searchHallAvailable(hallID, eventDate, startTime, endTime) {
    const rows = await BookingModel.findAll({
      where: {
        hallID,
        // capacity will larger and equal, 
        status: { [Op.in]: [BookingStatus.DEPOSITED, BookingStatus.COMPLETED, BookingStatus.MANUAL_BLOCKED] }, 
        eventDate,
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime: { [Op.gt]: startTime } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    return toDTOs(rows);
  }

  // Find bookings for a customer on a specific date
  static async findByCustomerAndDate(customerID, eventDate) {
    const rows = await BookingModel.findAll({ where: { customerID, eventDate }, order: [['createdAt', 'DESC']] });
    return toDTOs(rows);
  }

  // Return all bookings (simple admin listing)
  static async getAllBookings() {
    const rows = await BookingModel.findAll({ order: [['createdAt', 'DESC']] });
    return toDTOs(rows);
  }

  // Get a booking by id (simple wrapper)
  static async getBookingById(bookingID) {
    const row = await BookingModel.findByPk(bookingID);
    return toDTO(row);
  }

  // Generic update for booking (partial fields) — returns boolean
  static async updateBooking(bookingID, updates) {
    const [affected] = await BookingModel.update(updates, { where: { bookingID } });
    return affected > 0;
  }

  // Retrieve full booking details with junction data
  static async getBookingDetails(bookingID) {
    const row = await BookingModel.findByPk(bookingID, {
      include: [
        {
          model: CustomerModel,
          as: 'customer',
          attributes: { exclude: ['password'] },
          include: [{ model: UserModel, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: EventTypeModel, as: 'eventType' },
        {
          model: HallModel,
          as: 'hall',
          include: [{
            model: RestaurantModel,
            as: 'restaurant',
            include: [
              { model: RestaurantPartnerModel, as: 'partner' },
              { model: AddressModel, as: 'address', attributes: ['fullAddress'] } // Only return fullAddress
            ]
          }]
        },
        // Remove menu include - will fetch via MenuDAO
        {
          model: BookingDishModel,
          as: 'bookingdishes',
          include: [{
            model: DishModel,
            as: 'dish',
            include: [{ model: DishCategoryModel, as: 'category' }]
          }]
        },
        {
          model: BookingServiceModel,
          as: 'bookingservices',
          include: [{ model: ServiceModel, as: 'service' }]
        },
        {
          model: BookingPromotionModel,
          as: 'bookingpromotions',
          include: [{ model: PromotionModel, as: 'promotion' }]
        }
      ]
    });
    const dto = toDTO(row);
    
    // Fetch menu data using MenuDAO
    if (dto?.menuID) {
      try {
        const allMenus = await MenuDAO.getByRestaurantID(dto.hall?.restaurant?.restaurantID).catch(() => []);
        // Find the specific menu for this booking
        dto.menu = allMenus.find(menu => menu.menuID === dto.menuID) || null;
        
        // Add categories to menu based on booking dishes
        if (dto.menu && dto.bookingdishes?.length > 0) {
          // Get all dish categories for this restaurant
          const allCategories = await DishDAO.getCategoriesByRestaurantID(dto.hall?.restaurant?.restaurantID).catch(() => []);
          
          // Group dishes by categoryID from bookingdishes
          const dishesByCategory = {};
          dto.bookingdishes.forEach(bookingDish => {
            if (bookingDish.dish?.categoryID) {
              if (!dishesByCategory[bookingDish.dish.categoryID]) {
                dishesByCategory[bookingDish.dish.categoryID] = [];
              }
              dishesByCategory[bookingDish.dish.categoryID].push(bookingDish.dish.name);
            }
          });
          
          // Create categories array for the menu
          dto.menu.categories = allCategories
            .filter(cat => dishesByCategory[cat.categoryID]) // Only include categories that have dishes in this booking
            .map(cat => ({
              ...cat,
              dishes: dishesByCategory[cat.categoryID] || []
            }));
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
        dto.menu = null;
      }
    }
    
    // Replace addressID with fullAddress in restaurant
    if (dto?.hall?.restaurant) {
      dto.hall.restaurant.fullAddress = dto.hall.restaurant.address?.fullAddress;
      delete dto.hall.restaurant.address;
    }
    return dto;
  }

  static async getBookingsByPartner(partnerID) {
    if (!partnerID) return [];
    const rows = await BookingModel.findAll({
      include: [
        {
          model: CustomerModel,
          as: 'customer',
          attributes: { exclude: ['password'] },
          include: [{ model: UserModel, as: 'user', attributes: { exclude: ['password'] } }]
        },
        {
          model: HallModel,
          as: 'hall',
          include: [{
            model: RestaurantModel,
            as: 'restaurant',
            include: [{
              model: RestaurantPartnerModel,
              as: 'partner',
              where: { restaurantPartnerID: partnerID },
              attributes: [] // we only need to filter; omit partner fields
            }]
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return toDTOs(rows);
  }

  /**
   * Get partner-owned bookings with full details (customer, eventType, hall->restaurant, menu,
   * dishes, services, promotions). Intended for partner list pages that need rich DTOs.
   */
  static async getBookingsByPartnerDetailed(partnerID) {
    if (!partnerID) return [];
    const rows = await BookingModel.findAll({
      include: [
      {
          model: CustomerModel,
          as: 'customer',
          attributes: { exclude: ['password'] },
          include: [{ model: UserModel, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: EventTypeModel, as: 'eventType' },
        {
          model: HallModel,
          as: 'hall',
          include: [{
            model: RestaurantModel,
            as: 'restaurant',
            include: [
              {
                model: RestaurantPartnerModel,
                as: 'partner',
                where: { restaurantPartnerID: partnerID },
              },
              { model: AddressModel, as: 'address', attributes: ['fullAddress'] } // Only return fullAddress
            ]
          }]
        },
        { model: MenuModel, as: 'menu' },
        {
          model: BookingDishModel,
          as: 'bookingdishes',
          include: [{
            model: DishModel,
            as: 'dish',
            include: [{ model: DishCategoryModel, as: 'category' }]
          }]
        },
        {
          model: BookingServiceModel,
          as: 'bookingservices',
          include: [{ model: ServiceModel, as: 'service' }]
        },
        {
          model: BookingPromotionModel,
          as: 'bookingpromotions',
          include: [{ model: PromotionModel, as: 'promotion' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    const dtos = toDTOs(rows);
    // Replace addressID with fullAddress in restaurant
    dtos.forEach(booking => {
      if (booking.hall?.restaurant) {
        booking.hall.restaurant.fullAddress = booking.hall.restaurant.address?.fullAddress;
        delete booking.hall.restaurant.address;
      }
    });
    return dtos;
  }

  // Replace dishes for a booking
  static async setBookingDishes(bookingID, dishIDs = []) {
    return sequelize.transaction(async (t) => {
      await BookingDishModel.destroy({ where: { bookingID }, transaction: t });
      if (dishIDs.length > 0) {
        const rows = dishIDs.map((dishID) => ({ bookingID, dishID }));
        await BookingDishModel.bulkCreate(rows, { transaction: t });
      }
      return true;
    });
  }

  // Replace services for a booking
  static async setBookingServices(bookingID, services = []) {
    return sequelize.transaction(async (t) => {
      await BookingServiceModel.destroy({ where: { bookingID }, transaction: t });
      if (services.length > 0) {
        const rows = services.map((s) => ({
          bookingID,
          serviceID: s.serviceID,
          quantity: s.quantity ?? 1,
          appliedPrice: s.appliedPrice,
        }));
        await BookingServiceModel.bulkCreate(rows, { transaction: t });
      }
      return true;
    });
  }

  // Replace promotions for a booking
  static async setBookingPromotions(bookingID, promotionIDs = []) {
    return sequelize.transaction(async (t) => {
      await BookingPromotionModel.destroy({ where: { bookingID }, transaction: t });
      if (promotionIDs.length > 0) {
        const rows = promotionIDs.map((promotionID) => ({ bookingID, promotionID }));
        await BookingPromotionModel.bulkCreate(rows, { transaction: t });
      }
      return true;
    });
  }

  static async deleteBooking(bookingID) {
    return sequelize.transaction(async (t) => {
      await BookingDishModel.destroy({ where: { bookingID }, transaction: t });
      await BookingServiceModel.destroy({ where: { bookingID }, transaction: t });
      await BookingPromotionModel.destroy({ where: { bookingID }, transaction: t });
      const affected = await BookingModel.destroy({ where: { bookingID }, transaction: t });
      return affected > 0;
    });
  }


  // Return a batch of bookingIDs for CONFIRMED bookings older than cutoff, ordered by createdAt ASC
  static async findConfirmedIdsOlderThan(cutoffDate, limit = 1000) {
    if (!(cutoffDate instanceof Date) || isNaN(cutoffDate.getTime())) {
      throw new Error('Invalid cutoffDate');
    }
    const rows = await BookingModel.findAll({
      where: {
        status: BookingStatus.CONFIRMED,
        createdAt: { [Op.lte]: cutoffDate },
      },
      attributes: ['bookingID'],
      order: [['createdAt', 'ASC']],
      limit,
    });
    return rows.map((r) => r.bookingID);
  }

  // Expire by a specific list of booking IDs (guarded by status)
  static async expireByIds(ids, { setChecked = true } = {}) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const updates = { status: BookingStatus.EXPIRED };
    if (setChecked) updates.isChecked = true;
    const [affected] = await BookingModel.update(updates, {
      where: {
        bookingID: { [Op.in]: ids },
        status: BookingStatus.CONFIRMED,
      },
    });
    return affected;
  }

  // Batch loop using index (status, createdAt). Safer for large datasets.
  static async bulkExpireConfirmedOlderThanBatch(cutoffDate, { batchSize = 1000, setChecked = true } = {}) {
    let total = 0;
    while (true) {
      const ids = await this.findConfirmedIdsOlderThan(cutoffDate, batchSize);
      if (ids.length === 0) break;
      const affected = await this.expireByIds(ids, { setChecked });
      total += affected;
      if (ids.length < batchSize) break;
    }
    return total;
  }

  /// write for me raw sql to get total booking count with status deposited, to get rank, i can post on my web take 8 restaurants with most deposited bookings + completed bookings + manual bookings status 4 7 8
  static async getTopBookedRestaurants(statuses = [4, 7, 8], limit = 8) {
    if (!Array.isArray(statuses) || statuses.length === 0) return [];

    const rows = await sequelize.query(
      `SELECT r.restaurantID, r.name, COUNT(b.bookingID) AS cnt
       FROM restaurant r
       JOIN hall h ON h.restaurantID = r.restaurantID
       JOIN booking b ON b.hallID = h.hallID AND b.status IN (:statuses)
       WHERE r.status = 1
       GROUP BY r.restaurantID, r.name
       ORDER BY cnt DESC
       LIMIT :limit`,
      {
        replacements: { statuses, limit },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return rows.map((r) => ({ ...r, count: Number(r.cnt ?? r.count ?? 0) }));
  }

  static async topRatedRestaurantReview(limit = 8) {
    const rows = await sequelize.query(
      `SELECT r.restaurantID, r.name, AVG(rv.rating) AS avgRating, COUNT(rv.reviewID) AS cnt
       FROM restaurant r
       JOIN hall h ON h.restaurantID = r.restaurantID
       JOIN booking b ON b.hallID = h.hallID
       JOIN review rv ON rv.bookingID = b.bookingID
       WHERE r.status = 1
       GROUP BY r.restaurantID, r.name
       ORDER BY avgRating DESC, cnt DESC
       LIMIT :limit`,
      {
        replacements: { limit },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return rows.map((r) => ({
      ...r,
      avgRating: Number(r.avgRating ?? 0),
      count: Number(r.cnt ?? 0)
    }));
  }
}

export default BookingDAO;
