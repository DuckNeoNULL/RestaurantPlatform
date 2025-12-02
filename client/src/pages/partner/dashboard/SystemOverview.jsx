import { useState } from "react"
import { Row, Col, Card } from "react-bootstrap"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts"
import KPICard from "./KPICard"
import TimePeriodSelector from "./TimePeriodSelector"
import { formatCompactCurrency } from "../../../utils/formatCurrency"
export default function SystemOverview() {
    const [timePeriod, setTimePeriod] = useState("month")

    const systemStats = {
        totalRevenue: 3850000000,
        totalBookings: 142,
        cancellationRate: 6.5,
        totalCustomers: 487,
        avgRevenuePerBooking: 27112676,
        totalReviews: 312,
        avgRating: 4.6,
    }

    const getRevenueOverTimeData = () => {
        if (timePeriod === "week") {
            return [
                { period: "T2", revenue: 125000000 },
                { period: "T3", revenue: 148000000 },
                { period: "T4", revenue: 132000000 },
                { period: "T5", revenue: 165000000 },
                { period: "T6", revenue: 198000000 },
                { period: "T7", revenue: 245000000 },
                { period: "CN", revenue: 228000000 },
            ]
        } else if (timePeriod === "quarter") {
            return [
                { period: "Q1", revenue: 2800000000 },
                { period: "Q2", revenue: 3500000000 },
                { period: "Q3", revenue: 3200000000 },
                { period: "Q4", revenue: 4100000000 },
            ]
        } else if (timePeriod === "year") {
            return [
                { period: "2020", revenue: 8500000000 },
                { period: "2021", revenue: 10200000000 },
                { period: "2022", revenue: 12800000000 },
                { period: "2023", revenue: 13600000000 },
            ]
        }
        return [
            { period: "T1", revenue: 580000000 },
            { period: "T2", revenue: 720000000 },
            { period: "T3", revenue: 650000000 },
            { period: "T4", revenue: 890000000 },
            { period: "T5", revenue: 1050000000 },
            { period: "T6", revenue: 960000000 },
        ]
    }

    const revenueByRestaurantData = [
        { restaurant: "The Rose Hall", revenue: 1200000000, bookings: 45 },
        { restaurant: "Golden Lotus", revenue: 980000000, bookings: 38 },
        { restaurant: "Diamond Palace", revenue: 850000000, bookings: 32 },
        { restaurant: "Royal Garden", revenue: 820000000, bookings: 27 },
    ]

    const revenueDistributionData = [
        { name: "The Rose Hall", value: 31.2, color: "#8b5cf6" },
        { name: "Golden Lotus", value: 25.5, color: "#a78bfa" },
        { name: "Diamond Palace", value: 22.1, color: "#c4b5fd" },
        { name: "Royal Garden", value: 21.2, color: "#ddd6fe" },
    ]

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <Row className="align-items-center">
                    <Col>
                        <h2
                            style={{
                                marginBottom: "8px",
                                color: "#1f2937",
                                fontWeight: "600",
                            }}
                        >
                            Tổng Quan Toàn Hệ Thống
                        </h2>
                        <p style={{ color: "#6b7280" }}>
                            Hiệu suất tổng hợp của tất cả nhà hàng
                        </p>
                    </Col>

                    <Col xs="auto" className="text-end">
                        <p
                            className="text-muted fst-italic mb-0"
                            style={{ fontSize: "16px" }}
                        >
                            Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
                        </p>
                    </Col>
                </Row>
            </div>

            <Row className="mb-4">
                <Col md={3} className="mb-3">
                    <KPICard
                        title="Tổng doanh thu"
                        value={formatCompactCurrency(systemStats.totalRevenue)}
                        subtitle="Từ tất cả nhà hàng"
                    />
                </Col>
                <Col md={3} className="mb-3">
                    <KPICard title="Tổng số booking tháng này" value={systemStats.totalBookings} trend="↑ 12% so với tháng trước" />
                </Col>
                <Col md={3} className="mb-3">
                    <KPICard
                        title="Tỷ lệ hủy tháng này"
                        value={`${systemStats.cancellationRate}%`}
                        trend="↓ 2% so với tháng trước"
                        trendColor="#10b981"
                    />
                </Col>
                <Col md={3} className="mb-3">
                    <KPICard title="Số khách hàng" value={systemStats.totalCustomers} subtitle="Từ tất cả nhà hàng" />
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={3} className="mb-3">
                    <KPICard
                        title="Doanh thu/booking tháng này"
                        value={formatCompactCurrency(systemStats.avgRevenuePerBooking)}
                        subtitle="Trung bình mỗi đơn"
                    />
                </Col>
                <Col md={3} className="mb-3">
                    <KPICard title="Tổng số review" value={systemStats.totalReviews} subtitle="Từ tất cả nhà hàng" />
                </Col>
                <Col md={3} className="mb-3">
                    <KPICard title="Đánh giá TB tháng này" value={`${systemStats.avgRating} ⭐`} subtitle="Điểm trung bình hệ thống" />
                </Col>
                <Col md={3} className="mb-3">
                    <KPICard title="Nhà hàng hoạt động" value="4" subtitle="Đang phục vụ" />
                </Col>
            </Row>

            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, color: "#1f2937", fontWeight: "600" }}>Doanh thu theo thời gian</h4>
                <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
            </div>

            <Row className="mb-4">
                <Col md={12} className="mb-3">
                    <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={getRevenueOverTimeData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="period" stroke="#9ca3af" style={{ fontSize: "0.875rem" }} />
                                    <YAxis stroke="#9ca3af" style={{ fontSize: "0.75rem" }} tickFormatter={formatCompactCurrency} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                        formatter={(value) => [formatCompactCurrency(value), "Doanh thu"]}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h4 style={{ marginBottom: "24px", color: "#1f2937", fontWeight: "600" }}>So sánh doanh thu theo nhà hàng</h4>

            <Row className="mb-4">
                <Col md={8} className="mb-3">
                    <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <Card.Body>
                            <Card.Title style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
                                Doanh thu & Số đơn theo nhà hàng
                            </Card.Title>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={revenueByRestaurantData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="restaurant" stroke="#9ca3af" style={{ fontSize: "0.875rem" }} />
                                    <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: "0.875rem" }} tickFormatter={formatCompactCurrency} />
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
                                    <Bar yAxisId="left" dataKey="revenue" fill="#8b5cf6" name="Doanh thu" radius={[8, 8, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="bookings" fill="#c4b5fd" name="Số đơn" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <Card.Body>
                            <Card.Title style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
                                Tỉ lệ doanh thu
                            </Card.Title>
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={revenueDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        // label={({ name, value }) => `${name}: ${value}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {revenueDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>

                                    {/* Tooltip */}
                                    <Tooltip formatter={(value) => `${value}%`} />

                                    {/* Legend phía dưới, hàng dọc */}
                                    <Legend
                                        layout="vertical"       // sắp xếp theo hàng dọc
                                        verticalAlign="bottom"  // đặt phía dưới
                                        align="center"          // căn giữa
                                        iconType="circle"       // kiểu icon
                                        wrapperStyle={{ marginTop: 20 }} // khoảng cách với chart
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}