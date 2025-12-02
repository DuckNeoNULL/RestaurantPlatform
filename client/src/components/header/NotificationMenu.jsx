import { useState, useRef, useEffect } from "react";
import { Dropdown, Badge, ListGroup, Button } from "react-bootstrap";
import { Bell, MessageSquare, Tag } from "lucide-react";

export default function NotificationDropdown({ notifications }) {
  const [show, setShow] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Dropdown
      show={show}
      onToggle={() => setShow(!show)}
      ref={ref}
      align="end"
      className="position-relative"
    >
      <Dropdown.Toggle
        variant="light"
        className="position-relative border-0 rounded-circle p-2 bg-transparent"
        style={{ transition: "background 0.2s" }}
      >
        <Bell size={22} className="text-dark" />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 end-0 translate-middle"
            style={{
              fontSize: "0.65rem",
              minWidth: "18px",
              backgroundColor: "#e11d48",
            }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="shadow border rounded-3 p-0"
        style={{
          width: "320px",
          borderColor: "#f0f0f0",
        }}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <span className="fw-semibold text-dark">Thông báo</span>
          {unreadCount > 0 && (
            <span
              className="small fw-medium"
              style={{ color: "#e11d48", cursor: "pointer" }}
            >
              Đánh dấu đã đọc
            </span>
          )}
        </div>

        <ListGroup variant="flush" style={{ maxHeight: "300px", overflowY: "auto" }}>
          {notifications.map((n) => (
            <ListGroup.Item
              key={n.id}
              className={`border-0 px-3 py-2 ${
                n.unread ? "bg-light" : ""
              } d-flex align-items-start`}
              style={{
                transition: "background 0.2s",
                cursor: "pointer",
              }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                  n.type === "chat"
                    ? "bg-primary bg-opacity-10 text-primary"
                    : "bg-warning bg-opacity-10 text-warning"
                }`}
                style={{ width: "40px", height: "40px" }}
              >
                {n.type === "chat" ? <MessageSquare size={18} /> : <Tag size={18} />}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <span className="fw-semibold small text-dark">{n.title}</span>
                  <small className="text-muted">{n.time}</small>
                </div>
                <div className="text-muted small">{n.preview}</div>
              </div>
              {n.unread && (
                <div
                  className="rounded-circle mt-2 flex-shrink-0"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#e11d48",
                  }}
                />
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="border-top text-center py-2">
          <Button
            variant="link"
            className="small fw-medium text-decoration-none"
            style={{ color: "#e11d48" }}
          >
            Xem tất cả
          </Button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
