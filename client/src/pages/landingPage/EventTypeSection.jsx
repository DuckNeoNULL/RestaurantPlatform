import React, { useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventTypes } from "../../redux/slices/eventTypeSlice";
import { PartyPopper } from "lucide-react";

const EventTypesSection = () => {
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector(state => state.eventType);

    useEffect(() => {
        dispatch(fetchEventTypes());
    }, [dispatch]);

    return (
        <Container className="py-5">
            <div className="d-flex align-items-center gap-2 mb-4">
                <PartyPopper size={26} />
                <h2 className="fw-bold mb-0" style={{color: "#E11D48"}}>Các loại sự kiện được hỗ trợ</h2>
            </div>

            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-4">
                {!loading &&
                    items.map(event => (
                        <Col key={event.eventTypeID || event.id} xs={12} sm={6} md={4} lg={3}>
                            <Card
                                className="h-100 shadow-sm border-0 text-center p-3"
                                style={{
                                    background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
                                    color: "#fff",
                                }}
                            >
                                <Card.Body>
                                    <Card.Title className="fw-semibold" style={{ color: "#fff" }}>
                                        {event.name}
                                    </Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
            </Row>
        </Container>
    );
};

export default EventTypesSection;