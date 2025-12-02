// client/src/pages/payment/components/PaymentFailed/CausesList.jsx
import React from "react";

const CausesList = () => (
  <div className="card causes-card">
    <div className="card-header">
      <h5 className="card-title mb-0">
        <i className="fas fa-question-circle"></i> Có thể do các nguyên nhân sau
      </h5>
    </div>
    <div className="card-body">
      <ul className="causes-list">
        <li>
          <i className="fas fa-credit-card text-warning me-2"></i>
          Thông tin thẻ không chính xác hoặc thẻ đã hết hạn
        </li>
        <li>
          <i className="fas fa-ban text-warning me-2"></i>
          Thẻ bị khóa hoặc không được phép giao dịch trực tuyến
        </li>
        <li>
          <i className="fas fa-wallet text-warning me-2"></i>
          Số dư tài khoản không đủ để thực hiện giao dịch
        </li>
        <li>
          <i className="fas fa-wifi text-warning me-2"></i>
          Kết nối mạng không ổn định trong quá trình thanh toán
        </li>
        <li>
          <i className="fas fa-clock text-warning me-2"></i>
          Giao dịch bị timeout do mất quá nhiều thời gian
        </li>
      </ul>
    </div>
  </div>
);

export default CausesList;
