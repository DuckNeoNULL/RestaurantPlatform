import { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card } from "react-bootstrap";
import KPICard from "./KPICard";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import useAuth from "../../../hooks/useAuth";
import { formatCompactCurrency } from "../../../utils/formatCurrency";

export default function PartnerRevenueAnalytics() {
  const { user } = useAuth();
  const partnerID = user?.userID || user?.partner?.restaurantPartnerID || user?.id;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!partnerID) return;
    setLoading(true);
    axios
      .get(`/api/dashboard/partner/${partnerID}/revenue`)
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error("Partner revenue error:", err);
        setError("Không thể tải doanh thu.");
      })
      .finally(() => setLoading(false));
  }, [partnerID]);

  if (!partnerID) return <p>Vui lòng đăng nhập lại để xem dữ liệu.</p>;
  if (loading) return <p>⏳ Đang tải dữ liệu doanh thu...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!stats) return <p>Không có dữ liệu.</p>;

  const revenueData = (stats.revenueByMonth || []).map((r) => ({ period: r.month, revenue: Number(r.revenue) }));

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2 style={{ fontWeight: 600, color: "#1f2937" }}>💰 Doanh thu của tôi</h2>
          <p className="text-muted mb-0">Tổng hợp theo thời gian cho các nhà hàng bạn sở hữu</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}><KPICard title="Tổng doanh thu" value={formatCompactCurrency(stats.totalRevenue)} subtitle="Tất cả nhà hàng" /></Col>
        <Col md={3}><KPICard title="Tổng booking" value={stats.totalBookings} subtitle="Đơn tiệc của bạn" /></Col>
        <Col md={3}><KPICard title="Doanh thu/Booking TB" value={formatCompactCurrency(stats.avgRevenuePerBooking)} subtitle="Trung bình" /></Col>
        <Col md={3}><KPICard title="Tỷ lệ hủy" value={`${stats.cancellationRate}%`} trendColor="#ef4444" trend="Booking bị hủy" /></Col>
      </Row>

      <h4 style={{ fontWeight: 600, color: "#1f2937", marginBottom: 16 }}>Doanh thu theo thời gian</h4>
      <Card className="mb-4" style={{ borderRadius: 8, border: "1px solid #e5e7eb" }}>
        <Card.Body>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#9ca3af" />
              <YAxis tickFormatter={formatCompactCurrency} stroke="#9ca3af" />
              <Tooltip formatter={(v) => formatCompactCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </div>
  );
}
