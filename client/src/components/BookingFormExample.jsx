import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    createBookingAndNavigate,
    validateBookingForm,
    calculateBookingTotal,
    showBookingSuccessNotification,
    handleBookingError
} from '../utils/bookingUtils';
import '../styles/BookingFormExample.css';

const BookingFormExample = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        email: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        tableCount: 1,
        hallId: '',
        hallName: '',
        capacity: 0,
        area: 0,
        menuId: '',
        menuName: '',
        menuPrice: 0,
        specialRequest: '',
        eventType: 'Tiệc cưới',
        services: [],
        selectedServices: []
    });

    // Load restaurant data from sessionStorage
    React.useEffect(() => {
        const selectedRestaurant = sessionStorage.getItem('selectedRestaurant');
        if (selectedRestaurant) {
            const restaurant = JSON.parse(selectedRestaurant);
            // Pre-fill data from selected hall
            if (restaurant.selectedHall) {
                setFormData(prev => ({
                    ...prev,
                    hallId: restaurant.selectedHall.hallId,
                    hallName: restaurant.selectedHall.hallName,
                    capacity: restaurant.selectedHall.capacity,
                    area: restaurant.selectedHall.area
                }));
            }
            // Pre-fill menu if available
            if (restaurant.menus && restaurant.menus.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    menuId: restaurant.menus[0].id,
                    menuName: restaurant.menus[0].name,
                    menuPrice: restaurant.menus[0].price
                }));
            }
        }
    }, []);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateBookingForm(formData);
        if (!validation.isValid) {
            const errorObj = {};
            validation.errors.forEach(error => {
                // Map errors to form fields (simplified)
                if (error.includes('Tên khách hàng')) errorObj.customerName = error;
                else if (error.includes('Số điện thoại')) errorObj.phone = error;
                else if (error.includes('Email')) errorObj.email = error;
                else if (error.includes('Ngày tổ chức')) errorObj.eventDate = error;
                else if (error.includes('Giờ bắt đầu')) errorObj.startTime = error;
                else if (error.includes('Giờ kết thúc')) errorObj.endTime = error;
                else if (error.includes('Số bàn')) errorObj.tableCount = error;
                else if (error.includes('sảnh')) errorObj.hallId = error;
                else if (error.includes('menu')) errorObj.menuId = error;
            });
            setErrors(errorObj);
            return;
        }

        setIsSubmitting(true);

        try {
            // Lấy dịch vụ đã chọn từ restaurant data
            const selectedRestaurant = sessionStorage.getItem('selectedRestaurant');
            let selectedServicesData = [];
            
            if (selectedRestaurant) {
                const restaurant = JSON.parse(selectedRestaurant);
                if (restaurant.services) {
                    selectedServicesData = restaurant.services.filter(service => 
                        formData.selectedServices.includes(service.id)
                    ).map(service => ({
                        name: service.name,
                        price: service.price,
                        quantity: 1
                    }));
                }
            }
            
            // Calculate totals
            const calculations = calculateBookingTotal({
                ...formData,
                services: selectedServicesData
            });
            
            const bookingData = {
                ...formData,
                services: selectedServicesData,
                ...calculations
            };
            
            // Debug: Log dữ liệu trước khi tạo booking
            console.log('Form data:', formData);
            console.log('Selected services:', selectedServicesData);
            console.log('Calculations:', calculations);
            console.log('Booking data:', bookingData);
            
            // Create booking and navigate (frontend only)
            const newBooking = createBookingAndNavigate(bookingData, navigate);
            
            // Show success notification
            showBookingSuccessNotification(newBooking);
            
        } catch (error) {
            handleBookingError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title mb-0">
                                <i className="fas fa-calendar-plus"></i> Đặt tiệc
                            </h3>
                            {(() => {
                                const selectedRestaurant = sessionStorage.getItem('selectedRestaurant');
                                if (selectedRestaurant) {
                                    const restaurant = JSON.parse(selectedRestaurant);
                                    return (
                                        <div className="mt-2">
                                            <small className="text-muted">Nhà hàng đã chọn:</small>
                                            <h5 className="text-primary mb-0">{restaurant.restaurantName}</h5>
                                            <small className="text-muted">{restaurant.restaurantAddress}</small>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="customerName" className="form-label">
                                                Tên khách hàng *
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.customerName ? 'is-invalid' : ''}`}
                                                id="customerName"
                                                name="customerName"
                                                value={formData.customerName}
                                                onChange={handleInputChange}
                                                placeholder="Nhập tên khách hàng"
                                            />
                                            {errors.customerName && (
                                                <div className="invalid-feedback">
                                                    {errors.customerName}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="phone" className="form-label">
                                                Số điện thoại *
                                            </label>
                                            <input
                                                type="tel"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Vui lòng nhập số điện thoại"
                                                maxLength={10}
                                                onInput={(e) => {
                                                    // Chỉ cho phép nhập số
                                                    e.target.value = e.target.value.replace(/\D/g, '');
                                                }}
                                            />
                                            {errors.phone && (
                                                <div className="invalid-feedback">
                                                    {errors.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="example@email.com"
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback">
                                                    {errors.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="eventDate" className="form-label">
                                                Ngày tổ chức *
                                            </label>
                                            <input
                                                type="date"
                                                className={`form-control ${errors.eventDate ? 'is-invalid' : ''}`}
                                                id="eventDate"
                                                name="eventDate"
                                                value={formData.eventDate}
                                                onChange={handleInputChange}
                                            />
                                            {errors.eventDate && (
                                                <div className="invalid-feedback">
                                                    {errors.eventDate}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="startTime" className="form-label">
                                                Giờ bắt đầu *
                                            </label>
                                            <input
                                                type="time"
                                                className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                                                id="startTime"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleInputChange}
                                            />
                                            {errors.startTime && (
                                                <div className="invalid-feedback">
                                                    {errors.startTime}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="endTime" className="form-label">
                                                Giờ kết thúc *
                                            </label>
                                            <input
                                                type="time"
                                                className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                                                id="endTime"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleInputChange}
                                            />
                                            {errors.endTime && (
                                                <div className="invalid-feedback">
                                                    {errors.endTime}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="tableCount" className="form-label">
                                                Số bàn *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                className={`form-control ${errors.tableCount ? 'is-invalid' : ''}`}
                                                id="tableCount"
                                                name="tableCount"
                                                value={formData.tableCount}
                                                onChange={handleInputChange}
                                            />
                                            {errors.tableCount && (
                                                <div className="invalid-feedback">
                                                    {errors.tableCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="hallId" className="form-label">
                                                Sảnh đã chọn *
                                            </label>
                                            <div className="form-control" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{formData.hallName || 'Chưa chọn sảnh'}</strong>
                                                        {formData.capacity && (
                                                            <small className="text-muted d-block">
                                                                Sức chứa: {formData.capacity} khách • Diện tích: {formData.area} m²
                                                            </small>
                                                        )}
                                                    </div>
                                                    <i className="fas fa-check-circle text-success"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="menuId" className="form-label">
                                        Menu có sẵn *
                                    </label>
                                    <div className="form-control" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{formData.menuName || 'Chưa chọn menu'}</strong>
                                                {formData.menuPrice && (
                                                    <small className="text-muted d-block">
                                                        Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.menuPrice)}/bàn
                                                    </small>
                                                )}
                                            </div>
                                            <i className="fas fa-check-circle text-success"></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Dịch vụ bổ sung
                                    </label>
                                    <div className="row">
                                        {(() => {
                                            const selectedRestaurant = sessionStorage.getItem('selectedRestaurant');
                                            if (selectedRestaurant) {
                                                const restaurant = JSON.parse(selectedRestaurant);
                                                return restaurant.services ? restaurant.services.map((service, index) => (
                                                    <div key={index} className="col-md-6 mb-2">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`service-${service.id}`}
                                                                value={service.id}
                                                                checked={formData.selectedServices.includes(service.id)}
                                                                onChange={(e) => {
                                                                    const serviceId = parseInt(e.target.value);
                                                                    if (e.target.checked) {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            selectedServices: [...prev.selectedServices, serviceId]
                                                                        }));
                                                                    } else {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            selectedServices: prev.selectedServices.filter(id => id !== serviceId)
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                            <label className="form-check-label" htmlFor={`service-${service.id}`}>
                                                                <strong>{service.name}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}/{service.unit}
                                                                </small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                )) : null;
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="specialRequest" className="form-label">
                                        Yêu cầu đặc biệt
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="specialRequest"
                                        name="specialRequest"
                                        rows="3"
                                        value={formData.specialRequest}
                                        onChange={handleInputChange}
                                        placeholder="Nhập yêu cầu đặc biệt (nếu có)"
                                    />
                                </div>

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <Link
                                        to="/restaurant/detail"
                                        className="btn me-md-2"
                                        style={{
                                            backgroundColor: '#fefaf9',
                                            color: '#993344',
                                            borderColor: '#993344',
                                            border: '2px solid #993344',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <i className="fas fa-arrow-left"></i> Quay lại
                                    </Link>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                        style={{
                                            backgroundColor: '#993344',
                                            color: '#fefaf9',
                                            borderColor: '#993344'
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane"></i> Gửi yêu cầu đặt chỗ
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingFormExample;
