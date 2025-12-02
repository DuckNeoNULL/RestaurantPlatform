import React, { useState } from "react";
import { Card, Button, Row, Col, Form, Badge, ListGroup, Container } from "react-bootstrap";
import TopBar from "../../components/PartnerTopBar";
const mockNegotiation = {
    partnerName: "Nguyen Van A",
    currentStatus: "negotiating", // negotiating | agreed
    history: [
        { id: 1, role: "ADMIN", rate: 0.15, date: "2025-09-25 10:00" },
        { id: 2, role: "PARTNER", rate: 0.12, date: "2025-09-26 14:30" },
        { id: 3, role: "ADMIN", rate: 0.13, date: "2025-09-27 09:15" },
    ],
};

export default function NegotiationPage() {
    const [history, setHistory] = useState(mockNegotiation.history);
    const [newRate, setNewRate] = useState("");

    const handleCounterOffer = () => {
        if (!newRate) return;
        const newOffer = {
            id: history.length + 1,
            role: "PARTNER",
            rate: parseFloat(newRate),
            date: new Date().toLocaleString(),
        };
        setHistory([...history, newOffer]);
        setNewRate("");
    };

    const handleAccept = () => {
        alert("Bạn đã chấp nhận mức hoa hồng này. Trạng thái sẽ chuyển sang 'Hoạt động'.");
        // TODO: call API update status = active
    };

    return (
        <>
            <TopBar />
            <Container className="mt-4">
                <h2 className="mb-4">Đàm phán hoa hồng</h2>
                <Card className="mb-4">
                    <Card.Body>
                        <h5>{mockNegotiation.partnerName}</h5>
                        <p>
                            Trạng thái:{" "}
                            <Badge bg={mockNegotiation.currentStatus === "negotiating" ? "warning" : "success"}>
                                {mockNegotiation.currentStatus === "negotiating"
                                    ? "Đang đàm phán"
                                    : "Đã thống nhất"}
                            </Badge>
                        </p>
                    </Card.Body>
                </Card>

                <Row>
                    <Col md={8}>
                        <Card>
                            <Card.Header>Lịch sử đàm phán</Card.Header>
                            <ListGroup variant="flush">
                                {history.map((h) => (
                                    <ListGroup.Item key={h.id}>
                                        <strong>{h.role === "ADMIN" ? "Admin" : "Partner"}: </strong>
                                        Đề xuất {Math.round(h.rate * 100)}% hoa hồng{" "}
                                        <small className="text-muted ms-2">{h.date}</small>
                                    </ListGroup.Item>
                                ))}
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
                                        max="10"
                                        step="0.01"
                                        value={newRate}
                                        onChange={(e) => setNewRate(e.target.value)}
                                    />
                                </Form.Group>
                                <Button variant="primary" className="me-2" onClick={handleCounterOffer}>
                                    Gửi đề xuất
                                </Button>
                                <Button variant="success" onClick={handleAccept}>
                                    Chấp nhận mức hiện tại
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}