// client/src/pages/payment/PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import CountdownTimer from "./components/PaymentPage/CountdownTimer";
import PaymentSummary from "./components/PaymentPage/PaymentSummary";
import PaymentMethods from "./components/PaymentPage/PaymentMethods";

import MainLayout from "../../../layouts/MainLayout";
import usePayment from "../../../hooks/usePayment";

const PaymentPage = () => {
  const { bookingId } = useParams();

  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [booking, setBooking] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [actualBookingId, setActualBookingId] = useState(bookingId || Date.now().toString());
  const navigate = useNavigate();

  const {
    startCheckout,
    checkout,
    checkoutStatus,
    checkoutError,
    resetCheckout,
  } = usePayment();

  useEffect(() => {
    if (hasLoaded) return;

    const stored = sessionStorage.getItem("currentBooking");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBooking(parsed);
        setActualBookingId(parsed.bookingID || bookingId);
        setHasLoaded(true);
        return;
      } catch {
        console.warn("PaymentPage: parse booking failed");
      }
    }

    const selectedRestaurant = sessionStorage.getItem("selectedRestaurant");
    const restaurantData = selectedRestaurant ? JSON.parse(selectedRestaurant) : null;
    // Nếu không có booking, hiển thị lỗi
    alert("Không tìm thấy thông tin đặt tiệc để thanh toán. Vui lòng quay lại.");
    window.history.back();
  }, [hasLoaded, bookingId]);

  useEffect(() => {
    if (!hasLoaded || paymentCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Hết thời gian thanh toán!");
          navigate("/payment/failed", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasLoaded, paymentCompleted, navigate]);

  const formatCurrency = (amount) => (amount || 0).toLocaleString("vi-VN") + " VNĐ";

  const handlePayment = async () => {
    if (!booking) return;
    setIsProcessing(true);
    resetCheckout();

    const buyer = {
      name: booking?.customer?.user?.fullName || booking?.customer?.fullName || "",
      email: booking?.customer?.user?.email || booking?.customer?.email || "",
      phone: booking?.customer?.user?.phone || booking?.customer?.phone || "",
    };

    try {
      await startCheckout(booking.bookingID, buyer);
      // Redirect will be handled in effect below when checkoutStatus === 'succeeded'
    } catch (err) {
      // startCheckout returns an action promise; errors are reflected in checkoutError
      console.error("startCheckout error", err);
    }
  };

  // When checkout succeeds, remember and redirect to PayOS
  useEffect(() => {
    if (checkoutStatus === "succeeded" && checkout?.checkoutUrl) {
      try {
        sessionStorage.setItem(`payos_checkout_url_${checkout.bookingID}`, checkout.checkoutUrl);
      } catch {}
      window.location.href = checkout.checkoutUrl;
    }
  }, [checkoutStatus, checkout]);

  // If checkout fails because order exists (code: 231), reuse existing link if we saved it
  useEffect(() => {
    if (!isProcessing) return;
    if (checkoutStatus !== "failed") return;
    const msg = String(checkoutError || "");
    const alreadyExists = msg.includes("231") || msg.includes("đã tồn tại") || msg.toLowerCase().includes("exists");
    if (alreadyExists) {
      const cached = sessionStorage.getItem(`payos_checkout_url_${actualBookingId}`);
      if (cached) {
        window.location.href = cached;
        return;
      }
      // Fallback: send user to success route which will verify status and redirect appropriately
      navigate(`/payment/success?orderCode=${actualBookingId}`, { replace: true });
    }
  }, [checkoutStatus, checkoutError, isProcessing, actualBookingId, navigate]);

  if (!hasLoaded || !booking) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 mb-0">Đang tải thông tin thanh toán...</p>
      </Container>
    );
  }

  if (paymentCompleted) {
    return (
      <Container className="mt-5 text-center">
        <Card className="shadow-sm">
          <Card.Body>
            <div style={{ fontSize: 56, color: "#28a745" }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <h2 className="text-success">Thanh toán thành công!</h2>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>

            <div className="d-grid gap-2 mt-4">
              <Button as={Link} to={`/booking/${actualBookingId}/contract`} variant="primary">
                <i className="fas fa-file-contract me-2"></i> Xem hợp đồng
              </Button>
              <Button as={Link} to={`/booking/${actualBookingId}/payments`} variant="success">
                <i className="fas fa-history me-2"></i> Lịch sử thanh toán
              </Button>
              <Button as={Link} to={`/booking/${actualBookingId}`} variant="outline-primary">
                <i className="fas fa-arrow-left me-2"></i> Quay lại đặt tiệc
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: "1200px", margin: "0 160px" }} className="container-fluid ">
        <Container className="mt-4">
          <Row className="justify-content-center">
            <Col lg={8}>
              {/* Header */}
              <Card className="mb-4 shadow-sm text-center">
                <Card.Body>
                  <h2>
                    <i className="fas fa-credit-card me-2"></i> Thanh toán đặt tiệc
                  </h2>
                  <div className="text-muted">
                    {booking.restaurant?.name} • {booking.eventDate}
                  </div>
                </Card.Body>
              </Card>

              {/* Countdown timer */}
              <CountdownTimer timeLeft={timeLeft} />

              {/* Nội dung chính */}
              <Row>
                <Col md={6} className="mb-3">
                  <PaymentSummary booking={booking} />
                </Col>
                <Col md={6}>
                  <PaymentMethods
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    handlePayment={handlePayment}
                    isProcessing={isProcessing || checkoutStatus === "loading"}
                    timeLeft={timeLeft}
                    depositAmount={Math.round((booking.totalAmount || 0) * 0.3)}
                    actualBookingId={actualBookingId}
                    formatCurrency={formatCurrency}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>

    </MainLayout>

  );
};

export default PaymentPage;
