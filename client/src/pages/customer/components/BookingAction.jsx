"use client"

import { Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { BookingStatus } from "../../../constants/bookingStatus"

export default function BookingActions({
  booking,
  onConfirm,
  onCancel,
  onTransfer,
  onReview,
  prepareAndStore,
  compact = false,
}) {
  const { status, bookingID } = booking

  if (compact) {
    return (
      <div className="d-flex gap-1 flex-wrap mt-2">
        {status === BookingStatus.PENDING && (
          <>
            <Button variant="danger" onClick={onCancel} size="sm" className="flex-grow-1">
              <i className="bi bi-x-circle me-1"></i>
              Hủy
            </Button>
            <Button
              as={Link}
              to={`/booking/${bookingID}`}
              state={{ booking: prepareAndStore() }}
              onClick={() => {
                try {
                  const data = prepareAndStore();
                  sessionStorage.setItem(`booking_${bookingID}`, JSON.stringify(data));
                } catch (e) {}
              }}
              variant="outline-primary"
              size="sm"
              className="flex-grow-1"
            >
              <i className="bi bi-eye me-1"></i>
              Xem chi tiết
            </Button>
          </>
        )}
        {status === BookingStatus.ACCEPTED && (
          <>
            <Button variant="success" onClick={onConfirm} size="sm" className="flex-grow-1 text-white" >
              <i className="bi bi-check-circle me-1"></i>
              Xác nhận
            </Button>
            <Button variant="danger" onClick={onCancel} size="sm" className="flex-grow-1 text-white" >
              <i className="bi bi-x-circle me-1"></i>
              Hủy
            </Button>
            <Button
              as={Link}
              to={`/booking/${bookingID}`}
              state={{ booking: prepareAndStore() }}
              onClick={() => {
                try {
                  const data = prepareAndStore();
                  sessionStorage.setItem(`booking_${bookingID}`, JSON.stringify(data));
                } catch (e) {}
              }}
              variant="outline-secondary"
              size="sm"
              className="flex-grow-1"
            >
              <i className="bi bi-eye me-1"></i>
              Xem chi tiết
            </Button>
          </>
        )}

        {status === BookingStatus.CONFIRMED && (
          <>
            <Button
              as={Link}
              to={`/booking/${bookingID}/payments`}
              onClick={() => {
                try {
                  const data = prepareAndStore();
                  sessionStorage.setItem(`booking_${bookingID}`, JSON.stringify(data));
                  sessionStorage.setItem("currentBooking", JSON.stringify(data));
                } catch {}
              }}
              variant="primary"
              size="sm"
              className="flex-grow-1"
            >
              <i className="bi bi-credit-card me-1"></i>
              Đặt cọc
            </Button>
            <Button
              as={Link}
              to={`/booking/${bookingID}`}
              state={{ booking: prepareAndStore() }}
              variant="outline-secondary"
              size="sm"
              className="flex-grow-1"
            >
              <i className="bi bi-file-text me-1"></i>
              Xem hợp đồng
            </Button>
          </>
        )}

        {(status === BookingStatus.EXPIRED || status === BookingStatus.COMPLETED) && (
          <Button variant="warning" onClick={onReview} size="sm" className="w-100">
            <i className="bi bi-star me-1"></i>
            Đánh giá
          </Button>
        )}

        {(status === BookingStatus.REJECTED || status === BookingStatus.EXPIRED || status === BookingStatus.CANCELLED || status === BookingStatus.COMPLETED || status === BookingStatus.MANUAL_BLOCKED) && (
          <Button
            as={Link}
            to={`/booking/${bookingID}`}
            state={{ booking: prepareAndStore() }}
            variant="outline-secondary"
            size="sm"
            className="w-100"
          >
            <i className="bi bi-eye me-1"></i>
            Xem chi tiết
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="d-flex gap-2 flex-wrap mt-3">
      {status === BookingStatus.PENDING && (
        <>
          <Button variant="danger" onClick={onCancel} className="flex-grow-1">
            <i className="bi bi-x-circle me-2"></i>
            Hủy
          </Button>
          <Button
            as={Link}
            to={`/booking/${bookingID}`}
            state={{ booking: prepareAndStore() }}
            onClick={() => {
              try {
                const data = prepareAndStore();
                sessionStorage.setItem(`booking_${bookingID}`, JSON.stringify(data));
              } catch (e) {}
            }}
            variant="outline-primary"
            className="flex-grow-1"
          >
            <i className="bi bi-eye me-2"></i>
            Xem chi tiết
          </Button>
        </>
      )}

      {status === BookingStatus.ACCEPTED && (
        <>
          <Button variant="success" onClick={onConfirm} className="flex-grow-1" style={{ color: "white !important" }}>
            <i className="bi bi-check-circle me-2"></i>
            Xác nhận
          </Button>
          <Button variant="danger" onClick={onCancel} className="flex-grow-1" style={{ color: "white !important" }}>
            <i className="bi bi-x-circle me-2"></i>
            Hủy
          </Button>
          <Button
            as={Link}
            to={`/booking/${bookingID}`}
            state={{ booking: prepareAndStore() }}
            onClick={() => {
              try {
                const data = prepareAndStore();
                sessionStorage.setItem(`booking_${bookingID}`, JSON.stringify(data));
              } catch (e) {}
            }}
            variant="outline-secondary"
            className="flex-grow-1"
          >
            <i className="bi bi-file-text me-2"></i>
            Hợp đồng
          </Button>
        </>
      )}

      {status === BookingStatus.CONFIRMED && (
        <>
          <Button
            as={Link}
            to={`/booking/${bookingID}/payments`}
            onClick={() => {
              try {
                const data = prepareAndStore();
                sessionStorage.setItem(`booking_${bookingID}`, JSON.stringify(data));
                sessionStorage.setItem("currentBooking", JSON.stringify(data));
              } catch {}
            }}
            variant="primary"
          >
            <i className="bi bi-credit-card me-2"></i>
            Đặt cọc
          </Button>
          <Button
            as={Link}
            to={`/booking/${bookingID}`}
            state={{ booking: prepareAndStore() }}
            variant="outline-secondary"
            className="flex-grow-1"
          >
            <i className="bi bi-file-text me-2"></i>
            Xem hợp đồng
          </Button>
        </>
      )}

      {status === BookingStatus.DEPOSITED && (
        <Button
          as={Link}
          to={`/booking/${bookingID}`}
          state={{ booking: prepareAndStore() }}
          variant="outline-secondary"
          className="flex-grow-1"
        >
          <i className="bi bi-eye me-2"></i>
          Xem chi tiết
        </Button>
      )}

      {(status === BookingStatus.EXPIRED || status === BookingStatus.COMPLETED) && (
        <Button variant="warning" onClick={onReview} className="w-100">
          <i className="bi bi-star me-2"></i>
          Tạo đánh giá
        </Button>
      )}

      {(status === BookingStatus.REJECTED || status === BookingStatus.EXPIRED || status === BookingStatus.CANCELLED || status === BookingStatus.COMPLETED || status === BookingStatus.MANUAL_BLOCKED) && (
        <Button
          as={Link}
          to={`/booking/${bookingID}`}
          state={{ booking: prepareAndStore() }}
          onClick={() => {
            try {
              const data = prepareAndStore();
              sessionStorage.setItem(`booking_${bookingID}`, JSON.stringify(data));
            } catch (e) {}
          }}
          variant="outline-secondary"
          className="w-100"
        >
          <i className="bi bi-eye me-2"></i>
          Xem chi tiết
        </Button>
      )}
    </div>
  )
}
