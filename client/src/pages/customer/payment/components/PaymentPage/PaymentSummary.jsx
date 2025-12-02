import React from "react";
import { Card } from "react-bootstrap";

const PRIMARY = "#D81C45";

const formatCurrency = (amount) =>
  (amount || 0).toLocaleString("vi-VN") + " VNĐ";

const PaymentSummary = ({ booking }) => {
  const originalPrice = booking?.originalPrice || 0;
  const discountAmount = booking?.discountAmount || 0;
  const vatAmount = booking?.VAT || 0;
  const totalAmount =
    booking?.totalAmount || originalPrice - discountAmount + vatAmount;
  const depositAmount = Math.round((totalAmount || 0) * 0.3);

  return (
    <Card className="shadow-sm h-100">
      <Card.Header>
        <h5 className="mb-0" style={{ color: PRIMARY }}>
          <i className="fas fa-receipt me-2"></i> Tóm tắt thanh toán
        </h5>
      </Card.Header>

      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <span>Giá gốc:</span>
          <span>{formatCurrency(originalPrice)}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>Giảm giá:</span>
          <span style={{ color: "green" }}>
            {discountAmount > 0
              ? `-${formatCurrency(discountAmount)}`
              : formatCurrency(0)}
          </span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>VAT (10%):</span>
          <span>{formatCurrency(vatAmount)}</span>
        </div>

        <hr />

        <div className="d-flex justify-content-between fw-semibold mb-2">
          <span>Tổng cộng:</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>

        <div className="d-flex justify-content-between">
          <span>Tiền cọc (30%):</span>
          <span style={{ color: PRIMARY, fontWeight: 600 }}>
            {formatCurrency(depositAmount)}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PaymentSummary;
