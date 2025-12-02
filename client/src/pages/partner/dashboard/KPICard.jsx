import { Card } from "react-bootstrap"

export default function KPICard({ title, value, subtitle, trend, trendColor = "#10b981" }) {
  return (
    <Card
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        background: "white",
        height: "100%",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <Card.Body style={{ padding: "20px" }}>
        <div
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            marginBottom: "12px",
            fontWeight: "500",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "1.875rem",
            fontWeight: "700",
            color: "#8b5cf6",
            marginBottom: "8px",
            lineHeight: "1.2",
          }}
        >
          {value}
        </div>
        {trend && (
          <div
            style={{
              fontSize: "0.8125rem",
              color: trendColor,
              marginTop: "8px",
              fontWeight: "500",
            }}
          >
            {trend}
          </div>
        )}
        {subtitle && !trend && (
          <div
            style={{
              fontSize: "0.8125rem",
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            {subtitle}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
