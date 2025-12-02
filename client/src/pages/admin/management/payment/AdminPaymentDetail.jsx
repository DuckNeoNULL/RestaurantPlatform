import React, { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Badge, Button, Alert } from "react-bootstrap";
import AdminLayout from "../../../../layouts/AdminLayout";

export default function AdminPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const STATUS = {
    0: { label: "Chờ xử lý", color: "warning" },
    1: { label: "Đã thanh toán", color: "success" },
    2: { label: "Thất bại", color: "danger" },
    3: { label: "Hoàn tiền", color: "secondary" },
  };

  const TYPE = {
    0: "Tiền cọc (30%)",
    1: "Thanh toán còn lại (70%)",
  };

  const formatCurrency = (v) => v.toLocaleString("vi-VN") + " ₫";
  const formatDate = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const loadDetail = async () => {
    try {
      const res = await axios.get(`/admin/payments/${id}`);
      setPayment(res.data.data);
    } catch (err) {
      console.error("Load payment failed", err);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleAction = async (newStatus) => {
    try {
      await axios.put(`/admin/payments/${id}/status`, { status: newStatus });

      setPayment((prev) => ({ ...prev, status: newStatus }));
      setActionMsg("✔️ Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  if (!payment) {
    return (
      <AdminLayout>
        <p className="text-center text-danger mt-5">
          Không tìm thấy thanh toán
        </p>
      </AdminLayout>
    );
  }

  const booking = payment.booking;
  const user = booking.customer.user;
  const restaurant = booking.hall.restaurant;

  return (
    <AdminLayout title="Chi tiết thanh toán">
      <div className="container py-4">
        <Button
          variant="link"
          onClick={() => navigate("/admin/payments")}
          className="mb-3"
        >
          ← Quay lại danh sách
        </Button>

        {actionMsg && (
          <Alert variant="success" className="text-center">
            {actionMsg}
          </Alert>
        )}

        <Card className="shadow rounded-4">
          <Card.Header className="text-white p-3"
            style={{
              background: "linear-gradient(90deg, #0d6efd, #6610f2)"
            }}>
            <h4>Thanh toán #{payment.paymentID}</h4>
            <small>Cập nhật: {formatDate(payment.paymentDate)}</small>
          </Card.Header>

          <Card.Body>
            <h5>Thông tin khách hàng</h5>
            <p>
              <strong>{user.fullName}</strong>
              <br /> SĐT: {user.phone}
            </p>

            <h5>Nhà hàng</h5>
            <p>
              {restaurant.name}
            </p>

            <h5>Chi tiết thanh toán</h5>
            <p>
              Loại: {TYPE[payment.type]} <br />
              Ngày: {formatDate(payment.paymentDate)} <br />
              Số tiền: <strong>{formatCurrency(payment.amount)}</strong>
            </p>

            <h5>Trạng thái</h5>
            <Badge bg={STATUS[payment.status].color}>
              {STATUS[payment.status].label}
            </Badge>

            <div className="mt-4 d-flex gap-2">
              {payment.status === 0 && (
                <>
                  <Button onClick={() => handleAction(1)} variant="success">
                    Xác nhận
                  </Button>
                  <Button onClick={() => handleAction(2)} variant="danger">
                    Từ chối
                  </Button>
                </>
              )}

              {payment.status === 1 && (
                <Button onClick={() => handleAction(3)} variant="secondary">
                  Hoàn tiền
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  );
}
