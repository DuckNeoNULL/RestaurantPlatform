import React, { useState, useMemo } from "react";
import {
    Card,
    Table,
    Row,
    Col,
    Form,
    Badge,
    Button,
    Modal,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import PartnerLayout from "../../../layouts/PartnerLayout";

export default function PartnerPayoutPage() {
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [method, setMethod] = useState("");
    const [selectedPayout, setSelectedPayout] = useState(null);

    // mock data
    const payouts = [
        {
            payoutId: "PO001",
            paymentId: "PMT001",
            bookingID: "BK001",
            grossAmount: 15000000,
            commission: 1500000,
            netAmount: 13500000,
            status: "Paid",
            releasedAt: "2025-10-02T15:00:00",
            transactionRef: "TXN9991",
            method: "Bank Transfer",
            adminName: "Admin A",
            note: "Đã giải ngân đầy đủ",
        },
        {
            payoutId: "PO002",
            paymentId: "PMT002",
            bookingID: "BK002",
            grossAmount: 7000000,
            commission: 700000,
            netAmount: 6300000,
            status: "Pending",
            releasedAt: null,
            transactionRef: "TXN9992",
            method: "Momo",
            adminName: null,
            note: "",
        },
    ];

    const filtered = useMemo(
        () =>
            payouts.filter(
                (p) =>
                    (!status || p.status === status) &&
                    (!method || p.method === method) &&
                    (!fromDate || (p.releasedAt && p.releasedAt >= fromDate)) &&
                    (!toDate || (p.releasedAt && p.releasedAt <= toDate))
            ),
        [status, fromDate, toDate, method]
    );

    const totals = useMemo(() => {
        const waiting = payouts.filter((p) => p.status === "Pending").reduce((s, x) => s + x.netAmount, 0);
        const paid = payouts.filter((p) => p.status === "Paid").reduce((s, x) => s + x.netAmount, 0);
        const commission = payouts.reduce((s, x) => s + x.commission, 0);
        return { waiting, paid, commission };
    }, [payouts]);

    const formatCurrency = (n) => n.toLocaleString("vi-VN") + " ₫";

    const renderStatus = (s) => {
        switch (s) {
            case "Paid":
                return <Badge bg="success">Đã trả</Badge>;
            case "Pending":
                return <Badge bg="warning" text="dark">Chờ xử lý</Badge>;
            case "Failed":
                return <Badge bg="danger">Thất bại</Badge>;
            default:
                return <Badge bg="light text-dark">{s}</Badge>;
        }
    };

    return (
        <PartnerLayout>
            <div className="p-3">
                <h3>Giải ngân từ hệ thống</h3>

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
                                        <option value="Paid">Paid</option>
                                        <option value="Failed">Failed</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Phương thức</Form.Label>
                                    <Form.Select value={method} onChange={(e) => setMethod(e.target.value)}>
                                        <option value="">Tất cả</option>
                                        <option value="Bank Transfer">Chuyển khoản</option>
                                        <option value="Momo">Momo</option>
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
                        </Row>
                    </Card.Body>
                </Card>

                {/* Bảng gọn */}
                <Card>
                    <Card.Body>
                        <Table bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Payout ID</th>
                                    <th>Booking ID</th>
                                    <th className="text-end">Thực nhận</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày giải ngân</th>
                                    <th>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p.payoutId}>
                                        <td>
                                            <Link to="#" className="text-primary text-decoration-none">{p.payoutId}</Link>
                                        </td>
                                        <td>
                                            <Link to={`/partner/bookings/${p.bookingID}`} className="text-primary text-decoration-none">{p.bookingID}</Link>
                                        </td>
                                        <td className="fw-bold text-success text-end">{formatCurrency(p.netAmount)}</td>
                                        <td>{renderStatus(p.status)}</td>
                                        <td>{p.releasedAt ? new Date(p.releasedAt).toLocaleString("vi-VN") : "-"}</td>
                                        <td className="text-center">
                                            <Button size="sm" onClick={() => setSelectedPayout(p)}>Xem</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Footer tổng hợp */}
                        <div className="mt-3 text-end">
                            <div>
                                <strong>Đang chờ:</strong> {formatCurrency(totals.waiting)} &nbsp;|&nbsp;
                                <strong>Đã nhận:</strong> {formatCurrency(totals.paid)} &nbsp;|&nbsp;
                                <strong>Hoa hồng:</strong> {formatCurrency(totals.commission)}
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Modal chi tiết */}
                <Modal show={!!selectedPayout} onHide={() => setSelectedPayout(null)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Chi tiết giải ngân</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedPayout && (
                            <>
                                <Row>
                                    <Col md={6}><strong>Payout ID:</strong> {selectedPayout.payoutId}</Col>
                                    <Col md={6}><strong>Payment ID:</strong> {selectedPayout.paymentId}</Col>
                                </Row>
                                <Row>
                                    <Col md={6}><strong>Booking ID:</strong> {selectedPayout.bookingID}</Col>
                                    <Col md={6}><strong>Phương thức:</strong> {selectedPayout.method}</Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={12}>
                                        <strong>Gross:</strong> {formatCurrency(selectedPayout.grossAmount)}
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={12}>
                                        <strong>Hoa hồng:</strong> {formatCurrency(selectedPayout.commission)}
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={12}>
                                        <strong>Thực nhận:</strong> {formatCurrency(selectedPayout.netAmount)}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}><strong>Ngày giải ngân:</strong> {selectedPayout.releasedAt ? new Date(selectedPayout.releasedAt).toLocaleString("vi-VN") : "-"}</Col>
                                    <Col md={6}><strong>Trạng thái:</strong> {renderStatus(selectedPayout.status)}</Col>
                                </Row>
                                <Row>
                                    <Col md={6}><strong>Admin:</strong> {selectedPayout.adminName || "-"}</Col>
                                    <Col md={6}><strong>Mã giao dịch:</strong> {selectedPayout.transactionRef}</Col>
                                </Row>
                                <Row>
                                    <Col md={12}><strong>Ghi chú:</strong> {selectedPayout.note || "-"}</Col>
                                </Row>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setSelectedPayout(null)}>Đóng</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </PartnerLayout>
    );
}