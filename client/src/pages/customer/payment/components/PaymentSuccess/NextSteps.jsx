// components/PaymentSuccess/NextSteps.jsx
import React from "react";

const NextSteps = () => (
  <div className="card next-steps-card">
    <div className="card-header">
      <h5 className="card-title mb-0">
        <i className="fas fa-list-check"></i> Các bước tiếp theo
      </h5>
    </div>
    <div className="card-body">
      <div className="steps-list">
        <div className="step-item completed">
          <div className="step-icon">
            <i className="fas fa-check"></i>
          </div>
          <div className="step-content">
            <h6>Thanh toán hoàn tất</h6>
            <p>Bạn đã thanh toán thành công</p>
          </div>
        </div>
        <div className="step-item current">
          <div className="step-icon">
            <i className="fas fa-file-contract"></i>
          </div>
          <div className="step-content">
            <h6>Ký hợp đồng</h6>
            <p>Bây giờ bạn có thể ký hợp đồng dịch vụ</p>
          </div>
        </div>
        <div className="step-item">
          <div className="step-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="step-content">
            <h6>Chuẩn bị sự kiện</h6>
            <p>Chúng tôi sẽ liên hệ để chuẩn bị chi tiết</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default NextSteps;
