import { useState } from "react";
import RevenueAnalytics from "./RevenueAnalytics";
import BookingAnalytics from "./BookingAnalytics";
import PartnerPerformanceAnalytics from "./PartnerPerformanceAnalytics";
import CustomerInsightAnalytics from "./CustomerInsightAnalytics";
import SystemSettings from "./SystemSettings";
import AdminLayout from "../../../layouts/AdminLayout";

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("revenue");

  const tabs = [
    { key: "revenue", label: "Doanh Thu" },
    { key: "booking", label: "Đặt Chỗ" },
    { key: "partner", label: "Hiệu Suất Đối Tác" },
    { key: "customer", label: "Phân Tích Khách Hàng" },
    { key: "system", label: "Cài Đặt Hệ Thống" },
  ];

  return (
    <AdminLayout>
      <div style={{ minHeight: "100vh" }}>
        {/* Modern Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "0",
            marginBottom: "32px",
            backgroundColor: "#f9fafb",
            padding: "8px",
            borderRadius: "12px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentView(tab.key)}
              style={{
                background:
                  currentView === tab.key ? "#ffffff" : "transparent",
                border: "none",
                padding: "12px 24px",
                fontSize: "0.9375rem",
                fontWeight: currentView === tab.key ? "600" : "500",
                color: currentView === tab.key ? "#8b5cf6" : "#6b7280",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                boxShadow:
                  currentView === tab.key
                    ? "0 2px 4px rgba(139, 92, 246, 0.1)"
                    : "none",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (currentView !== tab.key) {
                  e.target.style.color = "#8b5cf6";
                  e.target.style.backgroundColor = "rgba(139, 92, 246, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== tab.key) {
                  e.target.style.color = "#6b7280";
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area with smooth transition */}
        <div
          style={{
            animation: "fadeIn 0.3s ease-in",
          }}
        >
          {currentView === "revenue" && <RevenueAnalytics />}
          {currentView === "booking" && <BookingAnalytics />}
          {currentView === "partner" && <PartnerPerformanceAnalytics />}
          {currentView === "customer" && <CustomerInsightAnalytics />}
          {currentView === "system" && <SystemSettings />}
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
