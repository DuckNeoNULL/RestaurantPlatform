import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { Calendar, Phone, Mail, Building2 } from "lucide-react";

const STATUS_LABELS = {
  0: { text: "Đang chờ", color: "warning" },
  1: { text: "Đã xác nhận", color: "success" },
  2: { text: "Từ chối", color: "danger" },
  3: { text: "Đã xác nhận (khóa lịch)", color: "info" },
  4: { text: "Đã đặt cọc", color: "info" },
  5: { text: "Hết hạn", color: "secondary" },
  6: { text: "Đã hủy", color: "secondary" },
  7: { text: "Hoàn tất", color: "primary" },
};

export default function BookingCard({
  booking,
  onViewDetail,
  onReject,
  onAccept,
  activeTab, // tab hiện tại để quyết định nút
}) {
  const {
    bookingID,
    fullName,
    phone,
    email,
    hallName,
    restaurantName,
    eventDate,
    startTime,
    endTime,
    totalAmount,
    status,
    checked,
  } = booking;

  const statusLabel = STATUS_LABELS[status] || STATUS_LABELS[0];

  return (
    <Card
      className="shadow-sm rounded-4 border-0 mb-3 p-3"
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h5 className="fw-bold mb-0">{fullName}</h5>
        <Badge bg={statusLabel.color} className="px-3 py-2 rounded-pill text-uppercase">
          {statusLabel.text}
        </Badge>
      </div>

      {/* Info */}
      <div className="text-muted small">
        <div className="mb-2 d-flex align-items-center">
          <Calendar className="me-2 text-primary" size={16} />
          <span>
            {eventDate} | {startTime} - {endTime}
          </span>
        </div>

        <div className="mb-2 d-flex align-items-center">
          <Phone className="me-2 text-primary" size={16} />
          <span>{phone}</span>
        </div>

        <div className="mb-2 d-flex align-items-center">
          <Mail className="me-2 text-primary" size={16} />
          <span>{email}</span>
        </div>

        {/* Nhà hàng và sảnh */}
        <div className="d-flex align-items-center justify-content-between flex-wrap mt-2">
          <div className="d-flex align-items-center mb-2">
            <Building2 className="me-2 text-success" size={16} />
            <span className="fw-semibold">{restaurantName}</span>
          </div>
          <Badge bg="light" text="primary" className="p-2 rounded-3">
            {hallName}
          </Badge>
        </div>

        <hr className="my-3" />
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-semibold text-secondary">Tổng tiền:</div>
          <div className="fw-bold text-dark">
            {Number(totalAmount).toLocaleString("vi-VN")} VND
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="d-flex flex-column align-items-stretch gap-2 mt-3">

        {/* Chỉ hiện nút xử lý khi đang chờ */}
        {activeTab === "pending" && (
          <>
            <Button
              variant="success"
              className="py-2 rounded-3 text-white"
              onClick={() => onAccept?.(bookingID)}
            >
              Chấp nhận
            </Button>
            <Button
              variant="danger"
              className="py-2 rounded-3 text-white"
              onClick={() => onReject?.(bookingID)}
            >
              Từ chối
            </Button>
          </>
        )}
        {activeTab === "confirmed" && (
          <Badge bg="success" className="px-3 py-2 align-self-center">Đã xác nhận / Đặt cọc</Badge>
        )}
        {activeTab === "completed" && (
          <Badge bg="primary" className="px-3 py-2 align-self-center">Hoàn tất</Badge>
        )}
        {activeTab === "cancelled" && (
          <Badge bg="secondary" className="px-3 py-2 align-self-center">Đã hủy</Badge>
        )}
        {activeTab === "rejected" && (
          <Badge bg="danger" className="px-3 py-2 align-self-center">Từ chối</Badge>
        )}
        <Button
          variant="outline-secondary"
          className="py-2 rounded-3"
          onClick={() => onViewDetail(bookingID)}
        >
          Xem chi tiết
        </Button>
      </div>
    </Card>
  );
}