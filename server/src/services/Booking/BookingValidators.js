import BookingDAO from "../../dao/BookingDAO.js";
import { ValidationError } from "../utils/errors.js";

const BookingValidator = {
  validateCreateData(data) {
    const required = ["customerID", "eventTypeID", "hallID", "menuID", "eventDate", "startTime", "endTime"];
    for (const key of required) {
      if (!data[key]) throw new ValidationError(`Missing field: ${key}`);
    }

    if (isNaN(data.tableCount) || data.tableCount <= 0)
      throw new ValidationError("Invalid table count.");

    const eventDate = new Date(data.eventDate);
    if (isNaN(eventDate)) throw new ValidationError("Invalid event date format.");
    if (eventDate < new Date()) throw new ValidationError("Event date cannot be in the past.");

    const start = new Date(`1970-01-01T${data.startTime}`);
    const end = new Date(`1970-01-01T${data.endTime}`);
    if (start >= end)
      throw new ValidationError("Invalid time range: startTime must be before endTime.");
  },

  async checkHallAvailability(hallID, eventDate, startTime, endTime) {
    const overlapping = await BookingDAO.findByHallAndTime(hallID, eventDate, startTime, endTime);
    if (overlapping.length > 0)
      throw new ValidationError("This hall is already booked for the selected time range.");
  },

  async checkCustomerLimit(customerID, eventDate) {
    const customerBookings = await BookingDAO.findByCustomerAndDate(customerID, eventDate);
    if (customerBookings.length >= 3)
      throw new ValidationError("Customer has reached the maximum number of bookings for this date.");
  },
};

export default BookingValidator;
