import React, { useState } from "react";
import { Row, Col, Card, ListGroup, Badge, Modal, Button } from "react-bootstrap";
import { notifications as mockNotifications } from "../../mock/partnerMock";
import PartnerLayout from "../../layouts/PartnerLayout";

export default function Notification() {
  const typeToCategory = {
    booking: "Booking",
    payment: "Finance",
    review: "Review",
    system: "System",
  };

  const categories = ["Booking", "Finance", "Review", "System"];

  const categoryIcon = {
    Booking: <i className="bi bi-calendar me-2 text-primary" />,
    Finance: <i className="bi bi-currency-dollar me-2 text-warning" />,
    Review: <i className="bi bi-star me-2 text-info" />,
    System: <i className="bi bi-gear me-2 text-secondary" />,
  };

  // Clone mock và thêm field read
  const [notifications, setNotifications] = useState(
    mockNotifications.map((n) => ({ ...n, read: n.read || false }))
  );

  const [selectedNoti, setSelectedNoti] = useState(null);

  const openModal = (noti) => {
    setSelectedNoti(noti);
    if (!noti.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, read: true } : n))
      );
    }
  };

  const closeModal = () => setSelectedNoti(null);

  return (
    <PartnerLayout>
      <Row className="g-3">
        <Col md={12}>
          <h2 className="mb-4 text-primary fw-bold">Thông báo</h2>
        </Col>

        {categories.map((cat) => {
          const filtered = notifications.filter(
            (n) => typeToCategory[n.type] === cat
          );
          if (filtered.length === 0) return null;

          return (
            <Col md={6} lg={4} key={cat}>
              <Card className="shadow-sm h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0 d-flex align-items-center">
                      {categoryIcon[cat]}
                      {cat === "Booking" && "Đặt chỗ"}
                      {cat === "Finance" && "Thanh toán"}
                      {cat === "Review" && "Đánh giá"}
                      {cat === "System" && "Hệ thống"}
                    </h5>
                    <Badge bg="secondary" pill>
                      {filtered.length}
                    </Badge>
                  </div>

                  <ListGroup
                    variant="flush"
                    className="flex-grow-1 overflow-auto"
                    style={{ maxHeight: 300 }}
                  >
                    {filtered.map((noti) => (
                      <ListGroup.Item
                        key={noti.id}
                        className={`mb-2 rounded-2 d-flex justify-content-between align-items-start ${
                          noti.read ? "" : "bg-light"
                        }`}
                        style={{ cursor: "pointer", transition: "background 0.2s" }}
                        onClick={() => openModal(noti)}
                      >
                        <div>
                          <div className="fw-semibold text-dark">{noti.title}</div>
                          <div className="small text-muted">{noti.message}</div>
                        </div>
                        {!noti.read && (
                          <Badge bg="danger" pill style={{ fontSize: "0.65rem", height: 20 }}>
                            Mới
                          </Badge>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Modal xem chi tiết */}
      <Modal show={!!selectedNoti} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedNoti?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedNoti?.message}</p>
          <p className="text-muted text-end">
            {selectedNoti &&
              new Date(selectedNoti.date).toLocaleString("vi-VN")}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </PartnerLayout>
  );
}