import React, { useMemo, useState, useEffect } from "react";
import { Card, Table, Badge, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import PartnerLayout from "../../../layouts/PartnerLayout";
import RatingStars from "../../../components/RatingStars";
import useAuth from "../../../hooks/useAuth";

export default function PartnerReviewPage() {
    const { user } = useAuth();
    const [selectedReview, setSelectedReview] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const partnerID = user?.userID || user?.partner?.restaurantPartnerID || user?.id;
        if (!partnerID) return;
        let ignore = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/partners/${partnerID}/reviews`, {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                const json = await res.json();
                if (!res.ok || json?.success === false) throw new Error(json?.message || "Tải review thất bại");
                if (!ignore) setReviews(Array.isArray(json.data) ? json.data : []);
            } catch (e) {
                if (!ignore) setError(e?.message || "Tải review thất bại");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [user]);

    return (
        <PartnerLayout>
            <div className="p-3">
                <h3>
                    <i className="bi bi-chat-left-text me-2 text-primary"></i>
                    Đánh giá của khách
                </h3>

                <Card className="mt-3">
                    <Card.Body>
                        {loading && <div>Đang tải đánh giá…</div>}
                        {error && <div className="text-danger mb-2">{error}</div>}
                        <Table hover responsive>
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Nhà hàng</th>
                                    <th>Nội dung</th>
                                    <th>Đánh giá</th>
                                    <th>Ngày review</th>
                                    <th>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((r) => (
                                    <tr key={r.reviewID || r.reviewId}>
                                        <td>
                                            <Link to={`/partner/bookings/${r.bookingID}`} className="text-primary text-decoration-none">
                                                <i className="bi bi-bookmark me-1"></i>
                                                {r.bookingID}
                                            </Link>
                                        </td>
                                        <td>
                                            <i className="bi bi-shop me-1"></i>
                                            {r.restaurantName || r.restaurant}
                                        </td>
                                        <td>{r.comment}</td>
                                        <td>
                                            <RatingStars rating={Number(r.rating || 0)} />
                                        </td>
                                        <td>
                                            <i className="bi bi-calendar-event me-1"></i>
                                            {r.date ? new Date(r.date).toLocaleDateString("vi-VN") : "-"}
                                        </td>
                                        <td>
                                            <Button size="sm" onClick={() => setSelectedReview(r)}>
                                                <i className="bi bi-eye me-1"></i>
                                                Xem
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* Modal chi tiết review */}
                {selectedReview && (
                    <Modal
                        show={true}
                        onHide={() => setSelectedReview(null)}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <i className="bi bi-chat-left-text me-2"></i>
                                Review chi tiết
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                <strong>
                                    <i className="bi bi-bookmark me-1"></i>
                                    Booking ID:
                                </strong>{" "}
                                {selectedReview.bookingID}
                            </p>
                            <p>
                                <strong>
                                    <i className="bi bi-shop me-1"></i>
                                    Nhà hàng:
                                </strong>{" "}
                                {selectedReview.restaurantName || selectedReview.restaurant}
                            </p>
                            <p>
                                <strong>
                                    <i className="bi bi-person-circle me-1"></i>
                                    Khách:
                                </strong>{" "}
                                {selectedReview.customerName}
                            </p>
                            <p>
                                <strong>
                                    <i className="bi bi-star-fill me-1"></i>
                                    Đánh giá:
                                </strong>{" "}
                                <RatingStars rating={Number(selectedReview.rating || 0)} />
                            </p>
                            <p>
                                <strong>
                                    <i className="bi bi-chat-text me-1"></i>
                                    Nội dung:
                                </strong>{" "}
                                {selectedReview.comment}
                            </p>
                            <p>
                                <strong>
                                    <i className="bi bi-calendar-event me-1"></i>
                                    Ngày review:
                                </strong>{" "}
                                {selectedReview.date ? new Date(selectedReview.date).toLocaleString("vi-VN") : "-"}
                            </p>
                        </Modal.Body>
                    </Modal>
                )}
            </div>
        </PartnerLayout>
    );
}