import { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card } from "react-bootstrap";
import KPICard from "./KPICard";
import useAuth from "../../../hooks/useAuth";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function PartnerCustomerInsight() {
  const { user } = useAuth();
  const partnerID = user?.userID || user?.partner?.restaurantPartnerID || user?.id;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalCustomers: 0, newThisMonth: 0, repeatedRate: 0, avgBookingPerCustomer: 0 });

  useEffect(() => {
    if (!partnerID) return;
    setLoading(true);
    axios
      .get(`/api/dashboard/partner/${partnerID}/customers`)
      .then((res) => {
        const customersByMonth = res.data.customersByMonth || [];
        setData(customersByMonth);

        const totalCustomers = Number(res.data.totalCustomers || 0);
        const newThisMonth = customersByMonth.length ? Number(customersByMonth[customersByMonth.length - 1].customers || 0) : 0;
        const repeatedRate = res.data.repeatedRate || 0;
        const avgBookingPerCustomer = res.data.avgBookingPerCustomer || 0;

        setStats({ totalCustomers, newThisMonth, repeatedRate, avgBookingPerCustomer });
      })
      .catch((err) => {
        console.error("Partner customers error:", err);
        setError("Không thể tải dữ liệu khách hàng.");
      })
      .finally(() => setLoading(false));
  }, [partnerID]);

  if (!partnerID) return <p>Vui lòng đăng nhập lại để xem dữ liệu.</p>;
  if (loading) return <p>⏳ Đang tải phân tích khách hàng...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!data.length) return <p>Không có dữ liệu khách hàng.</p>;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2 style={{ fontWeight: 600, color: "#1f2937" }}>👥 Khách hàng của tôi</h2>
          <p className="text-muted mb-0">Theo dõi tăng trưởng & hành vi khách</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}><KPICard title="Tổng số khách" value={stats.totalCustomers} subtitle="Đã đặt tại hệ thống bạn" /></Col>
        <Col md={3}><KPICard title="Khách mới (tháng)" value={stats.newThisMonth} subtitle="Tháng gần nhất" /></Col>
        <Col md={3}><KPICard title="Tỷ lệ quay lại" value={`${stats.repeatedRate}%`} trend="Dựa trên booking" trendColor="#8b5cf6" /></Col>
        <Col md={3}><KPICard title="Booking TB / khách" value={stats.avgBookingPerCustomer} subtitle="Mỗi khách" /></Col>
      </Row>

      <Card className="mb-4" style={{ borderRadius: 8, border: "1px solid #e5e7eb" }}>
        <Card.Body>
          <h4 style={{ fontWeight: 600, color: "#1f2937", marginBottom: 16 }}>Khách theo tháng</h4>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="customers" name="Số khách" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </div>
  );
}
