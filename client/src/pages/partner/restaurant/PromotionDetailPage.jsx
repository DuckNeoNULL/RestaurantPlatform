import React, { useEffect, useState } from "react";
import { Card, Button, Badge, ListGroup } from "react-bootstrap";
import api from "../../../api/axios";

export default function PromotionDetailPage({ promotion, onBack }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!promotion?.promotionID) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/promotions/${promotion.promotionID}/services`);
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setServices(list);
      } catch (err) {
        setError(err?.message || "Lỗi tải dịch vụ áp dụng");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [promotion?.promotionID]);

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
  <h5>Chi tiết khuyến mãi</h5>
        <Button variant="secondary" onClick={onBack}>
          ← Quay lại
        </Button>
      </Card.Header>
      <Card.Body>
        <h4>{promotion.title || promotion.name}</h4>
        {promotion.description && (
          <p className="text-muted">{promotion.description}</p>
        )}

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Số bàn tối thiểu:</strong> {promotion.minTable ?? "-"}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Loại giảm giá:</strong>{" "}
            {promotion.discountType === 0 || promotion.discountType === "Percent"
              ? "Phần trăm"
              : promotion.discountType === 1 || promotion.discountType === "Free"
              ? "Miễn phí dịch vụ"
              : String(promotion.discountType || "-")}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Giá trị giảm:</strong>{" "}
            {promotion.discountType === 0 || promotion.discountType === "Percent"
              ? `${promotion.discountValue ?? promotion.discountPercentage ?? "-"}%`
              : "—"}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Thời gian:</strong> {promotion.startDate || "-"} → {promotion.endDate || "-"}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Dịch vụ áp dụng:</strong>{" "}
            {loading ? (
              <span>Đang tải...</span>
            ) : error ? (
              <span className="text-danger">{error}</span>
            ) : services.length ? (
              <span>{services.map((s) => s.name).join(", ")}</span>
            ) : (
              <span>Không có</span>
            )}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Trạng thái:</strong>{" "}
            <Badge bg={promotion.status ? "success" : "secondary"}>
              {promotion.status ? "Hoạt động" : "Ngừng"}
            </Badge>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
}