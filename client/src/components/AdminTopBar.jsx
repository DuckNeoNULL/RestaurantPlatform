import React, { useState, useRef, useEffect } from "react"
import { Navbar, Nav, Container, Badge, NavDropdown, Image, ListGroup } from "react-bootstrap"
import { Link } from "react-router-dom"
import { Bell, ChevronDown } from "lucide-react"

export default function AdminTopBar() {
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef(null)

  // Mock notifications
  const notifications = [
    { id: 1, text: "Người dùng mới vừa đăng ký tài khoản" },
    { id: 2, text: "Có yêu cầu rút tiền đang chờ duyệt" },
    { id: 3, text: "Báo cáo tháng 11 đã được tạo" },
  ]

  // Mock admin
  const admin = {
    name: "Admin LifEvent",
    avatarUrl: "",
  }

  const getInitial = (name) => name.trim()[0].toUpperCase()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm px-3">
      <Container fluid>
        <Nav className="ms-auto align-items-center">
          {/* Notification dropdown */}
          <div ref={notifRef} className="position-relative me-3">
            <div
              style={{ cursor: "pointer" }}
              className="position-relative d-flex align-items-center"
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
                        to="/admin/notifications"
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
            title={
              <div
                className="d-flex align-items-center gap-1 cursor-pointer"
                style={{ lineHeight: 1 }}
              >
                {admin.avatarUrl ? (
                  <Image src={admin.avatarUrl} roundedCircle width={35} height={35} />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: 35, height: 35, fontSize: 16 }}
                  >
                    {getInitial(admin.name)}
                  </div>
                )}
                <ChevronDown size={14} className="ms-1" />
              </div>
            }
            id="admin-profile-dropdown"
          >
            <NavDropdown.Item disabled className="fw-bold">
              {admin.name}
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item as={Link} to="/admin/profile">
              Hồ sơ quản trị
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/logout">
              Đăng xuất
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  )
}
