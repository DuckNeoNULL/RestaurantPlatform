import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, Badge, ListGroup, Container, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import axios from "../../../../api/axios";

export default function AdminNegotiationPage() {
    const { partnerID } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [partnerData, setPartnerData] = useState(null);
    const [history, setHistory] = useState([]);
    const [newRate, setNewRate] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!partnerID) {
            setError("Không tìm thấy ID đối tác");
            setLoading(false);
            return;
        }
        loadNegotiationData();
    }, [partnerID]);

    const loadNegotiationData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load partner data and history
            const [dataRes, historyRes] = await Promise.all([
                axios.get(`/negotiation/${partnerID}`),
                axios.get(`/negotiation/${partnerID}/history`)
            ]);

            if (dataRes.data?.success) {
                setPartnerData(dataRes.data.data);
            }

            if (historyRes.data?.success) {
                setHistory(historyRes.data.data || []);
            }
        } catch (err) {
            console.error("❌ Error loading negotiation data:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu đàm phán");
        } finally {
            setLoading(false);
        }
    };

    const handleCounterOffer = async () => {
        if (!newRate || parseFloat(newRate) < 0 || parseFloat(newRate) > 100) {
            alert("Vui lòng nhập mức hoa hồng hợp lệ (0-100%)");
            return;
        }

        try {
            setSubmitting(true);
            const commissionRate = parseFloat(newRate) / 100; // Convert % to decimal

            await axios.post(`/negotiation/${partnerID}/offer`, {
                commissionRate,
                message: message || null
            });

            alert("✅ Đề xuất đã được gửi thành công!");
            setNewRate("");
            setMessage("");
            await loadNegotiationData(); // Reload to show new offer
        } catch (err) {
            console.error("❌ Error creating offer:", err);
            alert(err.response?.data?.message || "Không thể gửi đề xuất");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAccept = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn chấp nhận mức hoa hồng hiện tại và kích hoạt đối tác?")) {
            return;
        }

        try {
            setSubmitting(true);
            await axios.post(`/negotiation/${partnerID}/accept`);

            alert("✅ Đã chấp nhận và kích hoạt đối tác thành công!");
            navigate("/admin/license");
        } catch (err) {
            console.error("❌ Error accepting offer:", err);
            alert(err.response?.data?.message || "Không thể chấp nhận đề xuất");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === 2) return { bg: "warning", text: "Đang đàm phán" };
        if (status === 3) return { bg: "success", text: "Đã thống nhất" };
        return { bg: "secondary", text: "Không xác định" };
    };

    const getRoleLabel = (role) => {
        return role === 1 ? "Admin" : "Partner";
    };

    if (loading) {
        return (
            <AdminLayout title="Đàm phán hoa hồng">
                <Container className="mt-4 text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải dữ liệu...</p>
                </Container>
            </AdminLayout>
        );
    }

    if (error && !partnerData) {
        return (
            <AdminLayout title="Đàm phán hoa hồng">
                <Container className="mt-4">
                    <Alert variant="danger">{error}</Alert>
                    <Button onClick={() => navigate("/admin/license")}>Quay lại</Button>
                </Container>
            </AdminLayout>
        );
    }

    const statusBadge = getStatusBadge(partnerData?.status);
    const currentRate = partnerData?.commissionRate 
        ? (partnerData.commissionRate * 100).toFixed(2) 
        : "Chưa có";

    return (
        <AdminLayout title="Đàm phán hoa hồng">
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Đàm phán hoa hồng</h2>
                    <Button variant="secondary" onClick={() => navigate("/admin/license")}>
                        Quay lại
                    </Button>
                </div>
                
                {error && <Alert variant="warning" dismissible onClose={() => setError(null)}>{error}</Alert>}

                <Card className="mb-4">
                    <Card.Body>
                        <h5>{partnerData?.owner?.fullName || "N/A"}</h5>
                        <p className="mb-2">
                            <strong>Email:</strong> {partnerData?.owner?.email || "N/A"}
                        </p>
                        <p className="mb-2">
                            <strong>Phone:</strong> {partnerData?.owner?.phone || "N/A"}
                        </p>
                        <p className="mb-2">
                            <strong>Mức hoa hồng hiện tại:</strong>{" "}
                            <span className="text-primary fw-bold">{currentRate}%</span>
                        </p>
                        <p className="mb-0">
                            <strong>Trạng thái:</strong>{" "}
                            <Badge bg={statusBadge.bg}>{statusBadge.text}</Badge>
                        </p>
                    </Card.Body>
                </Card>

                <Row>
                    <Col md={8}>
                        <Card>
                            <Card.Header>Lịch sử đàm phán</Card.Header>
                            <ListGroup variant="flush">
                                {history.length === 0 ? (
                                    <ListGroup.Item className="text-center text-muted py-4">
                                        Chưa có lịch sử đàm phán
                                    </ListGroup.Item>
                                ) : (
                                    history.map((h) => (
                                        <ListGroup.Item key={h.negotiationID || h.id}>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <strong>
                                                        {getRoleLabel(h.role)}: {h.proposedBy_user?.fullName || "N/A"}
                                                    </strong>
                                                    <br />
                                                    Đề xuất{" "}
                                                    <span className="fw-bold text-primary">
                                                        {(h.commissionRate * 100).toFixed(2)}%
                                                    </span>{" "}
                                                    hoa hồng
                                                    {h.message && (
                                                        <>
                                                            <br />
                                                            <small className="text-muted">Ghi chú: {h.message}</small>
                                                        </>
                                                    )}
                                                </div>
                                                <small className="text-muted">
                                                    {new Date(h.createdAt).toLocaleString("vi-VN")}
                                                </small>
                                            </div>
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card>
                            <Card.Header>Hành động</Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Đưa ra mức mới (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={newRate}
                                        onChange={(e) => setNewRate(e.target.value)}
                                        disabled={submitting || partnerData?.status !== 2}
                                        placeholder="VD: 12.5"
                                    />
                                    <Form.Text className="text-muted">
                                        Nhập mức hoa hồng từ 0% đến 100%
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={submitting || partnerData?.status !== 2}
                                        placeholder="Thêm ghi chú cho đề xuất..."
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    className="me-2 w-100 mb-2"
                                    onClick={handleCounterOffer}
                                    disabled={submitting || !newRate || partnerData?.status !== 2}
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        "Gửi đề xuất"
                                    )}
                                </Button>

                                <Button
                                    variant="success"
                                    className="w-100"
                                    onClick={handleAccept}
                                    disabled={submitting || partnerData?.status !== 2 || history.length === 0}
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        "Chấp nhận và kích hoạt"
                                    )}
                                </Button>

                                {partnerData?.status !== 2 && (
                                    <Alert variant="info" className="mt-3 mb-0">
                                        Đàm phán đã kết thúc hoặc chưa bắt đầu
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AdminLayout>
    );
}

