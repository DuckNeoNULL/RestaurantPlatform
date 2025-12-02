
import { useState } from "react"
import { Card, Row, Col } from "react-bootstrap"
import StatusBadge from "./StatusBadge"
import BookingInfo from "./BookingInfo"
import BookingActions from "./BookingAction"
import ConfirmModal from "./ConfirmModal"
import CancelModal from "./CancelModal"
import ReviewModal from "./ReviewModal"
import ScrollToTopButton from "../../../components/ScrollToTopButton"
import { BookingStatus } from "../../../constants/bookingStatus"

export default function BookingCard({
  booking,
  categoriesMap = {},
  onConfirm,
  onCancel,
  onTransfer,
  onOpenContract,
  onReview,
  onViewContract,
}) {
  const b = booking
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  function handleConfirmSubmit(note) {
    onConfirm?.(b, note)
    setShowConfirmModal(false)
  }

  function handleCancelSubmit(reason) {
    onCancel?.(b, reason)
    setShowCancelModal(false)
  }

  function handleReviewSubmit(reviewPayload) {
    const restaurantID = b.hall?.restaurant?.restaurantID || b.restaurant?.restaurantID || b.restaurantID
    onReview?.(b, { ...reviewPayload, restaurantID })
    setShowReviewModal(false)
  }

  function buildDetailPayload(b, categoriesMap) {
    console.log(b);
    // Build customer info strictly from booking data (not auth)
    const embeddedUser = b.customer?.user || {}
    const customer = {
      fullName: b.customer?.fullName || embeddedUser.fullName || embeddedUser.name || "Khách hàng",
      phone: b.customer?.phone || embeddedUser.phone || "N/A",
      email: b.customer?.email || embeddedUser.email || "N/A",
    }
    // Build restaurant from hall.restaurant
    const restaurant = {
      name: b.hall?.restaurant?.name || "Nhà hàng",
      address: b.hall?.restaurant?.fullAddress || "Đang cập nhật",
      thumbnailURL: b.hall?.restaurant?.thumbnailURL || "",
    }

    // Build hall
    const hall = {
      name: b.hall?.name || "Sảnh",
      capacity: b.hall?.maxTable || b.tableCount || 0,
      area: parseFloat(b.hall?.area) || 0,
      price: parseFloat(b.hall?.price) || 0,
    }

    // Build menu with categories from bookingdishes
    const dishMap = {};
    (b.bookingdishes || []).forEach(bd => {
      const dish = bd.dish;
      const categoryId = dish.categoryID;
      if (!dishMap[categoryId]) {
        dishMap[categoryId] = {
          name: categoriesMap[categoryId]?.name || `Danh mục ${categoryId}`,
          dishes: []
        };
      }
      dishMap[categoryId].dishes.push({
        id: dish.dishID,
        name: dish.name,
        price: 0,
        imageURL: dish.imageURL,
        category: categoriesMap[categoryId]?.name || `Danh mục ${categoryId}`
      });
    });
    const menu = {
      name: b.menu?.name || "Menu đã chọn",
      price: parseFloat(b.menu?.price) || 0,
      categories: Object.values(dishMap).filter(category => category.dishes && category.dishes.length > 0)
    }

    // Build services from bookingservices
    const services = (b.bookingservices || []).map(bs => ({
      name: bs.service?.name || "Dịch vụ",
      quantity: bs.quantity || 1,
      price: parseFloat(bs.service?.price) || 0
    }));

    return {
      bookingID: b.bookingID,
      status: b.status ?? 0,
      eventType: b.eventType?.name || "Tiệc cưới",
      eventDate: b.eventDate,
      startTime: b.startTime || "18:00",
      endTime: b.endTime || "22:00",
      tableCount: b.tableCount || 0,
      specialRequest: b.specialRequest || "",
      createdAt: b.createdAt || new Date().toISOString(),
      customer,
      restaurant,
      hall,
      menu,
      services,
      payments: b.payments || [],
      contract: b.contract || {
        content: "Hợp đồng dịch vụ...",
        status: 0,
        signedAt: null,
      },
      originalPrice: parseFloat(b.originalPrice) || 0,
      discountAmount: parseFloat(b.discountAmount) || 0,
      VAT: parseFloat(b.VAT) || 0,
      totalAmount: parseFloat(b.totalAmount) || 0,
    }
  }

  function prepareAndStore() {
    // Pass raw booking object via route state; Details page will normalize
    return b
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  return (
    <>
      <Card
        // className="border-0 overflow-hidden"
        style={{
          cursor: "pointer",
          background: '#ffffff',
          borderRadius: '12px'
        }}
      >
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col xs={3}>
              <Card.Img
                src={b.restaurant.thumbnailURL || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={b.restaurant.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  transition: 'transform 0.3s ease'
                }}
              />
            </Col>

            <Col xs={6}>
              <div>
                <h3
                  className="mb-2"
                  style={{
                    fontWeight: '600',
                    color: '#1f2937',
                    letterSpacing: '-0.3px'
                  }}
                >
                  {b.restaurant.name}
                </h3>

                <div style={{
                  fontSize: "0.85rem",
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  {b.eventDate}
                </div>

                <div style={{
                  fontSize: "0.85rem",
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Thời gian: {b.startTime || "18:00"} - {b.endTime || "22:00"}
                </div>

                <div style={{
                  fontSize: "0.85rem",
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Sảnh: {b.hall?.name || "Chưa có thông tin"} | Bàn: {b.tableCount || 0}
                </div>

                <div style={{
                  fontSize: "0.85rem",
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  {b.restaurant.fullAddress || "Chưa có địa chỉ"}
                </div>

                {(() => {
                  const s = b.status;
                  const text = {
                    [BookingStatus.PENDING]: 'Chờ xác nhận',
                    [BookingStatus.ACCEPTED]: 'Đã chấp nhận',
                    [BookingStatus.REJECTED]: 'Bị từ chối',
                    [BookingStatus.CONFIRMED]: 'Chuẩn bị đặt cọc',
                    [BookingStatus.DEPOSITED]: 'Đã đặt cọc',
                    [BookingStatus.EXPIRED]: 'Quá hạn',
                    [BookingStatus.CANCELLED]: 'Đã hủy',
                    [BookingStatus.COMPLETED]: 'Hoàn thành',
                    [BookingStatus.MANUAL_BLOCKED]: 'Bị chặn',
                  }[s] || 'Đang xử lý';
                  const style =
                    (s === BookingStatus.ACCEPTED || s === BookingStatus.DEPOSITED || s === BookingStatus.COMPLETED)
                      ? { background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(22, 163, 74)' }
                      : (s === BookingStatus.REJECTED || s === BookingStatus.CANCELLED || s === BookingStatus.MANUAL_BLOCKED)
                        ? { background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(220, 38, 38)' }
                        : (s === BookingStatus.EXPIRED)
                          ? { background: 'rgba(107, 114, 128, 0.12)', color: '#374151' } // gray for expired
                          : { background: 'rgba(250, 204, 21, 0.1)', color: 'rgb(202, 138, 4)' }; // pending/confirmed
                  return (
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      ...style
                    }}>
                      {text}
                    </div>
                  );
                })()}
              </div>
            </Col>

            <Col xs={3} className="text-end">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '8px'
              }}>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'rgb(225, 29, 72)',
                }}>
                  {formatPrice(b.totalAmount || b.total || b.price || 0)} VND
                </div>

                {b.discountAmount > 0 && (
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'rgb(34, 197, 94)',
                    fontWeight: '500',
                  }}>
                    Giảm: -{formatPrice(b.discountAmount)} VND
                  </div>
                )}

                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle menu click
                  }}
                >
                </button>
              </div>
            </Col>
          </Row>

          <div style={{
            borderTop: '1px solid #f3f4f6',
            marginTop: '12px',
            paddingTop: '10px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '6px',
          }}>
            <BookingActions
              booking={b}
              onConfirm={() => setShowConfirmModal(true)}
              onCancel={() => setShowCancelModal(true)}
              onTransfer={() => onTransfer?.(b)}
              onReview={() => setShowReviewModal(true)}
              prepareAndStore={prepareAndStore}
              compact={true}
            />
          </div>
        </Card.Body>
      </Card>

      <ConfirmModal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} onConfirm={handleConfirmSubmit} />

      <CancelModal show={showCancelModal} onHide={() => setShowCancelModal(false)} onCancel={handleCancelSubmit} />

      <ReviewModal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
        booking={b}
      />

      <ScrollToTopButton />
    </>
  )
}