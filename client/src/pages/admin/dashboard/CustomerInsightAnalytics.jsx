import { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Card } from "react-bootstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import KPICard from "../../partner/dashboard/KPICard";
import exportToExcel from "../../../utils/exportToExcel";

export default function CustomerInsightAnalytics() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    repeatedRate: 0,
    avgBookingPerCustomer: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/dashboard/customers")
      .then((res) => {
        const customersByMonth = res.data.customersByMonth || [];
        const repeatedRate = res.data.repeatedRate || 0;
        const avgBookingPerCustomer = res.data.avgBookingPerCustomer || 0;

        setData(customersByMonth);

        // Tính KPI
        const totalCustomers = res.data.totalCustomers || 0;
        const newThisMonth =
          customersByMonth.length > 0
            ? customersByMonth[customersByMonth.length - 1].customers
            : 0;

        setStats({
          totalCustomers,
          newThisMonth,
          repeatedRate,
          avgBookingPerCustomer,
        });
      })
      .catch((err) => {
        console.error("Error loading customer insights:", err);
        setError("Không thể tải dữ liệu khách hàng.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#6b7280",
          fontSize: "1rem",
        }}
      >
        ⏳ Đang tải phân tích khách hàng...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#ef4444",
          fontSize: "1rem",
        }}
      >
        {error}
      </div>
    );
  if (!data.length)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#6b7280",
          fontSize: "1rem",
        }}
      >
        Không có dữ liệu khách hàng.
      </div>
    );

  return (
    <div>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2
            style={{
              fontWeight: 700,
              color: "#111827",
              fontSize: "1.75rem",
              marginBottom: "8px",
            }}
          >
            Phân tích khách hàng
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.9375rem",
              marginBottom: 0,
            }}
          >
            Theo dõi tăng trưởng người dùng & hành vi đặt tiệc
          </p>
        </Col>

        {/* Xuất Excel */}
        <Col xs="auto" className="text-end">
          <button
            onClick={() => exportToExcel(data, "CustomerInsights")}
            style={{
              background: "#10b981",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#059669";
              e.target.style.boxShadow = "0 4px 8px rgba(16, 185, 129, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#10b981";
              e.target.style.boxShadow = "0 2px 4px rgba(16, 185, 129, 0.2)";
            }}
          >
            📤 Xuất Excel
          </button>
          <p
            style={{
              color: "#9ca3af",
              fontSize: "0.75rem",
              fontStyle: "italic",
              marginTop: "8px",
              marginBottom: 0,
            }}
          >
            Cập nhật: {new Date().toLocaleString("vi-VN")}
          </p>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <KPICard
            title="Tổng số khách hàng"
            value={stats.totalCustomers}
            subtitle="Khách đã đăng ký"
          />
        </Col>

        <Col md={3}>
          <KPICard
            title="Khách mới tháng này"
            value={stats.newThisMonth}
            subtitle="Người dùng mới"
          />
        </Col>

        <Col md={3}>
          <KPICard
            title="Tỷ lệ khách quay lại"
            value={`${stats.repeatedRate}%`}
            trend="Dựa trên số booking"
            trendColor="#8b5cf6"
          />
        </Col>

        <Col md={3}>
          <KPICard
            title="Booking TB / khách"
            value={stats.avgBookingPerCustomer}
            subtitle="Mỗi người dùng"
          />
        </Col>
      </Row>

      {/* Biểu đồ số khách theo tháng */}
      <Card
        className="mb-4"
        style={{
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Card.Body>
          <h4
            style={{
              fontWeight: 600,
              color: "#111827",
              marginBottom: "20px",
              fontSize: "1.25rem",
            }}
          >
            Số khách đăng ký theo tháng
          </h4>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="customers"
                name="Số khách"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </div>
  );
}
