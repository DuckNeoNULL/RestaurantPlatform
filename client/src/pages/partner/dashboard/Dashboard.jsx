import { useState } from "react"
import PartnerLayout from "../../../layouts/PartnerLayout"
import PartnerRevenueAnalytics from "./PartnerRevenueAnalytics"
import PartnerBookingAnalytics from "./PartnerBookingAnalytics"
import PartnerRestaurantPerformance from "./PartnerRestaurantPerformance"
import PartnerCustomerInsight from "./PartnerCustomerInsight"
import PartnerPayouts from "./PartnerPayouts"

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState("revenue")

  return (
    <PartnerLayout style={{ padding: "24px", backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          gap: "16px",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "16px",
        }}
      >
        {[
          { key: "revenue", label: "Doanh Thu" },
          { key: "booking", label: "Đặt Chỗ" },
          { key: "restaurants", label: "Nhà Hàng Của Tôi" },
          { key: "customer", label: "Khách Hàng" },
          { key: "payouts", label: "Chi Trả" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentView(tab.key)}
            style={{
              background: "none",
              border: "none",
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: currentView === tab.key ? "#8b5cf6" : "#6b7280",
              borderBottom: currentView === tab.key ? "2px solid #8b5cf6" : "none",
              cursor: "pointer",
              marginBottom: "-18px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {currentView === "revenue" && <PartnerRevenueAnalytics />}
      {currentView === "booking" && <PartnerBookingAnalytics />}
      {currentView === "restaurants" && <PartnerRestaurantPerformance />}
      {currentView === "customer" && <PartnerCustomerInsight />}
      {currentView === "payouts" && <PartnerPayouts />}
    </PartnerLayout>
  )
}