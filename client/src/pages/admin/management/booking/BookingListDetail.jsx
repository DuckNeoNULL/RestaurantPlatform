import React, { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";

export default function BookingListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/admin/bookings/${id}`);
      setBooking(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-center text-muted mt-4">Đang tải...</p>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout>
        <p className="text-danger text-center mt-4">
          Không tìm thấy booking.
        </p>
      </AdminLayout>
    );
  }

  const user = booking.customer?.user;
  const restaurant = booking.hall?.restaurant;

  return (
    <AdminLayout title="Chi tiết đặt tiệc">
      <div className="container py-4">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>

        <div className="card shadow-sm p-4 rounded-4">
          <h3 className="fw-bold">Booking #{booking.bookingID}</h3>
          <hr />

          <div className="row mt-3">
            <div className="col-6">
              <h5 className="fw-bold">Khách hàng</h5>
              <p>
                <strong>Họ tên:</strong> {user?.fullName} <br />
                <strong>Số điện thoại:</strong> {user?.phone}
              </p>
            </div>

            <div className="col-6">
              <h5 className="fw-bold">Nhà hàng</h5>
              <p>
                <strong>Tên:</strong> {restaurant?.name} <br />
                <strong>Sảnh:</strong> {booking.hall?.name}
              </p>
            </div>
          </div>

          <h5 className="fw-bold mt-4">Thông tin tiệc</h5>
          <p>
            <strong>Ngày:</strong>{" "}
            {new Date(booking.eventDate).toLocaleDateString("vi-VN")}
            <br />
            <strong>Thời gian:</strong> {booking.startTime} -{" "}
            {booking.endTime}
            <br />
            <strong>Loại tiệc:</strong> {booking.eventType?.name}
            <br />
            <strong>Menu:</strong> {booking.menu?.name}
            <br />
            <strong>Số bàn:</strong> {booking.tableCount}
          </p>

          <h5 className="fw-bold mt-4">Món ăn</h5>
          {booking.bookingdishes?.length === 0 ? (
            <p className="text-muted">Không có món ăn riêng lẻ.</p>
          ) : (
            <ul>
              {booking.bookingdishes.map((d) => (
                <li key={d.dishID}>{d.dish?.name}</li>
              ))}
            </ul>
          )}

          <h5 className="fw-bold mt-4">Dịch vụ</h5>
          {booking.bookingservices?.length === 0 ? (
            <p className="text-muted">Không có dịch vụ thêm.</p>
          ) : (
            <ul>
              {booking.bookingservices.map((s) => (
                <li key={s.serviceID}>
                  {s.service?.name} — SL: {s.quantity} — Giá: ₫
                  {Number(s.appliedPrice).toLocaleString("vi-VN")}
                </li>
              ))}
            </ul>
          )}

          <h5 className="fw-bold mt-4">Khuyến mãi</h5>
          {booking.bookingpromotions?.length === 0 ? (
            <p className="text-muted">Không có khuyến mãi.</p>
          ) : (
            <ul>
              {booking.bookingpromotions.map((p) => (
                <li key={p.promotionID}>{p.promotion?.name}</li>
              ))}
            </ul>
          )}

          <hr />
          <h5 className="fw-bold">Tổng tiền</h5>
          <p>
            <strong>Giá gốc:</strong>{" "}
            ₫{Number(booking.originalPrice).toLocaleString("vi-VN")} <br />
            <strong>Giảm giá:</strong>{" "}
            ₫{Number(booking.discountAmount).toLocaleString("vi-VN")} <br />
            <strong>VAT:</strong>{" "}
            ₫{Number(booking.VAT).toLocaleString("vi-VN")}
          </p>

          <h4 className="fw-bold text-primary">
            Tổng thanh toán: ₫
            {Number(booking.totalAmount).toLocaleString("vi-VN")}
          </h4>
        </div>
      </div>
    </AdminLayout>
  );
}
