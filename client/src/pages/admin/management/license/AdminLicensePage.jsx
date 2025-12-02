import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Modal,
} from "react-bootstrap";
import axios from "../../../../api/axios";
import AdminLayout from "../../../../layouts/AdminLayout";

export default function AdminLicensePage() {
  const [activeTab, setActiveTab] = useState("pending");

  const [approvedPartners, setApprovedPartners] = useState([]);
  const [pendingPartners, setPendingPartners] = useState([]);
  const [negotiatingPartners, setNegotiatingPartners] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    loadApprovedPartners();
    loadPendingPartners();
    loadNegotiatingPartners();
  }, []);

  const loadApprovedPartners = async () => {
    try {
      const res = await axios.get("/admin/users/partners/approved");
      if (res.data?.success) setApprovedPartners(res.data.data || []);
    } catch (err) {
      console.error("❌ Load approved failed:", err);
    }
  };

  const loadPendingPartners = async () => {
    try {
      const res = await axios.get("/admin/users/partners/pending");
      if (res.data?.success) setPendingPartners(res.data.data || []);
    } catch (err) {
      console.error("❌ Load pending failed:", err);
    }
  };

  const loadNegotiatingPartners = async () => {
    try {
      const res = await axios.get("/admin/users/partners/negotiating");
      if (res.data?.success) setNegotiatingPartners(res.data.data || []);
    } catch (err) {
      console.error("❌ Load negotiating failed:", err);
    }
  };

  const handleApprove = (partner) => {
    setSelectedPartner(partner);
    setShowModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedPartner) return;

    try {
      await axios.put(`/admin/users/partners/${selectedPartner.userID}/approve`);

      loadPendingPartners();
      loadNegotiatingPartners();

      alert(`✅ Đã chuyển đối tác ${selectedPartner.fullName} sang đàm phán`);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi phê duyệt đối tác.");
    }

    setShowModal(false);
  };

  const handleReject = async (id) => {
    if (!window.confirm("❌ Bạn chắc chắn muốn từ chối đối tác này?")) return;

    try {
      await axios.put(`/admin/users/partners/${id}/reject`);
      loadPendingPartners();
      alert("🚫 Đã từ chối đối tác.");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi từ chối.");
    }
  };

  const handleActivate = async (partner) => {
    try {
      await axios.put(`/admin/users/partners/${partner.userID}/activate`);
      loadNegotiatingPartners();
      loadApprovedPartners();
      alert("🎉 Đã kích hoạt đối tác!");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi kích hoạt.");
    }
  };

  /* ✨ Style chung cho card */
  const cardStyle = {
    border: "0",
    borderRadius: "18px",
    transition: "all 0.25s ease",
    cursor: "default",
  };

  const cardHover = (e) =>
    (e.currentTarget.style.transform = "translateY(-5px)");
  const cardLeave = (e) => (e.currentTarget.style.transform = "none");

  return (
    <AdminLayout title="Quản lý Đối tác & License">
      <div className="container py-4">
        <style>{`
          .partner-info span {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
          }
          .truncate-url {
            max-width: 220px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
          }
        `}</style>

        <Tabs
          id="license-tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          {/* PENDING */}
          <Tab eventKey="pending" title="Đang chờ phê duyệt">
            {pendingPartners.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>Không có đối tác đang chờ.</p>
              </div>
            ) : (
              <Row className="g-4">
                {pendingPartners.map((p) => (
                  <Col md={6} lg={4} key={p.userID}>
                    <Card
                      className="shadow-sm border-0"
                      style={{ borderRadius: "18px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-5px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "none")
                      }
                    >
                      <Card.Body>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-bold mb-1">{p.fullName}</h5>
                            <span className="text-muted small">{p.email}</span>
                          </div>

                          <Badge
                            bg="warning"
                            text="dark"
                            className="px-3 py-2 rounded-pill"
                          >
                            Đang chờ
                          </Badge>
                        </div>

                        {/* Info */}
                        <div className="text-muted small mb-3 partner-info">
                          <span>📞 {p.phone}</span>
                          <span>
                            📄 License:
                            <span className="truncate-url">
                              {p.partner?.licenseUrl}
                            </span>
                          </span>
                        </div>

                        {/* Footer / Actions */}
                        <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                          <Button
                            variant="success"
                            size="sm"
                            className="px-3"
                            onClick={() => handleApprove(p)}
                          >
                            Phê duyệt
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="px-3"
                            onClick={() => handleReject(p.userID)}
                          >
                            Từ chối
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          {/* NEGOTIATING */}
          <Tab eventKey="negotiating" title="Đang đàm phán">
            {negotiatingPartners.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>Không có đối tác đang đàm phán.</p>
              </div>
            ) : (
              <Row className="g-4">
                {negotiatingPartners.map((p) => (
                  <Col md={6} lg={4} key={p.userID}>
                    <Card
                      className="shadow-sm border-0"
                      style={{ borderRadius: "18px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-5px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "none")
                      }
                    >
                      <Card.Body>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-bold mb-1">{p.fullName}</h5>
                            <span className="text-muted small">{p.email}</span>
                          </div>

                          <Badge
                            bg="info"
                            text="dark"
                            className="px-3 py-2 rounded-pill"
                          >
                            Đàm phán
                          </Badge>
                        </div>

                        {/* Info */}
                        <div className="text-muted small mb-3 partner-info">
                          <span>📞 {p.phone}</span>
                          <span>
                            📄 License:
                            <span className="truncate-url">
                              {p.partner?.licenseUrl}
                            </span>
                          </span>
                        </div>

                        {/* Footer */}
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-100 mt-2"
                          onClick={() => handleActivate(p)}
                        >
                          Kích hoạt đối tác
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          {/* APPROVED */}
          <Tab eventKey="approved" title="Đối tác đã hợp tác">
            {approvedPartners.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>Chưa có đối tác đã hợp tác.</p>
              </div>
            ) : (
              <Row className="g-4">
                {approvedPartners.map((p) => (
                  <Col md={6} lg={4} key={p.userID}>
                    <Card
                      className="shadow-sm"
                      style={cardStyle}
                      onMouseEnter={cardHover}
                      onMouseLeave={cardLeave}
                    >
                      <Card.Body>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-bold mb-1">{p.fullName}</h5>
                            <span className="text-muted small">{p.email}</span>
                          </div>
                          <Badge
                            bg="success"
                            className="px-3 py-2 rounded-pill"
                          >
                            Đã hợp tác
                          </Badge>
                        </div>

                        {/* Info */}
                        <div className="partner-info text-muted small mb-3">
                          <span>📞 {p.phone}</span>

                          <span>
                            📄 License:
                            <span className="truncate-url">
                              {p.partner?.licenseUrl}
                            </span>
                          </span>

                          <span>
                            💰 Hoa hồng:
                            <strong className="text-primary ms-1">
                              {(p.partner?.commissionRate * 100).toFixed(0)}%
                            </strong>
                          </span>
                        </div>

                        {/* Footer */}
                        <div className="border-top pt-2 text-muted small">
                          <i className="fas fa-check-circle text-success me-1"></i>
                          Đối tác đã hoàn tất đàm phán.
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        </Tabs>

        {/* APPROVE MODAL */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận phê duyệt</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedPartner && (
              <p>
                Bạn có muốn chuyển <strong>{selectedPartner.fullName}</strong>{" "}
                sang giai đoạn <strong>đàm phán</strong>?
              </p>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={confirmApproval}>
              Xác nhận
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
}
