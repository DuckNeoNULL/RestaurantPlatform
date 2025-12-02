// client/src/pages/payment/components/PaymentFailed/ErrorDetails.jsx
import React from "react";

const ErrorDetails = ({ paymentData }) => (
  <div className="card error-details-card">
    <div className="card-header">
      <h5 className="card-title mb-0">
        <i className="fas fa-exclamation-triangle"></i> Chi tiết lỗi
      </h5>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-6">
          <div className="detail-item">
            <label>Mã giao dịch:</label>
            <span>{paymentData.transactionId}</span>
          </div>
          <div className="detail-item">
            <label>Số tiền:</label>
            <span className="amount">
              {paymentData.amount?.toLocaleString()} VNĐ
            </span>
          </div>
          <div className="detail-item">
            <label>Phương thức:</label>
            <span>{paymentData.paymentMethod}</span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="detail-item">
            <label>Thời gian:</label>
            <span>{new Date().toLocaleString("vi-VN")}</span>
          </div>
          <div className="detail-item">
            <label>Trạng thái:</label>
            <span className="status-failed">Thất bại</span>
          </div>
          <div className="detail-item">
            <label>Lý do:</label>
            <span className="error-reason">
              {paymentData.errorMessage || "Không xác định"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ErrorDetails;
