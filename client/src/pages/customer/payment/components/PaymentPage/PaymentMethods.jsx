import React from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

const PRIMARY = "#D81C45";

const PaymentMethods = ({
  paymentMethod,
  setPaymentMethod,
  handlePayment,
  isProcessing,
  timeLeft,
  depositAmount,
  actualBookingId,
  formatCurrency,
}) => {
  return (
    <Card className="shadow-sm h-100">
      <Card.Header>
        <h5 className="mb-0" style={{ color: PRIMARY }}>
          <i className="fas fa-university me-2"></i> Phương thức thanh toán
        </h5>
      </Card.Header>

      <Card.Body>
        <Form>
          <Form.Check
            type="radio"
            id="bank_transfer"
            label="Chuyển khoản ngân hàng"
            name="paymentMethod"
            value="bank_transfer"
            checked={paymentMethod === "bank_transfer"}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mb-2"
          />

          <Form.Check
            type="radio"
            id="zalopay"
            label="ZaloPay"
            name="paymentMethod"
            value="zalopay"
            checked={paymentMethod === "zalopay"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </Form>

        {/* ==================== NÚT THANH TOÁN ==================== */}
        <div className="mt-4">
          <Button
            onClick={handlePayment}
            disabled={isProcessing || timeLeft <= 0}
            className="w-100"
            style={{
              backgroundColor: PRIMARY,
              border: "none",
              padding: "16px 0",
              borderRadius: "12px",
              fontSize: "1.15rem",
              fontWeight: "600",
              color: "#fff",
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? "not-allowed" : "pointer",
              boxShadow: "0px 3px 10px rgba(216,28,69,0.35)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = PRIMARY)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = PRIMARY)
            }
          >
            {isProcessing ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-credit-card me-2"></i>
                Thanh toán {formatCurrency(depositAmount)}
              </>
            )}
          </Button>
        </div>

        {/* ==================== NÚT QUAY LẠI ==================== */}
        <div className="text-center mt-3">
          <Button
            as={Link}
            to={`/booking/${actualBookingId}`}
            className="w-100"
            style={{
              borderRadius: "10px",
              padding: "14px 0",
              border: `2px solid ${PRIMARY}`,
              backgroundColor: "white",
              color: PRIMARY,
              fontWeight: "600",
            }}
          >
            <i className="fas fa-arrow-left me-2"></i> Quay lại
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PaymentMethods;
