        // Booking Details API Service
    import axios from 'axios';

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    /**
     * API service for booking details operations
     */
    class BookingDetailsAPI {
        constructor() {
            this.api = axios.create({
                baseURL: API_BASE_URL,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Add request interceptor for authentication
            this.api.interceptors.request.use(
                (config) => {
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                (error) => {
                    return Promise.reject(error);
                }
            );

            // Add response interceptor for error handling
            this.api.interceptors.response.use(
                (response) => response,
                (error) => {
                    if (error.response?.status === 401) {
                        // Handle unauthorized access
                        localStorage.removeItem('authToken');
                        window.location.href = '/login';
                    }
                    return Promise.reject(error);
                }
            );
        }

        /**
         * Fetch booking details by ID
         * @param {string|number} bookingId - Booking ID
         * @returns {Promise<Object>} Booking details
         */
        async getBookingDetails(bookingId) {
            try {
                const response = await this.api.get(`/bookings/${bookingId}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching booking details:', error);
                throw new Error('Không thể tải thông tin đặt tiệc');
            }
        }

        /**
         * Create manual/external booking (partner only)
         * payload: { hallID, eventDate, startTime, endTime, tableCount, menuID?, eventTypeID?, specialRequest? }
         */
        async createManualBooking(payload) {
            try {
                const response = await this.api.post(`/bookings/manual`, payload);
                return response.data;
            } catch (error) {
                console.error('Error creating manual booking:', error);
                throw new Error('Không thể tạo booking thủ công');
            }
        }

        /**
         * Update booking status
         * @param {string|number} bookingId - Booking ID
         * @param {number} status - New status
         * @param {string} reason - Reason for status change
         * @returns {Promise<Object>} Updated booking
         */
        async updateBookingStatus(bookingId, status, reason = '') {
            try {
                const response = await this.api.patch(`/bookings/${bookingId}/status`, {
                    status,
                    reason
                });
                return response.data;
            } catch (error) {
                console.error('Error updating booking status:', error);
                throw new Error('Không thể cập nhật trạng thái đặt tiệc');
            }
        }

        /**
         * Cancel booking
         * @param {string|number} bookingId - Booking ID
         * @param {string} reason - Cancellation reason
         * @returns {Promise<Object>} Updated booking
         */
        async cancelBooking(bookingId, reason) {
            try {
                const response = await this.api.post(`/bookings/${bookingId}/cancel`, {
                    reason
                });
                return response.data;
            } catch (error) {
                console.error('Error cancelling booking:', error);
                throw new Error('Không thể hủy đặt tiệc');
            }
        }

        /**
         * Sign contract
         * @param {string|number} bookingId - Booking ID
         * @param {string} signature - Customer signature
         * @returns {Promise<Object>} Updated contract
         */
        async signContract(bookingId, signature) {
            try {
                const response = await this.api.post(`/bookings/${bookingId}/contract/sign`, {
                    customerSignature: signature
                });
                return response.data;
            } catch (error) {
                console.error('Error signing contract:', error);
                throw new Error('Không thể ký hợp đồng');
            }
        }

        /**
         * Get contract details
         * @param {string|number} bookingId - Booking ID
         * @returns {Promise<Object>} Contract details
         */
        async getContractDetails(bookingId) {
            try {
                const response = await this.api.get(`/bookings/${bookingId}/contract`);
                return response.data;
            } catch (error) {
                console.error('Error fetching contract details:', error);
                throw new Error('Không thể tải thông tin hợp đồng');
            }
        }

        /**
         * Download contract PDF
         * @param {string|number} bookingId - Booking ID
         * @returns {Promise<Blob>} PDF file
         */
        async downloadContractPDF(bookingId) {
            try {
                const response = await this.api.get(`/bookings/${bookingId}/contract/pdf`, {
                    responseType: 'blob'
                });
                return response.data;
            } catch (error) {
                console.error('Error downloading contract PDF:', error);
                throw new Error('Không thể tải xuống hợp đồng');
            }
        }

        /**
         * Submit report issue
         * @param {Object} reportData - Report data
         * @returns {Promise<Object>} Created report
         */
        async submitReport(reportData) {
            try {
                const response = await this.api.post('/reports', reportData);
                return response.data;
            } catch (error) {
                console.error('Error submitting report:', error);
                throw new Error('Không thể gửi báo cáo');
            }
        }

        /**
         * Get payment history
         * @param {string|number} bookingId - Booking ID
         * @returns {Promise<Array>} Payment history
         */
        async getPaymentHistory(bookingId) {
            try {
                const response = await this.api.get(`/bookings/${bookingId}/payments`);
                return response.data;
            } catch (error) {
                console.error('Error fetching payment history:', error);
                throw new Error('Không thể tải lịch sử thanh toán');
            }
        }

        /**
         * Process payment
         * @param {string|number} bookingId - Booking ID
         * @param {Object} paymentData - Payment data
         * @returns {Promise<Object>} Payment result
         */
        async processPayment(bookingId, paymentData) {
            try {
                const response = await this.api.post(`/bookings/${bookingId}/payments`, paymentData);
                return response.data;
            } catch (error) {
                console.error('Error processing payment:', error);
                throw new Error('Không thể xử lý thanh toán');
            }
        }

        /**
         * Get booking timeline/activity log
         * @param {string|number} bookingId - Booking ID
         * @returns {Promise<Array>} Timeline events
         */
        async getBookingTimeline(bookingId) {
            try {
                const response = await this.api.get(`/bookings/${bookingId}/timeline`);
                return response.data;
            } catch (error) {
                console.error('Error fetching booking timeline:', error);
                throw new Error('Không thể tải lịch sử hoạt động');
            }
        }

        /**
         * Update booking details
         * @param {string|number} bookingId - Booking ID
         * @param {Object} updateData - Data to update
         * @returns {Promise<Object>} Updated booking
         */
        async updateBookingDetails(bookingId, updateData) {
            try {
                const response = await this.api.patch(`/bookings/${bookingId}`, updateData);
                return response.data;
            } catch (error) {
                console.error('Error updating booking details:', error);
                throw new Error('Không thể cập nhật thông tin đặt tiệc');
            }
        }

        /**
         * Get restaurant details
         * @param {string|number} restaurantId - Restaurant ID
         * @returns {Promise<Object>} Restaurant details
         */
        async getRestaurantDetails(restaurantId) {
            try {
                const response = await this.api.get(`/restaurants/${restaurantId}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching restaurant details:', error);
                throw new Error('Không thể tải thông tin nhà hàng');
            }
        }

        /**
         * Get customer details
         * @param {string|number} customerId - Customer ID
         * @returns {Promise<Object>} Customer details
         */
        async getCustomerDetails(customerId) {
            try {
                const response = await this.api.get(`/customers/${customerId}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching customer details:', error);
                throw new Error('Không thể tải thông tin khách hàng');
            }
        }

        /**
         * Send notification
         * @param {string|number} bookingId - Booking ID
         * @param {string} type - Notification type
         * @param {string} message - Notification message
         * @returns {Promise<Object>} Notification result
         */
        async sendNotification(bookingId, type, message) {
            try {
                const response = await this.api.post(`/bookings/${bookingId}/notifications`, {
                    type,
                    message
                });
                return response.data;
            } catch (error) {
                console.error('Error sending notification:', error);
                throw new Error('Không thể gửi thông báo');
            }
        }

        /**
         * Get booking statistics
         * @param {Object} filters - Filter criteria
         * @returns {Promise<Object>} Statistics
         */
        async getBookingStatistics(filters = {}) {
            try {
                const response = await this.api.get('/bookings/statistics', {
                    params: filters
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching booking statistics:', error);
                throw new Error('Không thể tải thống kê');
            }
        }

        /**
         * Export booking data
         * @param {string|number} bookingId - Booking ID
         * @param {string} format - Export format
         * @returns {Promise<Blob>} Exported data
         */
        async exportBookingData(bookingId, format = 'pdf') {
            try {
                const response = await this.api.get(`/bookings/${bookingId}/export`, {
                    params: { format },
                    responseType: 'blob'
                });
                return response.data;
            } catch (error) {
                console.error('Error exporting booking data:', error);
                throw new Error('Không thể xuất dữ liệu');
            }
        }

        /**
         * Upload booking documents
         * @param {string|number} bookingId - Booking ID
         * @param {FormData} formData - File data
         * @returns {Promise<Object>} Upload result
         */
        async uploadBookingDocuments(bookingId, formData) {
            try {
                const response = await this.api.post(`/bookings/${bookingId}/documents`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error uploading documents:', error);
                throw new Error('Không thể tải lên tài liệu');
            }
        }

        /**
         * Get booking documents
         * @param {string|number} bookingId - Booking ID
         * @returns {Promise<Array>} Document list
         */
        async getBookingDocuments(bookingId) {
            try {
                const response = await this.api.get(`/bookings/${bookingId}/documents`);
                return response.data;
            } catch (error) {
                console.error('Error fetching booking documents:', error);
                throw new Error('Không thể tải danh sách tài liệu');
            }
        }

        /**
         * Delete booking document
         * @param {string|number} bookingId - Booking ID
         * @param {string|number} documentId - Document ID
         * @returns {Promise<Object>} Deletion result
         */
        async deleteBookingDocument(bookingId, documentId) {
            try {
                const response = await this.api.delete(`/bookings/${bookingId}/documents/${documentId}`);
                return response.data;
            } catch (error) {
                console.error('Error deleting document:', error);
                throw new Error('Không thể xóa tài liệu');
            }
        }
    }

    // Create singleton instance
    const bookingDetailsAPI = new BookingDetailsAPI();

    export default bookingDetailsAPI;

    // Export individual methods for convenience
    export const {
        getBookingDetails,
        updateBookingStatus,
        cancelBooking,
        signContract,
        getContractDetails,
        downloadContractPDF,
        submitReport,
        getPaymentHistory,
        processPayment,
        getBookingTimeline,
        updateBookingDetails,
        getRestaurantDetails,
        getCustomerDetails,
        sendNotification,
        getBookingStatistics,
        exportBookingData,
        uploadBookingDocuments,
        getBookingDocuments,
        deleteBookingDocument
    } = bookingDetailsAPI;
    export const createManualBooking = (...args) => bookingDetailsAPI.createManualBooking(...args);
