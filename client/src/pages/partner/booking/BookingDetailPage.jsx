// File: BookingDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Button, Row, Col, Table, Badge } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import PartnerLayout from "../../../layouts/PartnerLayout";
import { useBooking } from "../../../hooks/useBooking";

// Mock booking (thay bằng fetch nếu có API)
// Note: Trang này lấy dữ liệu từ Redux qua hook useBooking, không dùng mock.

// Map trạng thái (theo enum hiện tại)
// 0: PENDING, 1: ACCEPTED, 2: REJECTED, 3: CONFIRMED, 4: DEPOSITED, 5: EXPIRED?, 6: CANCELLED, 7: COMPLETED, 8: MANUAL_BLOCKED
const STATUS_TEXT = {
  0: "Đang chờ",
  1: "Đã xác nhận",
  2: "Từ chối",
  3: "Đã xác nhận (khóa lịch)",
  4: "Đã đặt cọc",
  5: "Hết hạn",
  6: "Đã hủy",
  7: "Hoàn tất",
  8: "Đã chặn tay",
};

const mockReviews = [
  {
    reviewId: "R001",
    bookingID: 101,
    customerName: "Nguyễn Văn B",
    rating: 5,
    content: "Dịch vụ tuyệt vời!",
    date: "2025-10-01T14:30:00",
    status: "Visible",
  },
  // ... các review khác
];

// Lọc review của booking này

const bookingReviews = []; // Chưa tích hợp reviews thực tế


