import { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card } from "react-bootstrap";
import KPICard from "./KPICard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import useAuth from "../../../hooks/useAuth";

export default function PartnerBookingAnalytics() {
  const { user } = useAuth();
  const partnerID = user?.userID || user?.partner?.restaurantPartnerID || user?.id;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!partnerID) return;
    setLoading(true);
    axios
      .get(`/api/dashboard/partner/${partnerID}/bookings`)
      .then((res) => setData(res.data.bookingsByMonth || []))
      .catch((err) => {
        console.error("Partner bookings error:", err);
        setError("Không thể tải dữ liệu đặt chỗ.");
      })
      .finally(() => setLoading(false));
  }, [partnerID]);

  if (!partnerID) return <p>Vui lòng đăng nhập lại để xem dữ liệu.</p>;
  if (loading) return <p>⏳ Đang tải dữ liệu đặt chỗ...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!data.length) return <p>Không có dữ liệu đặt chỗ.</p>;

  const total = data.reduce((s, i) => s + Number(i.count || 0), 0);
  const avg = data.length ? (total / data.length).toFixed(1) : 0;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2 style={{ fontWeight: 600, color: "#1f2937" }}>📅 Đặt chỗ</h2>
          <p className="text-muted mb-0">Theo dõi xu hướng đặt tiệc cho hệ thống của bạn</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}><KPICard title="Tổng booking" value={total} subtitle="Các nhà hàng của bạn" /></Col>
        <Col md={3}><KPICard title="TB / tháng" value={avg} subtitle="Số booking trung bình" /></Col>
      </Row>

      <Card className="mb-4" style={{ borderRadius: 8, border: "1px solid #e5e7eb" }}>
        <Card.Body>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Số booking" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </div>
  );
}
