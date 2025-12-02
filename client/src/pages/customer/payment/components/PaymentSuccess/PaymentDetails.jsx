// components/PaymentSuccess/PaymentDetails.jsx
import React from "react";

const PaymentDetails = ({ paymentData }) => (
  <div className="card payment-details-card">
    <div className="card-header">
      <h5 className="card-title mb-0">
        <i className="fas fa-receipt"></i> Chi tiết thanh toán
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
            <span className="amount">{paymentData.amount?.toLocaleString()} VNĐ</span>
          </div>
          <div className="detail-item">
            <label>Phương thức:</label>
            <span>{paymentData.paymentMethod}</span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="detail-item">
            <label>Ngày thanh toán:</label>
            <span>{new Date(paymentData.paymentDate).toLocaleDateString("vi-VN")}</span>
          </div>
          <div className="detail-item">
            <label>Thời gian:</label>
            <span>{new Date(paymentData.paymentDate).toLocaleTimeString("vi-VN")}</span>
          </div>
          <div className="detail-item">
            <label>Trạng thái:</label>
            <span className="status-success">Thành công</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentDetails;
