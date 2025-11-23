import { useEffect, useState } from "react";
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
import exportToExcel from "../../../utils/exportToExcel";
import KPICard from "../../partner/dashboard/KPICard";

export default function BookingAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    avgPerMonth: 0,
    cancelRate: 0,
    growth: 0,
  });

  useEffect(() => {
    axios
      .get("/api/dashboard/bookings")
      .then((res) => {
        const bookings = res.data.bookingsByMonth.map((item) => ({
          month: item.month,
          bookings: parseInt(item.count, 10),
        }));

        // 📊 Tính toán KPI
        const total = bookings.reduce((sum, b) => sum + b.bookings, 0);
        const avgPerMonth =
          bookings.length > 0 ? total / bookings.length : 0;
        const cancelRate = res.data.cancelRate || 0;
        const growth =
          bookings.length > 1
            ? ((bookings[bookings.length - 1].bookings -
                bookings[bookings.length - 2].bookings) /
                bookings[bookings.length - 2].bookings) *
              100
            : 0;

        setStats({
          total,
          avgPerMonth: avgPerMonth.toFixed(1),
          cancelRate: cancelRate.toFixed(1),
          growth: growth.toFixed(1),
        });
        setData(bookings);
      })
      .catch((err) => {
        console.error("Error loading booking analytics:", err);
        setError("Không thể tải dữ liệu booking.");
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
        ⏳ Đang tải dữ liệu booking...
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
        Không có dữ liệu booking.
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
            Phân tích Đặt chỗ
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.9375rem",
              marginBottom: 0,
            }}
          >
            Thống kê và theo dõi xu hướng đặt tiệc theo thời gian
          </p>
        </Col>

        {/* ✅ Xuất Excel */}
        <Col xs="auto" className="text-end">
          <button
            onClick={() => exportToExcel(data, "BookingAnalytics")}
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
            title="Tổng số booking"
            value={stats.total}
            subtitle="Tổng trong hệ thống"
          />
        </Col>
        <Col md={3}>
          <KPICard
            title="Booking TB / tháng"
            value={stats.avgPerMonth}
            subtitle="Trung bình mỗi tháng"
          />
        </Col>
        <Col md={3}>
          <KPICard
            title="Tăng trưởng"
            value={`${stats.growth}%`}
            trend={
              stats.growth >= 0 ? "↑ So với tháng trước" : "↓ So với tháng trước"
            }
            trendColor={stats.growth >= 0 ? "#10b981" : "#ef4444"}
          />
        </Col>
        <Col md={3}>
          <KPICard
            title="Tỷ lệ hủy"
            value={`${stats.cancelRate}%`}
            trend="Tỷ lệ booking bị hủy"
            trendColor="#ef4444"
          />
        </Col>
      </Row>

      {/* Chart */}
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
            Số lượng booking theo tháng
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
                dataKey="bookings"
                name="Số lượng Booking"
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
