import { Row, Col } from "react-bootstrap"

function formatPrice(v) {
  if (v == null) return "N/A"
  return v.toLocaleString("vi-VN") + "₫"
}

export default function BookingInfo({ booking, compact = false }) {
  const { eventDate, startTime, endTime, tableCount, price, specialRequest } = booking

  if (compact) {
    return (
      <>
        <div style={{ fontSize: "0.8rem" }} className="text-muted">
          <div className="mb-1">
            <i className="bi bi-calendar-event me-1"></i>
            <strong>Ngày:</strong> {eventDate}
          </div>
          <div className="mb-1">
            <i className="bi bi-clock me-1"></i>
            <strong>Giờ:</strong> {startTime && endTime ? `${startTime} - ${endTime}` : "N/A"}
          </div>
          <div className="mb-1">
            <i className="bi bi-table me-1"></i>
            <strong>Bàn:</strong> {tableCount}
          </div>
          <div>
            <i className="bi bi-cash-coin me-1"></i>
            <strong>Giá:</strong> {formatPrice(price)}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Row className="g-3 mb-3">
        <Col sm={6}>
          <div className="d-flex align-items-center">
            <i className="bi bi-calendar-event me-2 text-primary"></i>
            <span>
              <strong>Ngày:</strong> {eventDate}
            </span>
          </div>
        </Col>
        <Col sm={6}>
          <div className="d-flex align-items-center">
            <i className="bi bi-clock me-2 text-primary"></i>
            <span>
              <strong>Giờ:</strong> {startTime && endTime ? `${startTime} - ${endTime}` : "N/A"}
            </span>
          </div>
        </Col>
        <Col sm={6}>
          <div className="d-flex align-items-center">
            <i className="bi bi-table me-2 text-primary"></i>
            <span>
              <strong>Số bàn:</strong> {tableCount}
            </span>
          </div>
        </Col>
        <Col sm={6}>
          <div className="d-flex align-items-center">
            <i className="bi bi-cash-coin me-2 text-primary"></i>
            <span>
              <strong>Giá:</strong> {formatPrice(price)}
            </span>
          </div>
        </Col>
      </Row>

      {specialRequest && (
        <div className="alert alert-light border mb-3">
          <strong>Yêu cầu đặc biệt:</strong> {specialRequest}
        </div>
      )}
    </>
  )
}
