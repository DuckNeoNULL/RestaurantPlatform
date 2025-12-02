"use client"

import { useState } from "react"
import { Card, Row, Col, Table, Form } from "react-bootstrap"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import KPICard from "./KPICard"
import TimePeriodSelector from "./TimePeriodSelector"
import { formatCompactCurrency } from "../../../utils/formatCurrency"

export default function DeepInsights({ type, id, onBack }) {
  const [timePeriod, setTimePeriod] = useState("month")
  const [selectedHall, setSelectedHall] = useState("all")
  const [selectedMenu, setSelectedMenu] = useState("all")

  const hallData = () => {
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
    } else if (timePeriod === "month") {
      return [
        { period: "T1", revenue: 200000000, bookings: 12 },
        { period: "T2", revenue: 350000000, bookings: 18 },
        { period: "T3", revenue: 280000000, bookings: 15 },
        { period: "T4", revenue: 400000000, bookings: 22 },
        { period: "T5", revenue: 500000000, bookings: 28 },
        { period: "T6", revenue: 300000000, bookings: 16 },
        { period: "T7", revenue: 450000000, bookings: 25 },
        { period: "T8", revenue: 520000000, bookings: 29 },
        { period: "T9", revenue: 570000000, bookings: 32 },
        { period: "T10", revenue: 630000000, bookings: 34 },
        { period: "T11", revenue: 700000000, bookings: 38 },
        { period: "T12", revenue: 760000000, bookings: 41 },
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
        { period: "2024", revenue: 4980000000, bookings: 258 },
        { period: "2025", revenue: 5350000000, bookings: 274 },
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


  const menuPerformance = [
    { menu: "Ruby", orders: 62, revenue: 930_000_000 },
    { menu: "Pearl", orders: 45, revenue: 1_350_000_000 },
    { menu: "Royal", orders: 28, revenue: 980_000_000 },
    { menu: "Sapphire", orders: 36, revenue: 420_000_000 },
    { menu: "Elite", orders: 22, revenue: 365_000_000 },
  ]

  const promotionEffectiveness = [
    { promotion: "Giảm 10% mùa cưới", bookings: 38, revenue: 540_000_000 },
    { promotion: "Tặng bánh kem cao cấp", bookings: 26, revenue: 385_000_000 },
    { promotion: "Miễn phí dịch vụ MC", bookings: 19, revenue: 295_000_000 },
    { promotion: "Giảm 15% tiệc sinh nhật", bookings: 24, revenue: 260_000_000 },
    { promotion: "Combo Trang trí + Dịch vụ", bookings: 15, revenue: 335_000_000 },
  ]

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#8b5cf6",
            fontSize: "0.875rem",
            cursor: "pointer",
            padding: "0",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ← Quay lại
        </button>
        <h2 style={{ marginBottom: "8px", color: "#1f2937", fontWeight: "600" }}>Phân Tích Chuyên Sâu</h2>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>Xem chi tiết hiệu suất theo sảnh, menu và khuyến mãi</p>
      </div>

      <Card
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          marginBottom: "24px",
        }}
      >
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                  Lọc theo sảnh
                </Form.Label>
                <Form.Select
                  value={selectedHall}
                  onChange={(e) => setSelectedHall(e.target.value)}
                  style={{ fontSize: "0.875rem" }}
                >
                  <option value="all">Tất cả sảnh</option>
                  <option value="hall-a">Sảnh A</option>
                  <option value="hall-b">Sảnh B</option>
                  <option value="hall-c">Sảnh C</option>
                  <option value="hall-vip">Sảnh VIP</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                  Lọc theo menu/gói
                </Form.Label>
                <Form.Select
                  value={selectedMenu}
                  onChange={(e) => setSelectedMenu(e.target.value)}
                  style={{ fontSize: "0.875rem" }}
                >
                  <option value="all">Tất cả gói</option>
                  <option value="basic">Gói Cơ Bản</option>
                  <option value="vip">Gói VIP</option>
                  <option value="premium">Gói Premium</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>Thời gian</Form.Label>
              <div>
                <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <KPICard title="Doanh thu (đã lọc)" value="715M ₫" trend="↑ 18% so với kỳ trước" />
        </Col>
        <Col md={3} className="mb-3">
          <KPICard title="Số đơn (đã lọc)" value="70" trend="↑ 15% so với kỳ trước" />
        </Col>
        <Col md={3} className="mb-3">
          <KPICard title="TB doanh thu/đơn" value="10.2M ₫" subtitle="Trung bình mỗi booking" />
        </Col>
        <Col md={3} className="mb-3">
          <KPICard title="Tỷ lệ lấp đầy" value="78%" trend="↑ 5% so với kỳ trước" />
        </Col>
      </Row>

      <Card
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          marginBottom: "24px",
        }}
      >
        <Card.Body>
          <Card.Title style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
            Xu hướng doanh thu & đơn đặt
          </Card.Title>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={hallData()}>
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
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Doanh thu"
                dot={{ fill: "#8b5cf6" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                stroke="#a78bfa"
                strokeWidth={2}
                name="Số đơn"
                dot={{ fill: "#a78bfa" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Card.Body>
              <Card.Title style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
                Hiệu quả menu
              </Card.Title>
              <Table hover responsive style={{ marginBottom: 0, fontSize: "0.875rem" }}>
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600" }}>Menu</th>
                    <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600" }}>Số đơn</th>
                    <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600" }}>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {menuPerformance.map((item, index) => (
                    <tr key={index}>
                      <td style={{ verticalAlign: "middle", color: "#374151" }}>{item.menu}</td>
                      <td style={{ verticalAlign: "middle", color: "#374151" }}>{item.orders}</td>
                      <td style={{ verticalAlign: "middle", fontWeight: "600", color: "#8b5cf6" }}>
                        {formatCompactCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Card.Body>
              <Card.Title style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
                Hiệu quả khuyến mãi
              </Card.Title>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={promotionEffectiveness}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="promotion"
                    stroke="#9ca3af"
                    style={{ fontSize: "0.75rem" }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "0.875rem" }} />
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
                  {/* <Bar dataKey="revenue" fill="#8b5cf6" name="Doanh thu" radius={[8, 8, 0, 0]} /> */}
                  <Bar dataKey="bookings" fill="#a78bfa" name="Số đơn" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}