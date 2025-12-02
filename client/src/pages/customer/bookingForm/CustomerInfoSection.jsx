import React from "react";
import useBooking from "../../../hooks/useBooking";
import { Form } from "react-bootstrap";

export default function CustomerInfoSection({ user }) {
  const { booking, setCustomerField } = useBooking();
  const customer = user || {};

  if (!user) {
    return (
      <section className="p-4 bg-white border rounded shadow-sm mb-3">
        <div className="text-center text-muted">
          <p>Vui lòng đăng nhập để tiếp tục đặt tiệc</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 bg-white border rounded shadow-sm mb-3">
      <h3 className="fw-bold mb-3" style={{ color: "#e11d48" }}>
        Thông tin khách hàng
      </h3>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Họ và tên</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập họ và tên"
            value={customer.fullName || ""}
            onChange={(e) => setCustomerField("fullName", e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Số điện thoại</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập số điện thoại"
            value={customer.phone || ""}
            onChange={(e) => setCustomerField("phone", e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Nhập email"
            value={customer.email || ""}
            onChange={(e) => setCustomerField("email", e.target.value)}
            required
          />
        </Form.Group>
      </Form>
    </section>
  );
}