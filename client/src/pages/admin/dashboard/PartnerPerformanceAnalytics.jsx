import { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card, Table } from "react-bootstrap";
import exportToExcel from "../../../utils/exportToExcel";
import KPICard from "../../partner/dashboard/KPICard";
import { formatCompactCurrency } from "../../../utils/formatCurrency";

export default function PartnerPerformanceAnalytics() {
  const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPartners: 0,
    avgRevenue: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/dashboard/partners")
      .then((res) => {
        const data = (res.data.partners || []).map((p) => ({
          ...p,
          revenue: Number(p.revenue) || 0,
          bookings: Number(p.bookings) || 0,
          rating: Number(p.rating) || 0, // ✅ ép kiểu số để tránh lỗi .toFixed()
        }));

        // 🧮 Tính KPI
        const totalRevenue = data.reduce((sum, p) => sum + p.revenue, 0);
        const totalPartners = data.length;
        const avgRevenue = totalPartners > 0 ? totalRevenue / totalPartners : 0;
        const avgRating =
          totalPartners > 0
            ? data.reduce((sum, p) => sum + p.rating, 0) / totalPartners
            : 0;

        setStats({
          totalRevenue,
          totalPartners,
          avgRevenue,
          avgRating: avgRating.toFixed(2),
        });

        setPartners(data);
      })
      .catch((err) => {
        console.error("Error loading partner performance:", err);
        setError("Không thể tải dữ liệu đối tác.");
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
        ⏳ Đang tải dữ liệu...
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
  if (!partners.length)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#6b7280",
          fontSize: "1rem",
        }}
      >
        Không có dữ liệu đối tác.
      </div>
    );

  return (
    <div>
      {/* ===== Header ===== */}
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
            Hiệu suất đối tác
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.9375rem",
              marginBottom: 0,
            }}
          >
            Phân tích doanh thu, lượt đặt và đánh giá trung bình của từng nhà hàng
          </p>
        </Col>

        {/* ✅ Nút Xuất Excel */}
        <Col xs="auto" className="text-end">
          <button
            onClick={() => exportToExcel(partners, "PartnerPerformance")}
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

      {/* ===== KPI Cards ===== */}
      <Row className="mb-4">
        <Col md={3}>
          <KPICard
            title="Tổng doanh thu hệ thống"
            value={formatCompactCurrency(stats.totalRevenue)}
            subtitle="Tất cả nhà hàng hoạt động"
          />
        </Col>
        <Col md={3}>
          <KPICard
            title="Số đối tác hoạt động"
            value={stats.totalPartners}
            subtitle="Nhà hàng đang hoạt động"
          />
        </Col>
        <Col md={3}>
          <KPICard
            title="Doanh thu trung bình"
            value={formatCompactCurrency(stats.avgRevenue)}
            subtitle="Mỗi nhà hàng"
          />
        </Col>
        <Col md={3}>
          <KPICard
            title="Đánh giá trung bình"
            value={`${stats.avgRating} ⭐`}
            subtitle="Từ khách hàng"
          />
        </Col>
      </Row>

      {/* ===== Bảng hiệu suất đối tác ===== */}
      <Card
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
            Hiệu suất từng đối tác
          </h4>
          <Table
            striped
            bordered
            hover
            responsive
            style={{
              marginBottom: 0,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ fontWeight: 600, color: "#374151" }}>#</th>
                <th style={{ fontWeight: 600, color: "#374151" }}>Nhà hàng</th>
                <th style={{ fontWeight: 600, color: "#374151" }}>
                  Doanh thu (VNĐ)
                </th>
                <th style={{ fontWeight: 600, color: "#374151" }}>Số booking</th>
                <th style={{ fontWeight: 600, color: "#374151" }}>
                  Đánh giá TB
                </th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr
                  key={p.restaurantID || i}
                  style={{
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <td style={{ color: "#6b7280" }}>{i + 1}</td>
                  <td style={{ fontWeight: 500, color: "#111827" }}>
                    {p.name || "—"}
                  </td>
                  <td style={{ color: "#111827" }}>
                    {p.revenue.toLocaleString("vi-VN")}
                  </td>
                  <td style={{ color: "#111827" }}>{p.bookings}</td>
                  <td>
                    {p.rating ? (
                      <span style={{ color: "#facc15", fontWeight: 600 }}>
                        {p.rating.toFixed(1)} ⭐
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
