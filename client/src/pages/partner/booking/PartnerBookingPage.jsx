import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PartnerLayout from "../../../layouts/PartnerLayout";
import BookingCard from "./BookingCard";
import { useBooking } from "../../../hooks/useBooking";

const TIME_SLOTS = [
  { label: "Buổi trưa (10:30 - 14:00)", startTime: "10:30", endTime: "14:00" },
  { label: "Buổi tối (17:30 - 21:00)", startTime: "17:30", endTime: "21:00" },
];

export default function PartnerBookingPage() {
  const navigate = useNavigate();
  const {
    partnerBookings,
    partnerStatus,
    partnerError,
    loadPartnerBookings,
    acceptByPartner,
    rejectByPartner,
    loadBookingDetail,
  } = useBooking();
  const [activeTab, setActiveTab] = useState("pending");
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState(""); // will store startTime like "10:30"
  const loading = partnerStatus === 'loading';
  const error = partnerError || "";
  const restaurants = useMemo(() => {
    // derive restaurant options from bookings
    const map = new Map();
    for (const b of (partnerBookings || [])) {
      const r = b.hall?.restaurant || b.restaurant;
      if (r?.restaurantID && !map.has(r.restaurantID)) {
        map.set(r.restaurantID, { restaurantID: r.restaurantID, name: r.name });
      }
    }
    return Array.from(map.values());
  }, [partnerBookings]);

  useEffect(() => {
    loadPartnerBookings({ detailed: true });
  }, [loadPartnerBookings]);

  // --- Chuẩn bị dữ liệu booking có đầy đủ thông tin ---
  const bookings = useMemo(() => {
    return (partnerBookings || []).map((b) => {
      const r = b.hall?.restaurant || b.restaurant || {};
      const h = b.hall || {};
      const m = b.menu || {};
      const c = b.customer?.user || b.customer || {};
      return {
        ...b,
        hallID: h.hallID || b.hallID,
        hallName: h.name || "Không xác định",
        restaurantID: r.restaurantID || b.restaurantID || null,
        restaurantName: r.name || "Không xác định",
        restaurantThumbnail: r.thumbnailURL || "",
        menuName: m.name || "Không xác định",
        fullName: c.fullName || c.name || "Ẩn danh",
        phone: c.phone || "Không có",
        email: c.email || "Không có",
        // normalize checked to 0/1 for stable comparisons
        checked: Number(b.isChecked ?? b.checked ?? 0),
        totalAmount: b.totalAmount ?? 0,
      };
    });
  }, [partnerBookings]);

  // --- Lọc dữ liệu theo tab và filter ---
  const filteredBookings = useMemo(() => {
    let data = [];

    switch (activeTab) {
      case "pending":
        // Chỉ lọc theo trạng thái chờ xử lý
        data = bookings.filter((b) => b.status === 0);
        break;
      case "confirmed":
        // Đã xác nhận: ACCEPTED(1) + CONFIRMED(3)
        data = bookings.filter((b) => [1, 3].includes(b.status));
        break;
      case "deposited":
        // Đã cọc: DEPOSITED(4)
        data = bookings.filter((b) => b.status === 4);
        break;
      case "completed":
        // Hoàn tất: COMPLETED(7)
        data = bookings.filter((b) => b.status === 7);
        break;
      case "cancelled":
        // Đã hủy: CANCELLED(6)
        data = bookings.filter((b) => b.status === 6);
        break;
      case "rejected":
        // Từ chối: REJECTED(2)
        data = bookings.filter((b) => b.status === 2);
        break;
      default:
        data = bookings;
    }

    return data.filter(
      (b) =>
        (!restaurantFilter || b.restaurantID === Number(restaurantFilter)) &&
        (!dateFilter || b.eventDate === dateFilter) &&
        (!timeFilter || (b.startTime || "").slice(0, 5) >= timeFilter)
    );
  }, [activeTab, restaurantFilter, dateFilter, timeFilter, bookings]);

  // --- Hành động ---

  const handleReject = async (bookingID) => {
    if (!window.confirm("Bạn có chắc muốn từ chối booking này?")) return;
    try {
      await rejectByPartner(bookingID, 'Partner rejected');
    } catch (e) {
      alert(e.message || 'Từ chối thất bại');
    }
  };

  const handleAccept = async (bookingID) => {
    if (!window.confirm("Xác nhận chấp nhận booking này?")) return;
    try {
      await acceptByPartner(bookingID);
      // status update handled via slice
    } catch (e) {
      alert(e.message || 'Chấp nhận thất bại');
    }
  };

  const handleView = async (bookingObj) => {
    const id = bookingObj?.bookingID ?? bookingObj;
    // Kích hoạt load chi tiết qua hooks; không chờ cũng được để điều hướng nhanh
    try { loadBookingDetail(id); } catch {}
    // Truyền kèm object để trang chi tiết dùng ngay trong lúc đợi detail
    navigate(`/partner/bookings/${id}` , { state: { booking: bookingObj } });
  };

  // current selected label for select (fallback to empty)
  const currentSlotLabel =
    TIME_SLOTS.find((s) => s.startTime === timeFilter)?.label || "";

  return (
    <PartnerLayout>
      <div className="p-3">
        <h3 className="mb-3 fw-bold text-primary">Quản lý đặt tiệc</h3>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
          justify
        >
          <Tab eventKey="all" title="Tất cả" />
          <Tab eventKey="pending" title="Chờ xử lý" />
          <Tab eventKey="confirmed" title="Đã xác nhận" />
          <Tab eventKey="deposited" title="Đã cọc" />
          <Tab eventKey="completed" title="Hoàn tất" />
          <Tab eventKey="cancelled" title="Đã hủy" />
          <Tab eventKey="rejected" title="Từ chối" />
        </Tabs>

        {/* Filters */}
        <Row className="mb-3">
          <Col md={5}>
            <Form.Select
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
            >
              <option value="">-- Chọn nhà hàng --</option>
              {restaurants.map((r) => (
                <option key={r.restaurantID} value={r.restaurantID}>
                  {r.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Select
                value={currentSlotLabel}
                onChange={(e) => {
                  const label = e.target.value;
                  const slot = TIME_SLOTS.find((s) => s.label === label);
                  setTimeFilter(slot ? slot.startTime : "");
                }}
              >
                <option value="">-- Khung giờ --</option>
                {TIME_SLOTS.map((s) => (
                  <option key={s.label} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Booking Cards */}
        <Row>
          {loading && (
            <div className="text-center text-muted py-4">Đang tải dữ liệu...</div>
          )}
          {!loading && error && (
            <div className="text-center text-danger py-4">{error}</div>
          )}
          {filteredBookings.length > 0 ? (
            filteredBookings.map((b) => (
              <Col md={4} key={b.bookingID} className="mb-3">
                <BookingCard
                  booking={b}
                  activeTab={activeTab}
                  // Gửi luôn object b sang detail qua navigate state
                  onViewDetail={() => handleView(b)}
                  onReject={handleReject}
                  onAccept={handleAccept}
                />
              </Col>
            ))
          ) : (
            <div className="text-center text-muted py-4">
              Không có booking nào phù hợp
            </div>
          )}
        </Row>
      </div>
    </PartnerLayout>
  );
}