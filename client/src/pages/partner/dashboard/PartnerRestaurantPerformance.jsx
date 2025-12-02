import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Row, Col } from "react-bootstrap";
import KPICard from "./KPICard";
import useAuth from "../../../hooks/useAuth";
import { formatCompactCurrency } from "../../../utils/formatCurrency";

export default function PartnerRestaurantPerformance() {
  const { user } = useAuth();
  const partnerID = user?.userID || user?.partner?.restaurantPartnerID || user?.id;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!partnerID) return;
    setLoading(true);
    axios
      .get(`/api/dashboard/partner/${partnerID}/restaurants`)
      .then((res) => setRows(res.data.restaurants || []))
      .catch((err) => {
        console.error("Partner restaurants error:", err);
        setError("Không thể tải hiệu suất nhà hàng.");
      })
      .finally(() => setLoading(false));
  }, [partnerID]);

  if (!partnerID) return <p>Vui lòng đăng nhập lại để xem dữ liệu.</p>;
  if (loading) return <p>⏳ Đang tải hiệu suất nhà hàng...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!rows.length) return <p>Không có dữ liệu.</p>;

  const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue || 0), 0);
  const totalBookings = rows.reduce((s, r) => s + Number(r.bookings || 0), 0);
  const avgRating = rows.length ? (rows.reduce((s, r) => s + Number(r.rating || 0), 0) / rows.length).toFixed(2) : 0;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2 style={{ fontWeight: 600, color: "#1f2937" }}>🏪 Nhà hàng của tôi</h2>
          <p className="text-muted mb-0">Doanh thu, booking và đánh giá</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}><KPICard title="Tổng doanh thu" value={formatCompactCurrency(totalRevenue)} subtitle="Tất cả nhà hàng" /></Col>
        <Col md={4}><KPICard title="Tổng booking" value={totalBookings} subtitle="Tổng đơn" /></Col>
        <Col md={4}><KPICard title="Đánh giá trung bình" value={`${avgRating} ⭐`} subtitle="Trung bình" /></Col>
      </Row>

      <Card style={{ borderRadius: 8, border: "1px solid #e5e7eb" }}>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Nhà hàng</th>
                <th>Doanh thu (VNĐ)</th>
                <th>Số booking</th>
                <th>Đánh giá TB</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.restaurantID || i}>
                  <td>{i + 1}</td>
                  <td>{r.name || "—"}</td>
                  <td>{Number(r.revenue || 0).toLocaleString("vi-VN")}</td>
                  <td>{r.bookings || 0}</td>
                  <td>{Number(r.rating || 0).toFixed(1)} ⭐</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
