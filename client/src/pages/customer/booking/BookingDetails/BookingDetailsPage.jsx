import React, { useState, useEffect } from "react";
import {
  useParams,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Spinner,
  Badge,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import OverviewTab from "./components/OverviewTab";
import ContractTab from "./components/ContractTab";
import ReportIssueModal from "./components/ReportIssueModal";
import ScrollToTopButton from "../../../../components/ScrollToTopButton";
import "../../../../styles/BookingDetailsStyles.css";
import useBooking from "../../../../hooks/useBooking";
import MainLayout from "../../../../layouts/MainLayout";
import PaymentSummary from "../../payment/components/PaymentPage/PaymentSummary";
import usePayment from "../../../../hooks/usePayment";


const PRIMARY = "#D81C45";

function buildDetailPayload(b) {
  // ---- Customer ----
  const rawCustomer = b.customer || {};
  const embeddedUser = rawCustomer.user || {};
  const customer = {
    fullName: embeddedUser.fullName || rawCustomer.fullName || rawCustomer.name || "Khách hàng",
    phone: embeddedUser.phone || rawCustomer.phone || "N/A",
    email: embeddedUser.email || rawCustomer.email || "N/A",
  };

  // ---- Restaurant ----
  const restaurant = {
    name: b.hall?.restaurant?.name || b.restaurant?.name || "Nhà hàng",
    address:
      b.hall?.restaurant?.fullAddress ||
      b.restaurant?.fullAddress ||
      b.hall?.restaurant?.address ||
      b.restaurant?.address ||
      "Đang cập nhật",
    thumbnailURL: b.hall?.restaurant?.thumbnailURL || b.restaurant?.thumbnailURL || "",
    phone: b.hall?.restaurant?.phone || b.restaurant?.phone || "",
  };

  // ---- Hall ----
  const hall = {
    hallID: b.hall?.hallID,
    restaurantID: b.hall?.restaurantID || b.restaurant?.restaurantID,
    name: b.hall?.name || "Sảnh",
    capacity: b.hall?.maxTable || b.tableCount || 0,
    area: Number(b.hall?.area) || 0,
    price: Number(b.hall?.price) || 0,
    minTable: b.hall?.minTable,
    maxTable: b.hall?.maxTable,
  };

  // ---- Menu & Categories ----
  // Prefer provided menu.categories (already structured). If not, reconstruct from bookingdishes.
  let categories = [];
  if (Array.isArray(b.menu?.categories) && b.menu.categories.length) {
    categories = b.menu.categories.map(cat => ({
      categoryID: cat.categoryID,
      name: cat.name || `Danh mục ${cat.categoryID}`,
      requiredQuantity: cat.requiredQuantity || cat.category?.requiredQuantity,
      dishes: (cat.dishes || []).map(d => ({
        id: d.dishID || d.id,
        dishID: d.dishID || d.id,
        name: d.name,
        imageURL: d.imageURL,
        categoryID: d.categoryID,
      }))
    }));
  } else {
    const dishMap = {};
    (b.bookingdishes || []).forEach(bd => {
      const d = bd.dish || {};
      const cid = d.categoryID;
      if (!dishMap[cid]) {
        dishMap[cid] = {
          categoryID: cid,
          name: d.category?.name || `Danh mục ${cid}`,
          requiredQuantity: d.category?.requiredQuantity,
          dishes: []
        };
      }
      dishMap[cid].dishes.push({
        id: d.dishID,
        dishID: d.dishID,
        name: d.name,
        imageURL: d.imageURL,
        categoryID: cid,
      });
    });
    categories = Object.values(dishMap);
  }
  const menu = {
    menuID: b.menu?.menuID || b.menuID,
    name: b.menu?.name || "Menu đã chọn",
    price: Number(b.menu?.price) || 0,
    categories,
  };

  // ---- Services ---- (use bookingservices to keep original structure)
  const bookingservices = (b.bookingservices || []).map(bs => ({
    bookingID: bs.bookingID,
    serviceID: bs.serviceID,
    quantity: bs.quantity || 1,
    appliedPrice: Number(bs.appliedPrice) || Number(bs.service?.price) || 0,
    service: {
      serviceID: bs.service?.serviceID || bs.serviceID,
      name: bs.service?.name || "Dịch vụ",
      price: bs.service?.price,
      unit: bs.service?.unit,
    }
  }));

  // ---- Simple services view model (for UI display & pricing when provided by store) ----
  const services = Array.isArray(b.services) && b.services.length
    ? b.services.map(s => ({
        id: s.id || s.serviceID,
        name: s.name || s.service?.name || "Dịch vụ",
        quantity: s.quantity || 1,
        price: Number(s.price ?? s.appliedPrice ?? s.service?.price) || 0,
      }))
    : bookingservices.map(bs => ({
        id: bs.serviceID,
        name: bs.service?.name || "Dịch vụ",
        quantity: bs.quantity || 1,
        price: Number(bs.appliedPrice) || Number(bs.service?.price) || 0,
      }));

  // ---- Promotions ----
  const bookingpromotions = (b.bookingpromotions || []).map(bp => ({
    bookingID: bp.bookingID,
    promotionID: bp.promotionID,
    promotion: {
      promotionID: bp.promotion?.promotionID || bp.promotionID,
      name: bp.promotion?.name,
      description: bp.promotion?.description,
      discountType: bp.promotion?.discountType,
      discountValue: bp.promotion?.discountValue,
      startDate: bp.promotion?.startDate,
      endDate: bp.promotion?.endDate,
    }
  }));

  // ---- Booking dishes (preserve original for Redux hydration) ----
  const bookingdishes = (b.bookingdishes || []).map(bd => ({
    bookingID: bd.bookingID,
    dishID: bd.dishID,
    dish: bd.dish,
  }));

  return {
    bookingID: b.bookingID,
    status: b.status ?? 0,
    eventType: b.eventType?.name || "Tiệc cưới",
    eventTypeID: b.eventType?.eventTypeID || b.eventTypeID,
    eventDate: b.eventDate,
    startTime: b.startTime || "18:00:00",
    endTime: b.endTime || "22:00:00",
    tableCount: b.tableCount || 0,
    specialRequest: b.specialRequest || "",
    createdAt: b.createdAt || new Date().toISOString(),
    customer,
    restaurant,
    hall,
    menu,
    bookingdishes,
    bookingservices,
    services,
    bookingpromotions,
    payments: b.payments || [],
    contract: b.contract || { content: "Hợp đồng dịch vụ...", status: 0, signedAt: null },
    originalPrice: Number(b.originalPrice) || 0,
    discountAmount: Number(b.discountAmount) || 0,
    VAT: Number(b.VAT) || 0,
    totalAmount: Number(b.totalAmount) || 0,
  };
}

// ================== COMPONENT ================== //
export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { booking: bookingSlice, hydrateFromDTO, setFinancial } = useBooking();

  const [activeKey, setActiveKey] = useState("overview");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const navigate = useNavigate();
  const { startCheckout, checkoutStatus, checkoutError } = usePayment();

  // --- tab switch ---
  useEffect(() => {
    if (location.pathname.endsWith("/contract")) setActiveKey("contract");
    else if (location.pathname.endsWith("/payments")) setActiveKey("payments");
    else setActiveKey("overview");
  }, [location.pathname]);

  // --- Load data ---
  useEffect(() => {
    if (hasLoaded) return;

    // 0️⃣ Try route state first (when navigation supplied booking via state)
    const stateBooking = location.state?.booking;
    if (stateBooking) {
      try {
        const normalized = buildDetailPayload(stateBooking);
        setBooking(normalized);
        try {
          hydrateFromDTO(normalized);
          setFinancial({
            originalPrice: normalized.originalPrice,
            discountAmount: normalized.discountAmount,
            VAT: normalized.VAT,
            totalAmount: normalized.totalAmount,
          });
        } catch (e) {}
        // persist raw payload for reloads
        try { sessionStorage.setItem(`booking_${normalized.bookingID}`, JSON.stringify(stateBooking)); } catch (e) {}
        setHasLoaded(true);
        setLoading(false);
        return;
      } catch (e) {
        console.warn("Failed to normalize state booking", e);
      }
    }

    // 1️⃣ Fall back to sessionStorage
    const stored = sessionStorage.getItem(`booking_${bookingId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalized = buildDetailPayload(parsed);
        setBooking(normalized);
        try {
          hydrateFromDTO(normalized);
          setFinancial({
            originalPrice: normalized.originalPrice,
            discountAmount: normalized.discountAmount,
            VAT: normalized.VAT,
            totalAmount: normalized.totalAmount,
          });
        } catch (e) {}
        setHasLoaded(true);
        setLoading(false);
        return;
      } catch (err) {
        console.warn("Cannot parse stored booking", err);
      }
    }

    // 2️⃣ Final fallback: try fetching detail from API
    const fetchRemote = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          const normalized = buildDetailPayload(data);
          setBooking(normalized);
          try {
            hydrateFromDTO(normalized);
            setFinancial({
              originalPrice: normalized.originalPrice,
              discountAmount: normalized.discountAmount,
              VAT: normalized.VAT,
              totalAmount: normalized.totalAmount,
            });
          } catch (e) {}
          try { sessionStorage.setItem(`booking_${normalized.bookingID}`, JSON.stringify(data)); } catch (e) {}
          setHasLoaded(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Remote booking fetch failed", e);
      }

      // no data -> notify and go back
      setLoading(false);
      setHasLoaded(true);
      alert("Không tìm thấy thông tin đặt tiệc. Vui lòng quay lại trang danh sách.");
      navigate(-1);
    };

    fetchRemote();
  }, [bookingId, hasLoaded, location.state, hydrateFromDTO, setFinancial, navigate]);


  // --- Payment state ---
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    setPaymentCompleted(paymentStatus === "1");
  }, [searchParams]);

  const handleApprove = () => {
    if (window.confirm("Xác nhận tiệc này?")) {
      const updated = { ...booking, status: 1, acceptedAt: new Date() };
      setBooking(updated);
      sessionStorage.setItem("currentBooking", JSON.stringify(updated));
      alert("Đã xác nhận!");
    }
  };

  const handleReject = () => {
    if (window.confirm("Bạn chắc chắn muốn hủy?")) {
      const updated = { ...booking, status: 2, rejectedAt: new Date() };
      setBooking(updated);
      sessionStorage.setItem("currentBooking", JSON.stringify(updated));
      alert("Đã hủy đặt tiệc!");
    }
  };

  const getStatusText = (s) =>
  ({
    0: "Chờ xác nhận",
    1: "Đã chấp nhận",
    2: "Bị từ chối",
    3: "Chuẩn bị đặt cọc",
    4: "Đã đặt cọc",
    5: "Quá hạn",
    6: "Đã hủy",
    7: "Hoàn thành",
  }[s] || "Không xác định");

  if (loading || !booking)
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" style={{ color: PRIMARY }} />
      </Container>
    );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleStartDeposit = async () => {
    if (!booking) return;
    try {
      const buyer = {
        name: booking.customer?.fullName,
        email: booking.customer?.email,
        phone: booking.customer?.phone,
      };
      const action = await startCheckout(booking.bookingID, buyer);
      const payload = action?.payload;
      const url = payload?.checkoutUrl || payload?.raw?.checkoutUrl || payload?.raw?.shortLink;
      if (url) {
        window.location.href = url;
      } else {
        alert("Không lấy được link thanh toán.");
      }
    } catch (e) {
      alert("Tạo link thanh toán thất bại");
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }} className="container-fluid">
        <Container fluid className="py-4">
          <Card
            className="mb-3"
            style={{ borderRadius: 12, overflow: "hidden" }}
          >
            <Card.Body
              style={{
                background: PRIMARY,
                color: "#fff",
              }}
            >
              <Row className="align-items-center">
                <Col md={8}>
                  <h2 className="mb-1">Chi tiết đặt tiệc</h2>
                  <div>
                    {booking.restaurant.name} • {formatDate(booking.eventDate)}
                  </div>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Badge
                    bg="light"
                    text="dark"
                    style={{
                      color: PRIMARY,
                      border: `2px solid ${PRIMARY}`,
                      padding: "0.65rem 1rem",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {getStatusText(booking.status)}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Tab.Container
            activeKey={activeKey}
            onSelect={(k) => {
              setActiveKey(k);
              navigate(`/booking/${bookingId}/${k === "overview" ? "" : k}`);
            }}
          >
            <Card>
              <Card.Body>
                <Nav variant="tabs" activeKey={activeKey} className="mb-3">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="overview"
                      style={{ color: PRIMARY, fontWeight: 600 }}
                    >
                      Tổng quan
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="contract"
                      style={{ color: PRIMARY, fontWeight: 600 }}
                    >
                      Hợp đồng
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="payments"
                      style={{ color: PRIMARY, fontWeight: 600 }}
                    >
                      Thanh toán
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="overview">
                    <OverviewTab
                      booking={booking}
                      onUpdateBooking={(updated) => {
                        setBooking(updated);
                        sessionStorage.setItem("currentBooking", JSON.stringify(updated));
                      }}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      isApproved={booking.status === 1}
                      paymentCompleted={paymentCompleted}
                    />
                  </Tab.Pane>

                  <Tab.Pane eventKey="contract">
                    <ContractTab booking={booking} />
                  </Tab.Pane>

                  <Tab.Pane eventKey="payments">
                    <div className="mb-3">
                      <h5 style={{ fontWeight: 700, color: "#111827" }}>Thanh toán đặt cọc</h5>
                      <div className="text-muted">Xem tóm tắt thanh toán và tiến hành đặt cọc.</div>
                    </div>
                    <Row>
                      <Col md={6} className="mb-3">
                        <PaymentSummary booking={booking} />
                      </Col>
                      <Col md={6} className="d-flex align-items-start justify-content-start">
                        <Button
                          onClick={handleStartDeposit}
                          variant="primary"
                          disabled={checkoutStatus === "loading"}
                        >
                          {checkoutStatus === "loading" ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Đang tạo link...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-credit-card me-2"></i>
                              Tiến hành đặt cọc
                            </>
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>

          <ScrollToTopButton />
        </Container>
      </div>
    </MainLayout>

  );
}
