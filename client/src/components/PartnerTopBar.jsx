import React, { useState, useRef, useEffect } from "react";
import { Navbar, Nav, Container, Badge, NavDropdown, Image, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";
export default function TopBar() {
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  // Mock notifications
  const notifications = [
    { id: 1, text: "Booking BK001 đã được xác nhận" },
    { id: 2, text: "Thanh toán BK002 chưa hoàn tất" },
    { id: 3, text: "Payout PO001 đã chuyển thành công" },
  ];

  // Mock user
  const user = {
    name: "Nguyễn Văn A",
    avatarUrl: "",
  };

  const getInitial = (name) => name.trim()[0].toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm px-3">
      <Container fluid>
        <Nav className="ms-auto align-items-center">

          {/* Notification dropdown */}
          <div ref={notifRef} className="position-relative me-3">
            <div
              style={{ cursor: "pointer" }}
              className="cursor-pointer position-relative d-flex align-items-center"
              onClick={() => setShowNotif(!showNotif)}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: "0.6rem" }}
                >
                  {notifications.length}
                </Badge>
              )}
            </div>

            {showNotif && (
              <div
                className="position-absolute end-0 mt-2 shadow bg-white rounded"
                style={{ width: 300, maxHeight: 350, overflowY: "auto", zIndex: 1000 }}
              >
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted">Không có thông báo</div>
                ) : (
                  <ListGroup variant="flush">
                    {notifications.map((n) => (
                      <ListGroup.Item
                        key={n.id}
                        action
                        as={Link}
                        to="/partner/notifications"
                        className="d-flex align-items-start gap-2"
                      >
                        <i className="bi bi-bell-fill text-primary mt-1"></i>
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{n.text}</div>
                          <div className="small text-muted">1 phút trước</div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <NavDropdown
            align="end"
            className="dropdown-toggle-no-caret"
            title={
              <div
                className="d-flex align-items-center gap-1 cursor-pointer"
                style={{ lineHeight: 1 }} // tránh lệch do line-height
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    roundedCircle
                    width={35}
                    height={35}
                    className="align-self-center"
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: 35, height: 35, fontSize: 16, lineHeight: 1 }}
                  >
                    {getInitial(user.name)}
                  </div>
                )}
                <ChevronDown
                  size={14}
                  className="ms-1 align-self-center"
                  style={{ verticalAlign: "middle", display: "block" }}
                />
              </div>
            }
            id="profile-dropdown"
          >
            <NavDropdown.Item disabled className="fw-bold">{user.name}</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item as={Link} to="/partner/profile">Tài khoản</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/logout">Đăng xuất</NavDropdown.Item>
          </NavDropdown>

        </Nav>
      </Container>
    </Navbar>
  );
}