// client/src/pages/payment/components/PaymentFailed/HelpSection.jsx
import React from "react";

const HelpSection = () => (
  <div className="card help-card mt-3">
    <div className="card-header">
      <h5 className="card-title mb-0">
        <i className="fas fa-life-ring"></i> Cần hỗ trợ?
      </h5>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-6">
          <div className="help-item">
            <h6>
              <i className="fas fa-phone text-primary me-2"></i> Hotline hỗ trợ
            </h6>
            <p>1900 1234 (24/7)</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="help-item">
            <h6>
              <i className="fas fa-envelope text-primary me-2"></i> Email hỗ trợ
            </h6>
            <p>support@weddingrestaurant.com</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HelpSection;
