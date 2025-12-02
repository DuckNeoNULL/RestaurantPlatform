// components/PaymentSuccess/BookingSummary.jsx
import React from "react";

const BookingSummary = ({ bookingData }) => {
  if (!bookingData) return null;

  return (
    <div className="card booking-summary-card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="fas fa-calendar-alt"></i> Tóm tắt đặt tiệc
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="summary-item">
              <label>Nhà hàng:</label>
              <span>{bookingData.restaurant?.name}</span>
            </div>
            <div className="summary-item">
              <label>Ngày tổ chức:</label>
              <span>{new Date(bookingData.eventDate).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="summary-item">
              <label>Sảnh:</label>
              <span>{bookingData.hall?.name}</span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="summary-item">
              <label>Số bàn:</label>
              <span>{bookingData.tableCount} bàn</span>
            </div>
            <div className="summary-item">
              <label>Menu:</label>
              <span>{bookingData.menu?.name}</span>
            </div>
            <div className="summary-item">
              <label>Tổng chi phí:</label>
              <span className="total-amount">{bookingData.totalAmount?.toLocaleString()} VNĐ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
