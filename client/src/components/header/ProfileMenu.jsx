import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { User, List, LogOut } from "lucide-react";

export default function ProfileMenu({ user, onLogout }) {
  const firstLetter = user?.fullname?.[0]?.toUpperCase() || "U";

  return (
    <Dropdown align="end" className="position-relative">
      <Dropdown.Toggle
        variant="danger"
        className="rounded-circle border-0 d-flex align-items-center justify-content-center fw-semibold shadow-sm"
        style={{
          width: "42px",
          height: "42px",
          backgroundColor: "#e11d48",
          transition: "background 0.2s",
        }}
      >
        {firstLetter}
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="shadow border rounded-3 p-0 overflow-hidden"
        style={{ borderColor: "#f0f0f0" }}
      >
        <Dropdown.Item
          href="#"
          className="d-flex align-items-center gap-2 py-2 px-3 text-dark"
          style={{ transition: "background 0.2s" }}
        >
          <User size={16} />
          Hồ sơ
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          to="/customer/bookings"
          className="d-flex align-items-center gap-2 py-2 px-3 text-dark"
          style={{ transition: "background 0.2s" }}
        >
          <List size={16} />
          Danh sách
        </Dropdown.Item>
        <Dropdown.Divider className="my-1" />
        <Dropdown.Item
          onClick={onLogout}
          className="d-flex align-items-center gap-2 py-2 px-3 text-dark"
          style={{ transition: "background 0.2s" }}
        >
          <LogOut size={16} />
          Đăng xuất
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}