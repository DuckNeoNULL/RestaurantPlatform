import React, { useState } from "react";
import { Row, Col, Form, Badge, Table } from "react-bootstrap";
import useBooking from "../../../hooks/useBooking";

const DEFAULT_SERVICES = [
  { serviceID: 1, name: "MC", price: 500000.00, unit: "sự kiện", status: 1 },
  { serviceID: 2, name: "Photographer", price: 1500000.00, unit: "sự kiện", status: 1 },
  { serviceID: 3, name: "Decoration", price: 1000000.00, unit: "sự kiện", status: 1 },
  { serviceID: 4, name: "Live Music", price: 1200000.00, unit: "sự kiện", status: 1 },
];

export default function ServiceSelector({ services = [] }) {
  const { booking, toggleService } = useBooking();
  const selectedIds = new Set(booking.services.map((s) => s.id));
  const list = services && services.length > 0 ? services : DEFAULT_SERVICES;

  return (
    <div className="mt-3">
      <Row className="mb-2 align-items-center">
        <Col xs={5} className="fw-semibold">Dịch vụ (tùy chọn)</Col>
      </Row>
      <div className="flex gap-2 flex-wrap mt-1">
        {list.map((svc) => {
          const active = selectedIds.has(svc.id);
          return (
            <button
              key={svc.id}
              type="button"
              className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                active
                  ? "bg-rose-600 text-white border-rose-700 shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => toggleService(svc)}
              title={`${svc.name} — ${svc.price.toLocaleString()}₫`}
            >
              {svc.name} — {svc.price.toLocaleString()}₫
            </button>
          );
        })}
      </div>
    </div>
  );
}