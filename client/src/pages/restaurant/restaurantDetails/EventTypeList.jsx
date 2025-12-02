import React from "react";
import { Card, Row, Col } from "react-bootstrap";
// Bảng màu mềm, hiện đại
const palette = [
  "#f87171", // đỏ coral
  "#fb923c", // cam dịu
  "#facc15", // vàng
  "#4ade80", // xanh lá
  "#2dd4bf", // mint
  "#60a5fa", // xanh dương
  "#a78bfa", // tím nhạt
  "#f472b6", // hồng pastel
];

const EventTypeList = ({ restaurant }) => {
  const raw = restaurant?.eventTypes ?? restaurant?.eventType ?? [];
  // const {} =useEventType();
  const eventTypes = Array.isArray(raw) ? raw : [raw];
  if (!eventTypes.length) return null;
  return (
    <div className="mb-5">
      <h4 className="mb-3 fw-bold" style={{ color: "#e11d48" }}>
        Loại sự kiện
      </h4>

      <Row className="g-3">
        {eventTypes.map((type, index) => {
          const color = palette[index % palette.length];
          const label = typeof type === "string" ? type : (type?.name ?? "-");

          return (
            <Col key={type?.eventTypeID ?? `${index}-${label}`} xs={12} sm={6} md={3}>
              <Card
                className="shadow-sm border-0 h-100"
                style={{
                  borderRadius: "14px",
                  overflow: "hidden",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 7px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.08)";
                }}
              >
                {/* Thanh màu trên cùng */}
                <div
                  style={{
                    height: "6px",
                    backgroundColor: color,
                  }}
                />

                <Card.Body className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold" style={{ fontSize: "1rem" }}>
                    {label}
                  </span>

                  <span
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.35rem 0.7rem",
                      borderRadius: "8px",
                      backgroundColor: color + "20", // 20 = transparency
                      color: color,
                      border: `1px solid ${color}33`,
                    }}
                  >
                    Sự kiện
                  </span>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default EventTypeList;
