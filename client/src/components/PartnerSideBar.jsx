import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Nav, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  Home,
  FileText,
  CalendarCheck,
  CheckSquare,
  DollarSign,
  ArrowDownCircle,
  Slack,
  Bell,
  Menu as MenuIcon,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="bg-white border-end d-flex flex-column"
      style={{
        // make sidebar sticky so it stays visible while right content scrolls
        position: "sticky",
        top: 0,
        height: "100vh",
        width: collapsed ? 70 : 220,
        transition: "width 0.3s",
        minWidth: collapsed ? 70 : 220,
        maxWidth: collapsed ? 70 : 220,
        overflowY: "auto", // allow internal scrolling if sidebar taller than viewport
      }}
    >
      {/* Header */}
      <div
        className="d-flex align-items-center justify-content-between p-3 border-bottom"
        style={{ height: 70 }}
      >
        {!collapsed && (
          <NavLink to="/partner" className="text-decoration-none">
            <span className="fw-bold fs-5 text-primary">LifEvent</span>
          </NavLink>
        )}
        <Button
          variant="light"
          size="sm"
          className="border-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          <MenuIcon size={18} />
        </Button>
      </div>

      {/* Nav items */}
      <div className="flex-grow-1 overflow-auto p-2">
        <Nav className="flex-column">
          <SidebarItem to="/partner" label="Bảng điều khiển" icon={<Home size={18} />} collapsed={collapsed} />
          <SidebarItem to="/partner/restaurants" label="Nhà hàng" icon={<FileText size={18} />} collapsed={collapsed} />
          <SidebarItem to="/partner/hall-schedule" label="Lịch sảnh" icon={<CalendarCheck size={18} />} collapsed={collapsed} />
          <SidebarItem to="/partner/bookings" label="Đặt tiệc" icon={<CheckSquare size={18} />} collapsed={collapsed} />
          <SidebarItem to="/partner/payments" label="Thanh toán" icon={<DollarSign size={18} />} collapsed={collapsed} />
          <SidebarItem to="/partner/payouts" label="Giải ngân" icon={<ArrowDownCircle size={18} />} collapsed={collapsed} />
          <SidebarItem to="/partner/reviews" label="Đánh giá" icon={<Slack size={18} />} collapsed={collapsed} />
          <SidebarItem to="/partner/notifications" label="Thông báo" icon={<Bell size={18} />} collapsed={collapsed} />
        </Nav>
      </div>
    </div>
  );
}

function SidebarItem({ to, label, icon, collapsed }) {
  return (
    <OverlayTrigger
      placement="right"
      overlay={collapsed ? <Tooltip id={`tooltip-${label}`}>{label}</Tooltip> : <></>}
    >
      <Nav.Link
        as={NavLink}
        to={to}
        end
        className={({ isActive }) =>
          `d-flex align-items-center rounded-3 mb-3 text-nowrap ${isActive ? "bg-primary text-white" : "text-dark"
          }`
        }
        style={{
          display: "flex",
          gap: 15,          // khoảng cách icon ↔ chữ
          fontSize: 15,
          minHeight: 48,    // khoảng cách giữa các hàng
          padding: "10px 20px", // bỏ padding mặc định, tự set
          transition: "all 0.2s ease",
        }}
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </Nav.Link>
    </OverlayTrigger>
  );
}