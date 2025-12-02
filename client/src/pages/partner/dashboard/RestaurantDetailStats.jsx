import { useState } from "react"
import { Card, Row, Col, Table, Badge, Button } from "react-bootstrap"
import { ArrowLeft } from "react-bootstrap-icons";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from "recharts"
import KPICard from "./KPICard"
import TimePeriodSelector from "./TimePeriodSelector"
import { formatCompactCurrency } from "../../../utils/formatCurrency";

export default function RestaurantDetail({ restaurantId, onBack, onDrillDown }) {
  const [timePeriod, setTimePeriod] = useState("month")

  const restaurantNames = {
    1: "The Rose Hall",
    2: "Golden Lotus",
    3: "Diamond Palace",
    4: "Royal Garden",
  }

  const stats = {
    totalRevenue: 1250000000,
    pendingBookings: 5,
    confirmedBookings: 12,
    completedBookings: 28,
    averageRating: 4.8,
    totalCustomers: 156,
  }

  const bookings = [
    {
      id: 101,
      customerName: "Nguyễn Văn A",
      eventDate: "15/12/2025",
      guests: 200,
      status: "confirmed",
      total: 185000000,
    },
    {
      id: 102,
      customerName: "Phạm Thị B",
      eventDate: "20/12/2025",
      guests: 150,
      status: "pending",
      total: 150000000,
    },
    {
      id: 103,
      customerName: "Hoàng Văn C",
      eventDate: "25/8/2025",
      guests: 180,
      status: "completed",
      total: 170000000,
    },
  ]

  const getRevenueData = () => {
    if (timePeriod === "week") {
      return [
        { period: "T2", revenue: 45000000, bookings: 2 },
        { period: "T3", revenue: 52000000, bookings: 3 },
        { period: "T4", revenue: 38000000, bookings: 1 },
        { period: "T5", revenue: 65000000, bookings: 4 },
        { period: "T6", revenue: 78000000, bookings: 5 },
        { period: "T7", revenue: 95000000, bookings: 6 },
        { period: "CN", revenue: 88000000, bookings: 5 },
      ]
    } else if (timePeriod === "quarter") {
      return [
        { period: "Q1", revenue: 830000000, bookings: 45 },
        { period: "Q2", revenue: 1200000000, bookings: 62 },
        { period: "Q3", revenue: 980000000, bookings: 51 },
        { period: "Q4", revenue: 1450000000, bookings: 73 },
      ]
    } else if (timePeriod === "year") {
      return [
        { period: "2020", revenue: 2800000000, bookings: 145 },
        { period: "2021", revenue: 3200000000, bookings: 168 },
        { period: "2022", revenue: 3850000000, bookings: 195 },
        { period: "2023", revenue: 4460000000, bookings: 231 },
      ]
    }
    return [
      { period: "T1", revenue: 200000000, bookings: 12 },
      { period: "T2", revenue: 350000000, bookings: 18 },
      { period: "T3", revenue: 280000000, bookings: 15 },
      { period: "T4", revenue: 400000000, bookings: 22 },
      { period: "T5", revenue: 500000000, bookings: 28 },
      { period: "T6", revenue: 300000000, bookings: 16 },
    ]
  }

  const bookingStatusData = [
    { name: "Chờ xác nhận", value: stats.pendingBookings, color: "#f59e0b" },
    { name: "Đã xác nhận", value: stats.confirmedBookings, color: "#10b981" },
    { name: "Đã hoàn thành", value: stats.completedBookings, color: "#8b5cf6" },
  ]

  const hallPerformanceData = [
    { hall: "Sảnh A", bookings: 35, revenue: 450000000, fill: "#c4b5fd" },
    { hall: "Sảnh B", bookings: 28, revenue: 380000000, fill: "#a78bfa" },
    { hall: "Sảnh C", bookings: 42, revenue: 520000000, fill: "#8b5cf6" },
    { hall: "Sảnh VIP", bookings: 18, revenue: 680000000, fill: "#7c3aed" },
  ]

  const statusVariant = (status) => {
    switch (status) {
      case "confirmed":
        return "success"
      case "pending":
        return "warning"
      case "completed":
        return "primary"
      default:
        return "secondary"
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <Row className="align-items-center">
          <Col>
            <Button
              variant="link"
              onClick={onBack}
              className="p-0 mb-2 text-decoration-none"
              style={{
                color: "#8b5cf6",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ArrowLeft size={16} /> Quay lại
            </Button>

            <h2
              style={{
                marginBottom: "8px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              {restaurantNames[restaurantId] || "Chi Tiết Nhà Hàng"}
            </h2>

            <p style={{ color: "#6b7280", marginBottom: "0" }}>
              Theo dõi hiệu suất kinh doanh của nhà hàng
            </p>
          </Col>

          <Col xs="auto" className="text-end">
            <p
              className="text-muted fst-italic mb-0"
              style={{ fontSize: "14px" }}
            >
              Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
            </p>
          </Col>
        </Row>
      </div>

      <Row className="mb-4" style={{ gap: "0" }}>
        <Col md={3} className="mb-3">
          <KPICard
            title="Doanh thu tháng"
            value={formatCompactCurrency(stats.totalRevenue)}
            trend="↑ 12% so với tháng trước"
          />
        </Col>
        <Col md={3} className="mb-3">
          <KPICard
            title="Tổng đơn đặt"
            value={stats.pendingBookings + stats.confirmedBookings + stats.completedBookings}
            trend="↑ 8% so với tháng trước"
          />
        </Col>
        <Col md={3} className="mb-3">
          <KPICard
            title="Đánh giá trung bình"
            value={`${stats.averageRating} ⭐`}
            subtitle={`Từ ${stats.totalCustomers} đánh giá`}
          />
        </Col>
        <Col md={3} className="mb-3">
          <KPICard title="Chờ xác nhận" value={stats.pendingBookings} subtitle="Cần xử lý ngay" />
        </Col>
      </Row>

      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, color: "#1f2937", fontWeight: "600" }}>Phân tích doanh thu</h4>
        <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
      </div>

      <Row className="mb-4">
        <Col md={8} className="mb-3">
          <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Card.Body>
              <Card.Title style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
                Doanh thu & Số lượng đơn
              </Card.Title>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={getRevenueData()}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#9ca3af" style={{ fontSize: "0.875rem" }} />
                  <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: "0.75rem" }} tickFormatter={formatCompactCurrency} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" style={{ fontSize: "0.875rem" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, name) => {
                      if (name === "Doanh thu") return [formatCompactCurrency(value), "Doanh thu"]
                      return [value, "Số đơn"]
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="right" dataKey="bookings" fill="#a78bfa" name="Số đơn" radius={[8, 8, 0, 0]} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    fill="url(#colorRevenue)"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#7c3aed", stroke: "#fff", strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: "#4f0bedff", stroke: "#fff", strokeWidth: 2 }}
                    name="Doanh thu"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Card.Body>
              <Card.Title style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
                Phân bổ trạng thái đơn
              </Card.Title>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const total = bookingStatusData.reduce((sum, item) => sum + item.value, 0);
                      const percentValue = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                      return [`${value} đơn (${percentValue}%)`, name];
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ marginTop: 20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-5" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <Card.Body>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
          >
            <Card.Title style={{ fontSize: "1.125rem", fontWeight: "600", margin: 0, color: "#1f2937" }}>
              Hiệu suất theo sảnh
            </Card.Title>
            <button
              onClick={() => onDrillDown("hall", "all")}
              style={{
                background: "none",
                border: "1px solid #8b5cf6",
                color: "#8b5cf6",
                fontSize: "0.75rem",
                padding: "4px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Xem chi tiết
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hallPerformanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" style={{ fontSize: "0.875rem" }} />
              <YAxis dataKey="hall" type="category" stroke="#9ca3af" style={{ fontSize: "0.875rem" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                formatter={(value, name) => {
                  if (name === "revenue") return [`${(value / 1000000).toFixed(0)}M ₫`, "Doanh thu"]
                  return [value, "Số đơn"]
                }}
              />
              <Legend />
              <Bar dataKey="bookings" name="Số đơn" radius={[0, 8, 8, 0]}>
                {hallPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <Card.Body>
          <h4 style={{ marginBottom: "20px", color: "#1f2937", fontWeight: "600" }}>Đơn đặt tiệc gần đây</h4>
          <Table hover responsive style={{ marginBottom: 0 }}>
            <thead style={{ backgroundColor: "#f9fafb" }}>
              <tr>
                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>Mã đơn</th>
                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                  Khách hàng
                </th>
                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                  Ngày tổ chức
                </th>
                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                  Số khách
                </th>
                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                  Tổng tiền
                </th>
                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ fontSize: "0.875rem" }}>
                  <td style={{ verticalAlign: "middle", fontWeight: "600", color: "#374151" }}>#{b.id}</td>
                  <td style={{ verticalAlign: "middle", color: "#374151" }}>{b.customerName}</td>
                  <td style={{ verticalAlign: "middle", color: "#374151" }}>{b.eventDate}</td>
                  <td style={{ verticalAlign: "middle", color: "#374151" }}>{b.guests}</td>
                  <td style={{ verticalAlign: "middle", fontWeight: "600", color: "#374151" }}>
                    {(b.total / 1000000).toFixed(0)}M ₫
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Badge
                      bg={statusVariant(b.status)}
                      style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: "500" }}
                    >
                      {b.status === "confirmed"
                        ? "Đã xác nhận"
                        : b.status === "pending"
                          ? "Chờ xác nhận"
                          : "Đã hoàn thành"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}