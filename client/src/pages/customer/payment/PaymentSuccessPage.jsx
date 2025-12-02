// client/src/pages/payment/PaymentSuccessPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPayOSStatus } from "../../../services/paymentService";
import "../../../styles/PaymentSuccessStyles.css";
import SuccessHeader from "./components/PaymentSuccess/SuccessHeader";
import PaymentDetails from "./components/PaymentSuccess/PaymentDetails";
import BookingSummary from "./components/PaymentSuccess/BookingSummary";
import ActionButtons from "./components/PaymentSuccess/ActionButtons";
import NextSteps from "./components/PaymentSuccess/NextSteps";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const orderCode = qs.get("orderCode");

    // If coming from PayOS return URL with orderCode, check status via backend
    if (orderCode) {
      (async () => {
        setChecking(true);
        try {
          const res = await getPayOSStatus(orderCode);
          const status = String(res?.status || "").toUpperCase();
          const bookingID = res?.bookingID || orderCode;
          if (status.includes("PAID") || status.includes("SUCCESS")) {
            // flag success and redirect user to booking payment tab
            navigate(`/booking/${bookingID}/payments?payment=1`, { replace: true });
            return;
          } else if (
            status.includes("CANCEL") ||
            status.includes("FAIL") ||
            status.includes("EXPIRE") ||
            status === "PENDING"
          ) {
            navigate(`/payment/failed`, { replace: true });
            return;
          }
        } catch (e) {
          // fall through to local display
        } finally {
          setChecking(false);
        }
      })();
      return;
    }

    // Fallback: legacy local flow
    const bookingInfo = JSON.parse(sessionStorage.getItem("currentBooking") || "{}");
    setBookingData(bookingInfo);
    if (bookingInfo?.payments?.length > 0) {
      const latest = bookingInfo.payments[bookingInfo.payments.length - 1];
      setPaymentData({
        transactionId: "TXN-" + Date.now(),
        amount: latest.amount,
        paymentMethod: latest.paymentMethod,
        paymentDate: latest.paymentDate,
      });
    }
  }, [location.search, navigate]);

  if (checking)
    return (
      <div className="alert alert-info text-center mt-5">
        <span className="spinner-border spinner-border-sm me-2" />
        Đang xác minh thanh toán...
      </div>
    );

  if (!paymentData)
    return (
      <div className="alert alert-warning text-center mt-5">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Không tìm thấy thông tin thanh toán.
      </div>
    );

  return (
    <div className="payment-success-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <SuccessHeader />
            <PaymentDetails paymentData={paymentData} />
            <BookingSummary bookingData={bookingData} />
            <ActionButtons bookingData={bookingData} />
            <NextSteps />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
