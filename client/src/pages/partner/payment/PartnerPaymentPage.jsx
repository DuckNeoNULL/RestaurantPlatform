import React, { useState, useMemo, useEffect } from "react";
import { Card, Table, Row, Col, Form, Button, Badge, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import { CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PartnerLayout from "../../../layouts/PartnerLayout";
import useAuth from "../../../hooks/useAuth";
import { getPaymentsByPartner } from "../../../services/paymentService";

export default function PartnerPaymentPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const partnerID = user?.userID || user?.partner?.restaurantPartnerID || user?.id;
    if (!partnerID) return;
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await getPaymentsByPartner(partnerID);
        if (!ignore) setPayments(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!ignore) setError(e?.message || "Tải dữ liệu thanh toán thất bại");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  const TYPE_LABEL = {
    0: "DEPOSIT",
    1: "REMAINING",
    2: "REFUND",
  };

  const METHOD_LABEL = {
    0: "PAYOS",
    1: "BANK_TRANSFER",
    2: "CARD",
    3: "CASH",
  };

  const STATUS_LABEL = {
    0: "Pending",
    1: "Processing",
    2: "Confirmed",
    3: "Failed",
    4: "Refunded",
    5: "Cancelled",
  };

  const filtered = useMemo(() => {
    const fromTs = fromDate ? new Date(fromDate).getTime() : null;
    const toTs = toDate ? new Date(toDate).getTime() : null;
    return payments.filter((p) => {
      const labelStatus = STATUS_LABEL[p?.status] || String(p?.status ?? "");
      const labelType = TYPE_LABEL[p?.type] || String(p?.type ?? "");
      const payDate = p?.paymentDate ? new Date(p.paymentDate).getTime() : null;
      return (
        (!status || labelStatus === status) &&
        (!type || labelType === type) &&
        (!search || String(p?.bookingID ?? "").toLowerCase().includes(search.toLowerCase())) &&
        (!fromTs || (payDate && payDate >= fromTs)) &&
        (!toTs || (payDate && payDate <= toTs))
      );
    });
  }, [payments, status, type, fromDate, toDate, search]);

  const totalAmount = filtered.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

  const renderStatusBadge = (s) => {
    switch (s) {
      case "Confirmed":
        return <Badge bg="success">Đã xác nhận</Badge>;
      case "Pending":
        return <Badge bg="secondary">Chờ xử lý</Badge>;
      case "Processing":
        return <Badge bg="info">Đang xử lý</Badge>;
      case "Failed":
        return <Badge bg="danger">Thất bại</Badge>;
      case "Refunded":
        return <Badge bg="warning" text="dark">Hoàn tiền</Badge>;
      case "Cancelled":
        return <Badge bg="dark">Đã hủy</Badge>;
      default:
        return <Badge bg="light text-dark">{s}</Badge>;
    }
  };

  const renderTypeBadge = (t) => {
    return t === "DEPOSIT" ? (
      <Badge bg="primary">Cọc</Badge>
    ) : (
      <Badge bg="warning" text="dark">
        Còn lại
      </Badge>
    );
  };

  const handleShowDetail = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  return (
    <PartnerLayout>
      <div className="p-3">
        <h3>Thanh toán của khách hàng</h3>

        {/* Bộ lọc */}
        <Card className="mb-3">
          <Card.Body>
            <Row className="g-3">
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Tất cả</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Failed">Failed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Loại thanh toán</Form.Label>
                  <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">Tất cả</option>
                    <option value="DEPOSIT">Cọc</option>
                    <option value="REMAINING">Còn lại</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Từ ngày</Form.Label>
                  <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Đến ngày</Form.Label>
                  <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tìm Booking ID</Form.Label>
                  <Form.Control
                    placeholder="Nhập mã booking..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Bảng dữ liệu */}
        <Card>
          <Card.Body>
            {loading && <div className="mb-2">Đang tải dữ liệu…</div>}
            {error && <div className="text-danger mb-2">{error}</div>}
            <div className="table-responsive">
              <Table bordered hover responsive>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Loại</th>
                    <th className="text-end">Số tiền</th>
                    <th>Phương thức</th>
                    <th>Ngày thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Giải ngân</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const labelType = TYPE_LABEL[p?.type] || String(p?.type ?? "");
                    const labelMethod = METHOD_LABEL[p?.paymentMethod] || String(p?.paymentMethod ?? "");
                    const labelStatus = STATUS_LABEL[p?.status] || String(p?.status ?? "");
                    return (
                    <tr key={p.paymentID}>
                      <td>
                        <Link to={`/partner/bookings/${p.bookingID}`} className="text-primary text-decoration-none">
                          {p.bookingID}
                        </Link>
                      </td>
                      <td>{renderTypeBadge(labelType)}</td>
                      <td className="text-end fw-bold">{formatCurrency(p.amount)}</td>
                      <td>{labelMethod}</td>
                      <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString("vi-VN") : "-"}</td>
                      <td>{renderStatusBadge(labelStatus)}</td>
                      <td className="text-center">
                        {p.released ? <CheckCircle size={18} color="green" /> : <XCircle size={18} color="red" />}
                      </td>
                      <td>
                        <Button size="sm" variant="info" onClick={() => handleShowDetail({
                          ...p,
                          type: labelType,
                          method: labelMethod,
                          status: labelStatus,
                        })}>
                          Xem
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            <div className="text-end fw-bold mt-2">
              Tổng khách đã thanh toán: {formatCurrency(totalAmount)}
            </div>
          </Card.Body>
        </Card>

        {/* Modal chi tiết */}
        <Modal show={showModal} onHide={() => setShowModal(false)} scrollable size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết thanh toán</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPayment && (
              <div>
                <p><strong>Booking ID:</strong> {selectedPayment.bookingID}</p>
                <p><strong>Loại thanh toán:</strong> {selectedPayment.type}</p>
                <p><strong>Số tiền:</strong> {formatCurrency(selectedPayment.amount)}</p>
                <p><strong>Phương thức:</strong> {selectedPayment.method}</p>
                <p><strong>Trạng thái:</strong> {selectedPayment.status}</p>
                <p><strong>Ngày thanh toán:</strong> {new Date(selectedPayment.paymentDate).toLocaleString("vi-VN")}</p>
                <p><strong>Đã giải ngân?</strong> {selectedPayment.released ? "✅" : "❌"}</p>
                <p><strong>Mã giao dịch:</strong> {selectedPayment.transactionRef}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </PartnerLayout>
  );
}