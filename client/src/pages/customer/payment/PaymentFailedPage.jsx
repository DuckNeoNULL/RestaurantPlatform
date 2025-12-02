// client/src/pages/payment/PaymentFailedPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../../styles/PaymentFailedStyles.css";

import FailedHeader from "./components/PaymentFailed/FailedHeader";
import ErrorDetails from "./components/PaymentFailed/ErrorDetails";
import CausesList from "./components/PaymentFailed/CausesList";
import ActionButtons from "./components/PaymentFailed/ActionButtons";
import HelpSection from "./components/PaymentFailed/HelpSection";

const PaymentFailedPage = () => {
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const bookingInfo = JSON.parse(sessionStorage.getItem("currentBooking") || "{}");
    setBookingData(bookingInfo);

    setPaymentData({
      transactionId: "TXN-" + Date.now(),
      amount: (bookingInfo.totalAmount || 0) * 0.3,
      paymentMethod: "Thẻ tín dụng",
      paymentDate: new Date().toISOString(),
      errorMessage: "Giao dịch bị từ chối",
    });
  }, []);

  if (!paymentData) {
    return (
      <div className="payment-failed-container text-center mt-5">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Không tìm thấy thông tin thanh toán.
        </div>
      </div>
    );
  }

  return (
    <div className="payment-failed-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <FailedHeader />
            <ErrorDetails paymentData={paymentData} />
            <CausesList />
            <ActionButtons bookingData={bookingData} />
            <HelpSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
