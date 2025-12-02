import BookingService from '../services/Booking/BookingServices.js';
import { normalizeTime } from '../utils/timeUtils.js';

class BookingController {
    // ========== CRUD CƠ BẢN ==========

    // GET /api/bookings - Get all bookings
    static async getAllBookings(req, res) {
        try {
            const bookings = await BookingService.getAllBookings();
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/me - Get bookings of the authenticated customer
    static async getMyBookings(req, res) {
        try {
            const customerID = req.user?.userId;
            if (!customerID) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const bookings = await BookingService.getBookingsByCustomerId(customerID, {
                status: req.query.status ? parseInt(req.query.status) : null,
                isChecked: req.query.isChecked === 'true' ? true : (req.query.isChecked === 'false' ? false : null)
            });
            res.status(200).json({ success: true, data: bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /api/bookings/:id - Get booking by ID
    static async getBookingById(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingService.getBookingById(id);
            res.status(200).json({
                success: true,
                data: booking
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/customer/:customerID - Get bookings by customer
    static async getBookingsByCustomerId(req, res) {
        try {
            const { customerID } = req.params;
            const bookings = await BookingService.getBookingsByCustomerId(customerID, {
              status: req.query.status ? parseInt(req.query.status) : null,
              isChecked: req.query.isChecked === 'true' ? true : (req.query.isChecked === 'false' ? false : null)
            });
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/restaurant/:restaurantID - Get bookings by restaurant
    static async getBookingsByRestaurantId(req, res) {
        try {
            const { restaurantID } = req.params;
            const bookings = await BookingService.getBookingsByRestaurantId(restaurantID);
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/partner/me - Get bookings under partner-owned restaurants
    static async getBookingsByCurrentPartner(req, res) {
        try {
            const partnerID = req.user?.userId;
            if (!partnerID) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const include = req.query.include;
            const detailed = include === 'details' || include === 'all';
            const bookings = await BookingService.getBookingsByPartnerId(partnerID, { detailed });
            res.status(200).json({ success: true, data: bookings, detailed });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /api/bookings/restaurant/:restaurantID/status/:status - Get bookings by restaurant and status
    static async getBookingsByRestaurantAndStatus(req, res) {
        try {
            const { restaurantID, status } = req.params;
            const bookings = await BookingService.getBookingsByRestaurantAndStatus(
                restaurantID, 
                parseInt(status)
            );
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/bookings - Create new booking
    static async createBooking(req, res) {
        try {
            // Normalize time fields in request body
            const bookingData = { ...req.body };
            if (bookingData.startTime) {
                bookingData.startTime = normalizeTime(bookingData.startTime);
            }
            if (bookingData.endTime) {
                bookingData.endTime = normalizeTime(bookingData.endTime);
            }
            const booking = await BookingService.createBooking(bookingData);
            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/bookings/manual - Create manual (external) booking (partner/admin only)
    static async createManualBooking(req, res) {
        try {
            const partnerID = req.user?.userId;
            if (!partnerID) return res.status(401).json({ success: false, message: 'Unauthorized' });
            // Normalize time fields in request body
            const bookingData = { ...req.body };
            if (bookingData.startTime) {
                bookingData.startTime = normalizeTime(bookingData.startTime);
            }
            if (bookingData.endTime) {
                bookingData.endTime = normalizeTime(bookingData.endTime);
            }
            const booking = await BookingService.setBooking(bookingData, partnerID);
            res.status(201).json({ success: true, message: 'Manual booking created', data: booking });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // PUT /api/bookings/:id - Update booking
    static async updateBooking(req, res) {
        try {
            const { id } = req.params;
            // Normalize time fields in request body
            const updateData = { ...req.body };
            if (updateData.startTime) {
                updateData.startTime = normalizeTime(updateData.startTime);
            }
            if (updateData.endTime) {
                updateData.endTime = normalizeTime(updateData.endTime);
            }
            const booking = await BookingService.updateBooking(id, updateData);
            res.status(200).json({
                success: true,
                message: 'Booking updated successfully',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /api/bookings/:id - Delete booking
    static async deleteBooking(req, res) {
        try {
            const { id } = req.params;
            const result = await BookingService.deleteBooking(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // ========== QUẢN LÝ TRẠNG THÁI ==========

    // PUT /api/bookings/:id/accept - Accept booking
    static async acceptBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingService.acceptBooking(id);
            res.status(200).json({
                success: true,
                message: 'Booking accepted successfully',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/bookings/:id/reject - Reject booking
    static async rejectBooking(req, res) {
        try {
            const { id } = req.params;
                const reason = req.body?.reason || '';
                const booking = await BookingService.rejectBooking(id);
            res.status(200).json({
                success: true,
                message: 'Booking rejected',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/bookings/:id/confirm - Confirm booking
    static async confirmBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingService.confirmBooking(id);
            res.status(200).json({
                success: true,
                message: 'Booking confirmed successfully',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/bookings/:id/deposit - Mark as deposited
    static async markAsDeposited(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingService.markAsDeposited(id);
            res.status(200).json({
                success: true,
                message: 'Booking marked as deposited',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/bookings/:id/complete - Complete booking
    static async completeBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingService.completeBooking(id);
            res.status(200).json({
                success: true,
                message: 'Booking completed successfully',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/bookings/:id/cancel - Cancel booking
    static async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingService.cancelBooking(id);
            res.status(200).json({
                success: true,
                message: 'Booking cancelled',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/bookings/:id/status - Update booking status
    static async updateBookingStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const reason = req.body?.reason || undefined;
            const actorId = req.user?.userId;
            const actorRole = req.user?.role;

            // Delegate RBAC and transition validation to service layer. Pass actor info so
            // service can perform authorization checks and register audit info if needed.
            const booking = await BookingService.updateBookingStatus(id, status, { actorId, actorRole, reason });

            res.status(200).json({
                success: true,
                message: 'Booking status updated',
                data: booking
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/bookings/:id/check - Update checked status
    static async updateCheckedStatus(req, res) {
        try {
            const { id } = req.params;
            const { isChecked } = req.body;
            const result = await BookingService.updateCheckedStatus(id, isChecked);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // ========== PARTNER ACTIONS ==========
    // POST /api/bookings/:id/partner/accept
    static async acceptByPartner(req, res) {
        try {
            const { id } = req.params;
            const partnerID = req.user?.userId;
            if (!partnerID) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const result = await BookingService.acceptByPartner(id, partnerID);
            res.status(200).json({ success: true, message: 'Accepted', data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // POST /api/bookings/:id/partner/reject
    static async rejectByPartner(req, res) {
        try {
            const { id } = req.params;
            const partnerID = req.user?.userId;
            const reason = req.body?.reason || '';
            if (!partnerID) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const result = await BookingService.rejectByPartner(id, partnerID, reason);
            res.status(200).json({ success: true, message: 'Rejected', data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // ========== KIỂM TRA & TÌM KIẾM ==========

    // POST /api/bookings/check-availability - Check hall availability
    static async checkHallAvailability(req, res) {
        try {
            const { hallID, eventDate, startTime, endTime } = req.body;
            // Normalize time format
            const normalizedStartTime = normalizeTime(startTime);
            const normalizedEndTime = normalizeTime(endTime);
            const isAvailable = await BookingService.checkHallAvailability(
                hallID, 
                eventDate, 
                normalizedStartTime, 
                normalizedEndTime
            );
            res.status(200).json({
                success: true,
                available: isAvailable,
                message: isAvailable ? 'Hall is available' : 'Hall is not available'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/hall/:hallID - Get bookings by hall
    static async getBookingsByHallId(req, res) {
        try {
            const { hallID } = req.params;
            const bookings = await BookingService.getBookingsByHallId(hallID);
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/event-type/:eventTypeID - Get bookings by event type
    static async getBookingsByEventType(req, res) {
        try {
            const { eventTypeID } = req.params;
            const bookings = await BookingService.getBookingsByEventType(eventTypeID);
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/status/:status - Get bookings by status
    static async getBookingsByStatus(req, res) {
        try {
            const { status } = req.params;
            const bookings = await BookingService.getBookingsByStatus(parseInt(status));
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/date-range?startDate=&endDate= - Get bookings by date range
    static async getBookingsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const bookings = await BookingService.getBookingsByDateRange(startDate, endDate);
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/upcoming?days=7 - Get upcoming bookings
    static async getUpcomingBookings(req, res) {
        try {
            const days = req.query.days ? parseInt(req.query.days) : 7;
            const bookings = await BookingService.getUpcomingBookings(days);
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/unchecked - Get unchecked bookings
    static async getUncheckedBookings(req, res) {
        try {
            const bookings = await BookingService.getUncheckedBookings();
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ========== THỐNG KÊ & BÁO CÁO ==========

    // GET /api/bookings/statistics - Get bookings statistics
    static async getBookingsStatistics(req, res) {
        try {
            const stats = await BookingService.getBookingsStatistics();
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/restaurant/:restaurantID/statistics - Get restaurant statistics
    static async getRestaurantStatistics(req, res) {
        try {
            const { restaurantID } = req.params;
            const stats = await BookingService.getRestaurantStatistics(restaurantID);
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/count/:status - Count bookings by status
    static async countBookingsByStatus(req, res) {
        try {
            const { status } = req.params;
            const count = await BookingService.countBookingsByStatus(parseInt(status));
            res.status(200).json({
                success: true,
                count: count
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/revenue?startDate=&endDate= - Get total revenue
    static async getTotalRevenue(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const revenue = await BookingService.getTotalRevenue(startDate, endDate);
            res.status(200).json({
                success: true,
                totalRevenue: revenue
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ========== BUSINESS LOGIC BỔ SUNG ==========

    // GET /api/bookings/restaurant/:restaurantID/pending - Get pending bookings for restaurant
    static async getPendingBookingsForRestaurant(req, res) {
        try {
            const { restaurantID } = req.params;
            const bookings = await BookingService.getPendingBookingsForRestaurant(restaurantID);
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/restaurant/:restaurantID/need-deposit - Get bookings needing deposit
    static async getBookingsNeedingDeposit(req, res) {
        try {
            const { restaurantID } = req.params;
            const bookings = await BookingService.getBookingsNeedingDeposit(restaurantID);
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/bookings/active - Get active bookings
    static async getActiveBookings(req, res) {
        try {
            const bookings = await BookingService.getActiveBookings();
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/bookings/mark-expired - Mark expired bookings (scheduled task)
    static async markExpiredBookings(req, res) {
        try {
            const result = await BookingService.markExpiredBookings();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default BookingController;