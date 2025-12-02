import React from "react";

const FailedHeader = () => (
  <div className="failed-header text-center">
    <div className="failed-icon">
      <i className="fas fa-times-circle"></i>
    </div>
    <h1 className="failed-title">Thanh toán thất bại</h1>
    <p className="failed-subtitle">
      Rất tiếc, giao dịch của bạn không thể hoàn tất
    </p>
  </div>
);

export default FailedHeader;
