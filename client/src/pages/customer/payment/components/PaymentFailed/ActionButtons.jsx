// client/src/pages/payment/components/PaymentFailed/ActionButtons.jsx
import React from "react";
import { Link } from "react-router-dom";

const ActionButtons = ({ bookingData }) => (
  <div className="action-buttons mt-3">
    <div className="row">
      <div className="col-md-4 mb-3">
        <Link
          to="/payment/new"
          state={{
            bookingData: bookingData,
            retryPayment: true,
          }}
          className="btn btn-primary w-100"
        >
          <i className="fas fa-redo me-2"></i>
          Thử lại thanh toán
        </Link>
      </div>
      <div className="col-md-4 mb-3">
        <Link
          to={`/booking/${bookingData?.bookingID || Date.now()}?payment=0`}
          className="btn btn-outline-primary w-100"
        >
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại đặt tiệc
        </Link>
      </div>
      <div className="col-md-4 mb-3">
        <Link to="/contact" className="btn btn-outline-secondary w-100">
          <i className="fas fa-headset me-2"></i>
          Liên hệ hỗ trợ
        </Link>
      </div>
    </div>
  </div>
);

export default ActionButtons;
