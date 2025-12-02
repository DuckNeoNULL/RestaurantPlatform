var DataTypes = require("sequelize").DataTypes;
var _address = require("./address.cjs");
var _amenity = require("./amenity.cjs");
var _bankaccount = require("./bankaccount.cjs");
var _booking = require("./booking.cjs");
var _bookingdish = require("./bookingdish.cjs");
var _bookingpromotion = require("./bookingpromotion.cjs");
var _bookingservice = require("./bookingservice.cjs");
var _contract = require("./contract.cjs");
var _customer = require("./customer.cjs");
var _dish = require("./dish.cjs");
var _dishcategory = require("./dishcategory.cjs");
var _dishmenu = require("./dishmenu.cjs");
var _eventtype = require("./eventtype.cjs");
var _hall = require("./hall.cjs");
var _hallimage = require("./hallimage.cjs");
var _menu = require("./menu.cjs");
var _payment = require("./payment.cjs");
var _payouts = require("./payouts.cjs");
var _promotion = require("./promotion.cjs");
var _promotionservice = require("./promotionservice.cjs");
var _refundpolicy = require("./refundpolicy.cjs");
var _report = require("./report.cjs");
var _restaurant = require("./restaurant.cjs");
var _restaurantamenities = require("./restaurantamenities.cjs");
var _restauranteventtype = require("./restauranteventtype.cjs");
var _restaurantimage = require("./restaurantimage.cjs");
var _restaurantpartner = require("./restaurantpartner.cjs");
var _review = require("./review.cjs");
var _service = require("./service.cjs");
var _systemsetting = require("./systemsetting.cjs");
var _user = require("./user.cjs");

