import { Card, Table, Badge, Row, Col } from "react-bootstrap"
import { formatCompactCurrency } from "../../../utils/formatCurrency"
export default function RestaurantComparison({ onSelectRestaurant }) {
    const restaurants = [
        {
            id: 1,
            name: "The Rose Hall",
            revenue: 1200000000,
            bookings: 45,
            cancellationRate: 5,
            avgRating: 4.7,
            topHall: "Hall A"
        },
        {
            id: 2,
            name: "Golden Lotus",
            revenue: 980000000,
            bookings: 38,
            cancellationRate: 7,
            avgRating: 4.6,
            topHall: "Hall VIP"
        },
        {
            id: 3,
            name: "Trung tâm Hội nghị & Tiệc cưới Minh Châu Việt",
            revenue: 850000000,
            bookings: 32,
            cancellationRate: 10,
            avgRating: 4.3,
            topHall: "Hall 2"
        },
        {
            id: 4,
            name: "White Swan Wedding & Event",
            revenue: 820000000,
            bookings: 27,
            cancellationRate: 4,
            avgRating: 4.8,
            topHall: "Garden Hall"
        },
    ]

    // const getStatusBadge = (status) => {
    //     if (status === "excellent") {
    //         return (
    //             <Badge bg="success" style={{ fontSize: "0.75rem" }}>
    //                 Xuất sắc
    //             </Badge>
    //         )
    //     }
    //     return (
    //         <Badge bg="primary" style={{ fontSize: "0.75rem", backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" }}>
    //             Tốt
    //         </Badge>
    //     )
    // }

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
                            So Sánh Nhà Hàng
                        </h2>
                        <p style={{ color: "#6b7280", marginBottom: "0" }}>
                            So sánh hiệu suất giữa các nhà hàng — Click vào nhà hàng để xem chi tiết
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

            <Card style={{ border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <Card.Body>
                    <Table hover responsive style={{ marginBottom: 0 }}>
                        <thead style={{ backgroundColor: "#f9fafb" }}>
                            <tr>
                                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                                    Nhà hàng
                                </th>
                                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                                    Doanh thu tháng này
                                </th>
                                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                                    Booking
                                </th>
                                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                                    Tỷ lệ hủy
                                </th>
                                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                                    Đánh giá TB
                                </th>
                                <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                                    Sảnh hàng đầu
                                </th>
                                {/* <th style={{ borderTop: "none", color: "#6b7280", fontWeight: "600", fontSize: "0.875rem" }}>
                                    Trạng thái
                                </th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {restaurants.map((restaurant) => (
                                <tr
                                    key={restaurant.id}
                                    onClick={() => onSelectRestaurant(restaurant.id)}
                                    style={{
                                        cursor: "pointer",
                                        fontSize: "0.875rem",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#f9fafb"
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent"
                                    }}
                                >
                                    <td style={{ verticalAlign: "middle", fontWeight: "600", color: "#8b5cf6" }}>{restaurant.name}</td>
                                    <td style={{ verticalAlign: "middle", color: "#374151", fontWeight: "600" }}>
                                        {formatCompactCurrency(restaurant.revenue)}
                                    </td>
                                    <td style={{ verticalAlign: "middle", color: "#374151" }}>{restaurant.bookings}</td>
                                    <td style={{ verticalAlign: "middle", color: "#374151" }}>{restaurant.cancellationRate}%</td>
                                    <td style={{ verticalAlign: "middle", color: "#374151" }}>{restaurant.avgRating} ⭐</td>
                                    <td style={{ verticalAlign: "middle", color: "#374151" }}>{restaurant.topHall}</td>
                                    {/* <td style={{ verticalAlign: "middle" }}>{getStatusBadge(restaurant.status)}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <div
                style={{
                    marginTop: "16px",
                    padding: "12px",
                    backgroundColor: "#f0fdf4",
                    borderRadius: "8px",
                    border: "1px solid #bbf7d0",
                }}
            >
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#166534" }}>
                    💡 <strong>Mẹo:</strong> Click vào bất kỳ nhà hàng nào để xem dashboard chi tiết với các biểu đồ và thống kê
                    sâu hơn.
                </p>
            </div>
        </div>
    )
}