export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedBooking = location.state?.booking;
  const {
    partnerBookings,
    partnerStatus,
    partnerError,
    loadPartnerBookings,
    acceptByPartner,
    rejectByPartner,
    bookingDetail,
    bookingDetailStatus,
    bookingDetailError,
    loadBookingDetail,
  } = useBooking();

  const bookingID = useMemo(() => Number(id), [id]);
  const [customerProfile, setCustomerProfile] = useState(null);

  // Load booking detail using the hook
  useEffect(() => {
    if (id && !bookingDetail) {
      loadBookingDetail(id);
    }
  }, [id, bookingDetail, loadBookingDetail]);
  // Helper format
  const toNum = (v) => Number(v ?? 0);
  const formatVND = (val) => (toNum(val)).toLocaleString("vi-VN") + " ₫";
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("vi-VN") + " " + new Date(dateStr).toLocaleTimeString("vi-VN");

  const baseData = bookingDetail;
  // Build dish categories from bookingdishes if available (must be before any early return)
  const dishCategories = useMemo(() => {
    const map = new Map();
    const list = baseData?.bookingdishes || [];
    for (const bd of list) {
      const d = bd?.dish || {};
      const cat = d?.category || {};
      const cid = d?.categoryID || cat?.categoryID;
      const cname = cat?.name || `Danh mục ${cid ?? "-"}`;
      if (!cid) continue;
      if (!map.has(cid)) map.set(cid, { categoryID: cid, name: cname, dishes: [] });
      map.get(cid).dishes.push(d?.name || `Món #${d?.dishID}`);
    }
    return Array.from(map.values());
  }, [baseData?.bookingdishes]);
  // Services total: prefer bookingservices from server, fallback to normalized services
  const servicesTotal = (baseData?.bookingservices?.length
    ? baseData.bookingservices.reduce((sum, bs) => sum + toNum(bs.appliedPrice ?? bs.service?.basePrice) * toNum(bs.quantity ?? 1), 0)
    : (baseData?.services?.reduce((sum, s) => sum + toNum(s.appliedPrice ?? s.price) * toNum(s.quantity ?? 1), 0) ?? 0)
  );

  const hallUnitPrice = toNum(baseData?.hall?.price ?? baseData?.restaurant?.hall?.price);
  const menuUnitPrice = toNum(baseData?.menu?.price ?? baseData?.restaurant?.menu?.price);
  const tables = toNum(baseData?.tableCount ?? 0);
  const menuTotal = menuUnitPrice * tables;

  const subtotal = baseData?.originalPrice != null
    ? toNum(baseData.originalPrice)
    : hallUnitPrice + menuTotal + servicesTotal;

  const discount = toNum(baseData?.discountAmount ?? 0);
  const vat = toNum(baseData?.VAT ?? 0);
  const totalAmount = baseData?.totalAmount != null
    ? toNum(baseData.totalAmount)
    : subtotal - discount + vat;

  // Trạng thái
  const status = baseData?.status;
  const isPending = status === 0;
  const isDeposit = status === 4; // Đặt cọc là 4

  // Actions
  const handleReject = async () => {
    if (!baseData) return;
    if (!window.confirm("Bạn có chắc muốn từ chối booking này?")) return;
    try {
      await rejectByPartner(baseData.bookingID, "Partner rejected");
    } catch (e) {
      alert(e?.message || "Từ chối thất bại");
    }
  };
  const handleViewContract = () => navigate(`/partner/bookings/${baseData.bookingID}/contract`);

  const handleAccept = async () => {
    if (!baseData) return;
    if (!window.confirm("Xác nhận chấp nhận booking này?")) return;
    try {
      await acceptByPartner(baseData.bookingID);
    } catch (e) {
      alert(e?.message || "Chấp nhận thất bại");
    }
  };

  // Loading / error / not-found states
  if ((partnerStatus === 'loading' || bookingDetailStatus === 'loading') && !baseData) {
    return (
      <PartnerLayout>
        <div className="p-4 text-center text-muted">Đang tải thông tin...</div>
      </PartnerLayout>
    );
  }

  if ((partnerError || bookingDetailError) && !baseData) {
    return (
      <PartnerLayout>
  <div className="p-4 text-center text-danger">{partnerError || bookingDetailError}</div>
      </PartnerLayout>
    );
  }

  if (!baseData) {
    return (
      <PartnerLayout>
        <div className="p-4 text-center text-muted">Không tìm thấy booking</div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div style={{ padding: "0 50px", maxWidth: "1200px" }}>
        <Button variant="secondary" className="mb-3 d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Quay lại
        </Button>

        <Row className="g-3">
          {/* Left column: info + dishes + services + promotions */}
          <Col md={8}>
            <Card className="p-4 shadow-sm border-0 rounded-3 mb-3">
              <h5 className="fw-bold text-primary mb-3">Thông tin khách hàng</h5>
              <div className="mb-2"><strong>Tên:</strong> {customerProfile?.user?.fullName
                || baseData.customer?.user?.fullName
                || baseData.customer?.fullName
                || baseData.customer?.name
                || baseData.customer?.partnerName
                || "-"}</div>
              <div className="mb-2"><strong>Điện thoại:</strong> {customerProfile?.user?.phone
                || baseData.customer?.user?.phone
                || baseData.customer?.phone
                || "-"}</div>
              <div className="mb-3"><strong>Email:</strong> {customerProfile?.user?.email
                || baseData.customer?.user?.email
                || baseData.customer?.email
                || "-"}</div>

              <h5 className="fw-bold text-primary mt-3 mb-2">Thông tin sự kiện</h5>
              <div className="mb-2"><strong>Nhà hàng:</strong> {baseData.hall?.restaurant?.name || baseData.restaurant?.name || "-"}</div>
              <div className="mb-2"><strong>Sảnh:</strong> {baseData.hall?.name || baseData.restaurant?.hall?.name || "-"} &nbsp;<span className="text-success">{formatVND(baseData.hall?.price || baseData.restaurant?.hall?.price)}</span></div>
              <div className="mb-2"><strong>Menu:</strong> {baseData.menu?.name || baseData.restaurant?.menu?.name || "-"} &nbsp;<span className="text-success">{formatVND(baseData.menu?.price || baseData.restaurant?.menu?.price)}</span></div>
              <div className="mb-2"><strong>Ngày tổ chức:</strong> {baseData.eventDate} ({(baseData.startTime||"").slice(0,5)} - {(baseData.endTime||"").slice(0,5)})</div>
              <div className="mb-2"><strong>Số bàn:</strong> {baseData.tableCount ?? "-"}</div>
              <div className="mb-3"><strong>Yêu cầu đặc biệt:</strong> {baseData.specialRequest ?? "-"}</div>

              {/* Đã bỏ phần "Các đặt tiệc khác của khách này" */}

              <h5 className="fw-bold text-primary mt-3 mb-2">Danh sách món ăn</h5>
              {dishCategories.length > 0 ? (
                dishCategories.map((cat, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="text-secondary fw-semibold">{cat.name}</div>
                    <ul className="mb-1 ms-3">
                      {cat.dishes.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="text-muted">Không có món được chọn</div>
              )}

              <h5 className="fw-bold text-primary mt-3 mb-2">Dịch vụ</h5>
              <Table bordered hover size="sm" className="mb-0 align-middle">
                <thead className="table-light">
                  <tr><th>Dịch vụ</th><th className="text-center" style={{ width: 90 }}>Số lượng</th><th className="text-end" style={{ width: 140 }}>Giá gốc</th><th className="text-end" style={{ width: 140 }}>Giá áp dụng</th></tr>
                </thead>
                <tbody>
                  {(baseData.bookingservices?.length
                    ? baseData.bookingservices
                    : baseData.services || []
                  ).map((s, i) => {
                    const name = s.serviceName || s.service?.name;
                    const quantity = toNum(s.quantity ?? 1);
                    const basePrice = s.basePrice ?? s.service?.basePrice;
                    const appliedPrice = s.appliedPrice ?? basePrice;
                    return (
                      <tr key={i}>
                        <td>{name}</td>
                        <td className="text-center">{quantity}</td>
                        <td className="text-end">{formatVND(basePrice)}</td>
                        <td className="text-end">{formatVND(appliedPrice)}</td>
                      </tr>
                    );
                  })}
                  {!(baseData.bookingservices?.length || baseData.services?.length) && (
                    <tr><td colSpan={4} className="text-center text-muted">Không có dịch vụ</td></tr>
                  )}
                </tbody>
              </Table>

              <h5 className="fw-bold text-primary mt-3 mb-2">Ưu đãi / Khuyến mãi</h5>
              <div>{baseData.promotions?.map((p, i) => <Badge key={i} bg="success" className="me-2 mb-2 p-2">{p.promotionName}</Badge>) || <div className="text-muted">Không có ưu đãi</div>}</div>
            </Card>
          </Col>

          {/* Right column: payment + actions */}
          <Col md={4}>
            <Card className="p-4 shadow-sm border-0 rounded-3">
              <h5 className="fw-bold text-primary mb-3">Chi tiết thanh toán</h5>
              <Table borderless size="sm" className="mb-0 align-middle">
                <tbody>
                  <tr><td>Sảnh</td><td className="text-end">{formatVND(hallUnitPrice)}</td></tr>
                  <tr><td>Menu ({tables} bàn)</td><td className="text-end">{formatVND(menuTotal)}</td></tr>
                  <tr><td>Dịch vụ</td><td className="text-end">{formatVND(servicesTotal)}</td></tr>
                  <tr className="fw-semibold"><td>Tạm tính</td><td className="text-end">{formatVND(subtotal)}</td></tr>
                  <tr><td>Giảm giá</td><td className="text-end text-danger">-{formatVND(discount)}</td></tr>
                  <tr><td>VAT</td><td className="text-end">{formatVND(vat)}</td></tr>
                  <tr className="fw-bold fs-6 border-top"><td>Tổng cộng</td><td className="text-end text-success">{formatVND(totalAmount)}</td></tr>
                </tbody>
              </Table>

              <div className="d-flex flex-column gap-2 mt-4">
                {isPending && <Button variant="success" onClick={handleAccept}>Chấp nhận</Button>}
                {isPending && <Button variant="danger" onClick={handleReject}>Từ chối</Button>}
                {isDeposit && <Button variant="success" onClick={handleViewContract}>Xem hợp đồng</Button>}
              </div>
            </Card>
            {bookingReviews.length > 0 && (
              <Card className="p-4 shadow-sm border-0 rounded-3 mt-3">
                <h5 className="fw-bold text-primary mb-3">Đánh giá của khách</h5>
                {bookingReviews.map((r) => (
                  <div key={r.reviewId} className="mb-3 p-3 border rounded-2">
                    <div className="d-flex align-items-center mb-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-warning me-1"></i>
                      ))}
                    </div>
                    <div className="fw-semibold">{r.customerName}</div>
                    <div className="text-muted small">{new Date(r.date).toLocaleString("vi-VN")}</div>
                    <div>{r.content}</div>
                  </div>
                ))}
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </PartnerLayout>
  );
}