function initModels(sequelize) {
  var address = _address(sequelize, DataTypes);
  var amenity = _amenity(sequelize, DataTypes);
  var bankaccount = _bankaccount(sequelize, DataTypes);
  var booking = _booking(sequelize, DataTypes);
  var bookingdish = _bookingdish(sequelize, DataTypes);
  var bookingpromotion = _bookingpromotion(sequelize, DataTypes);
  var bookingservice = _bookingservice(sequelize, DataTypes);
  var contract = _contract(sequelize, DataTypes);
  var customer = _customer(sequelize, DataTypes);
  var dish = _dish(sequelize, DataTypes);
  var dishcategory = _dishcategory(sequelize, DataTypes);
  var dishmenu = _dishmenu(sequelize, DataTypes);
  var eventtype = _eventtype(sequelize, DataTypes);
  var hall = _hall(sequelize, DataTypes);
  var hallimage = _hallimage(sequelize, DataTypes);
  var menu = _menu(sequelize, DataTypes);
  var payment = _payment(sequelize, DataTypes);
  var payouts = _payouts(sequelize, DataTypes);
  var promotion = _promotion(sequelize, DataTypes);
  var promotionservice = _promotionservice(sequelize, DataTypes);
  var refundpolicy = _refundpolicy(sequelize, DataTypes);
  var report = _report(sequelize, DataTypes);
  var restaurant = _restaurant(sequelize, DataTypes);
  var restaurantamenities = _restaurantamenities(sequelize, DataTypes);
  var restauranteventtype = _restauranteventtype(sequelize, DataTypes);
  var restaurantimage = _restaurantimage(sequelize, DataTypes);
  var restaurantpartner = _restaurantpartner(sequelize, DataTypes);
  var review = _review(sequelize, DataTypes);
  var service = _service(sequelize, DataTypes);
  var systemsetting = _systemsetting(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  amenity.belongsToMany(restaurant, { as: 'restaurantID_restaurants', through: restaurantamenities, foreignKey: "amenityID", otherKey: "restaurantID" });
  booking.belongsToMany(dish, { as: 'dishID_dishes', through: bookingdish, foreignKey: "bookingID", otherKey: "dishID" });
  booking.belongsToMany(promotion, { as: 'promotionID_promotions', through: bookingpromotion, foreignKey: "bookingID", otherKey: "promotionID" });
  booking.belongsToMany(service, { as: 'serviceID_services', through: bookingservice, foreignKey: "bookingID", otherKey: "serviceID" });
  dish.belongsToMany(booking, { as: 'bookingID_bookings', through: bookingdish, foreignKey: "dishID", otherKey: "bookingID" });
  dish.belongsToMany(menu, { as: 'menuID_menus', through: dishmenu, foreignKey: "dishID", otherKey: "menuID" });
  eventtype.belongsToMany(restaurant, { as: 'restaurantID_restaurant_restauranteventtypes', through: restauranteventtype, foreignKey: "eventTypeID", otherKey: "restaurantID" });
  //Sửa as : 'dishID_dish_dishmenus' thành dishes
  menu.belongsToMany(dish, { as: 'dishes', through: dishmenu, foreignKey: "menuID", otherKey: "dishID" });
  promotion.belongsToMany(booking, { as: 'bookingID_booking_bookingpromotions', through: bookingpromotion, foreignKey: "promotionID", otherKey: "bookingID" });
  promotion.belongsToMany(service, { as: 'serviceID_service_promotionservices', through: promotionservice, foreignKey: "promotionID", otherKey: "serviceID" });
  restaurant.belongsToMany(amenity, { as: 'amenityID_amenities', through: restaurantamenities, foreignKey: "restaurantID", otherKey: "amenityID" });
  restaurant.belongsToMany(eventtype, { as: 'eventTypeID_eventtypes', through: restauranteventtype, foreignKey: "restaurantID", otherKey: "eventTypeID" });
  service.belongsToMany(booking, { as: 'bookingID_booking_bookingservices', through: bookingservice, foreignKey: "serviceID", otherKey: "bookingID" });
  service.belongsToMany(promotion, { as: 'promotionID_promotion_promotionservices', through: promotionservice, foreignKey: "serviceID", otherKey: "promotionID" });
  restaurant.belongsTo(address, { as: "address", foreignKey: "addressID"});
  address.hasMany(restaurant, { as: "restaurants", foreignKey: "addressID"});
  restaurantamenities.belongsTo(amenity, { as: "amenity", foreignKey: "amenityID"});
  amenity.hasMany(restaurantamenities, { as: "restaurantamenities", foreignKey: "amenityID"});
  bookingdish.belongsTo(booking, { as: "booking", foreignKey: "bookingID"});
  booking.hasMany(bookingdish, { as: "bookingdishes", foreignKey: "bookingID"});
  bookingpromotion.belongsTo(booking, { as: "booking", foreignKey: "bookingID"});
  booking.hasMany(bookingpromotion, { as: "bookingpromotions", foreignKey: "bookingID"});
  bookingservice.belongsTo(booking, { as: "booking", foreignKey: "bookingID"});
  booking.hasMany(bookingservice, { as: "bookingservices", foreignKey: "bookingID"});
  contract.belongsTo(booking, { as: "booking", foreignKey: "bookingID"});
  booking.hasMany(contract, { as: "contracts", foreignKey: "bookingID"});
  payment.belongsTo(booking, { as: "booking", foreignKey: "bookingID"});
  booking.hasMany(payment, { as: "payments", foreignKey: "bookingID"});
  review.belongsTo(booking, { as: "booking", foreignKey: "bookingID"});
  booking.hasMany(review, { as: "reviews", foreignKey: "bookingID"});
  booking.belongsTo(customer, { as: "customer", foreignKey: "customerID"});
  customer.hasMany(booking, { as: "bookings", foreignKey: "customerID"});
  review.belongsTo(customer, { as: "customer", foreignKey: "customerID"});
  customer.hasMany(review, { as: "reviews", foreignKey: "customerID"});
  bookingdish.belongsTo(dish, { as: "dish", foreignKey: "dishID"});
  dish.hasMany(bookingdish, { as: "bookingdishes", foreignKey: "dishID"});
  dishmenu.belongsTo(dish, { as: "dish", foreignKey: "dishID"});
  dish.hasMany(dishmenu, { as: "dishmenus", foreignKey: "dishID"});
  dish.belongsTo(dishcategory, { as: "category", foreignKey: "categoryID"});
  dishcategory.hasMany(dish, { as: "dishes", foreignKey: "categoryID"});
  dishcategory.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(dishcategory, { as: "dishcategories", foreignKey: "restaurantID"});
  booking.belongsTo(eventtype, { as: "eventType", foreignKey: "eventTypeID"});
  eventtype.hasMany(booking, { as: "bookings", foreignKey: "eventTypeID"});
  restauranteventtype.belongsTo(eventtype, { as: "eventType", foreignKey: "eventTypeID"});
  eventtype.hasMany(restauranteventtype, { as: "restauranteventtypes", foreignKey: "eventTypeID"});
  service.belongsTo(eventtype, { as: "eventType", foreignKey: "eventTypeID"});
  eventtype.hasMany(service, { as: "services", foreignKey: "eventTypeID"});
  booking.belongsTo(hall, { as: "hall", foreignKey: "hallID"});
  hall.hasMany(booking, { as: "bookings", foreignKey: "hallID"});
  hallimage.belongsTo(hall, { as: "hall", foreignKey: "hallID"});
  hall.hasMany(hallimage, { as: "hallimages", foreignKey: "hallID"});
  booking.belongsTo(menu, { as: "menu", foreignKey: "menuID"});
  menu.hasMany(booking, { as: "bookings", foreignKey: "menuID"});
  dishmenu.belongsTo(menu, { as: "menu", foreignKey: "menuID"});
  menu.hasMany(dishmenu, { as: "dishmenus", foreignKey: "menuID"});
  payouts.belongsTo(payment, { as: "payment", foreignKey: "paymentId"});
  payment.hasMany(payouts, { as: "payouts", foreignKey: "paymentId"});
  bookingpromotion.belongsTo(promotion, { as: "promotion", foreignKey: "promotionID"});
  promotion.hasMany(bookingpromotion, { as: "bookingpromotions", foreignKey: "promotionID"});
  promotionservice.belongsTo(promotion, { as: "promotion", foreignKey: "promotionID"});
  promotion.hasMany(promotionservice, { as: "promotionservices", foreignKey: "promotionID"});
  dish.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(dish, { as: "dishes", foreignKey: "restaurantID"});
  hall.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(hall, { as: "halls", foreignKey: "restaurantID"});
  menu.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(menu, { as: "menus", foreignKey: "restaurantID"});
  payment.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(payment, { as: "payments", foreignKey: "restaurantID"});
  promotion.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(promotion, { as: "promotions", foreignKey: "restaurantID"});
  refundpolicy.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantId"});
  restaurant.hasMany(refundpolicy, { as: "refundpolicies", foreignKey: "restaurantId"});
  report.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(report, { as: "reports", foreignKey: "restaurantID"});
  restaurantamenities.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(restaurantamenities, { as: "restaurantamenities", foreignKey: "restaurantID"});
  restauranteventtype.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(restauranteventtype, { as: "restauranteventtypes", foreignKey: "restaurantID"});
  restaurantimage.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(restaurantimage, { as: "restaurantimages", foreignKey: "restaurantID"});
  service.belongsTo(restaurant, { as: "restaurant", foreignKey: "restaurantID"});
  restaurant.hasMany(service, { as: "services", foreignKey: "restaurantID"});
  bankaccount.belongsTo(restaurantpartner, { as: "restaurantPartner", foreignKey: "restaurantPartnerID"});
  restaurantpartner.hasMany(bankaccount, { as: "bankaccounts", foreignKey: "restaurantPartnerID"});
  payouts.belongsTo(restaurantpartner, { as: "restaurantPartner", foreignKey: "restaurantPartnerId"});
  restaurantpartner.hasMany(payouts, { as: "payouts", foreignKey: "restaurantPartnerId"});
  restaurant.belongsTo(restaurantpartner, { as: "partner", foreignKey: "restaurantPartnerID"});
  restaurantpartner.hasMany(restaurant, { as: "restaurants", foreignKey: "restaurantPartnerID"});
  report.belongsTo(review, { as: "review", foreignKey: "reviewID"});
  review.hasMany(report, { as: "reports", foreignKey: "reviewID"});
  bookingservice.belongsTo(service, { as: "service", foreignKey: "serviceID"});
  service.hasMany(bookingservice, { as: "bookingservices", foreignKey: "serviceID"});
  promotionservice.belongsTo(service, { as: "service", foreignKey: "serviceID"});
  service.hasMany(promotionservice, { as: "promotionservices", foreignKey: "serviceID"});
  customer.belongsTo(user, {foreignKey: "customerID",as: "user"});
  user.hasOne(customer, {foreignKey: "customerID",as: "customer"});  
  payouts.belongsTo(user, { as: "releasedBy_user", foreignKey: "releasedBy"});
  user.hasMany(payouts, { as: "payouts", foreignKey: "releasedBy"});
  report.belongsTo(user, { as: "user", foreignKey: "userID"});
  user.hasMany(report, { as: "reports", foreignKey: "userID"});
  restaurantpartner.belongsTo(user, { as: "owner", foreignKey: "restaurantPartnerID" });
  user.hasOne(restaurantpartner, { as: "partner", foreignKey: "restaurantPartnerID" });
  systemsetting.belongsTo(user, { as: "createdBy_user", foreignKey: "createdBy"});
  user.hasMany(systemsetting, { as: "systemsettings", foreignKey: "createdBy"});
  systemsetting.belongsTo(user, { as: "updatedBy_user", foreignKey: "updatedBy"});
  user.hasMany(systemsetting, { as: "updatedBy_systemsettings", foreignKey: "updatedBy"});

  return {
    address,
    amenity,
    bankaccount,
    booking,
    bookingdish,
    bookingpromotion,
    bookingservice,
    contract,
    customer,
    dish,
    dishcategory,
    dishmenu,
    eventtype,
    hall,
    hallimage,
    menu,
    payment,
    payouts,
    promotion,
    promotionservice,
    refundpolicy,
    report,
    restaurant,
    restaurantamenities,
    restauranteventtype,
    restaurantimage,
    restaurantpartner,
    review,
    service,
    systemsetting,
    user,
  };
}
module.exports = initModels;
module.exports.default = initModels;