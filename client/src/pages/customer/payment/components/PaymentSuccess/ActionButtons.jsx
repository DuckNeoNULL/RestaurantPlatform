// components/PaymentSuccess/ActionButtons.jsx
import React from "react";
import { Link } from "react-router-dom";

const ActionButtons = ({ bookingData }) => (
  <div className="action-buttons mt-3">
    <div className="row">
      <div className="col-md-4 mb-3">
        <Link
          to={`/booking/${bookingData?.bookingID}?payment=1`}
          className="btn btn-primary w-100"
        >
          <i className="fas fa-file-contract me-2"></i> Xem hợp đồng
        </Link>
      </div>
      <div className="col-md-4 mb-3">
        <Link
          to={`/booking/${bookingData?.bookingID}?payment=1`}
          className="btn btn-success w-100"
        >
          <i className="fas fa-history me-2"></i> Lịch sử thanh toán
        </Link>
      </div>
      <div className="col-md-4 mb-3">
        <Link
          to={`/booking/${bookingData?.bookingID}?payment=1`}
          className="btn btn-outline-primary w-100"
        >
          <i className="fas fa-arrow-left me-2"></i> Quay lại đặt tiệc
        </Link>
      </div>
    </div>
  </div>
);

export default ActionButtons;
