import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Star, Heart, MapPin, CircleDollarSign, Gem } from "lucide-react";
import RatingStars from "../../components/RatingStars";
import { useReview } from "../../hooks/useReview";
import { useHall } from "../../hooks/useHall";
import { formatFullCurrency } from "../../utils/formatter";
import { Link } from "react-router-dom";

// In-memory caches (module-level) to avoid refetching data for the same restaurant
const restaurantReviewCache = new Map();
const restaurantPriceCache = new Map();

export default function RestaurantCard({ restaurant }) {
    const { loadForRestaurant } = useReview();
    const { loadByRestaurant } = useHall();
    const [avgRating, setAvgRating] = useState(restaurant.avgRating || 0);
    const [totalReviews, setTotalReviews] = useState(restaurant.totalReviews || 0);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [priceFrom, setPriceFrom] = useState(restaurant.priceFrom ?? null);
    const [loadingPrice, setLoadingPrice] = useState(false);

    useEffect(() => {
        const id = restaurant?.restaurantID;
        if (!id) return;
        // If upstream already provides rating & review count and count > 0, use it directly
        if (restaurant?.avgRating !== undefined && restaurant?.totalReviews !== undefined && restaurant.totalReviews > 0) {
            setAvgRating(restaurant.avgRating);
            setTotalReviews(restaurant.totalReviews);
            return;
        }
        // Serve from cache if present
        if (restaurantReviewCache.has(id)) {
            const cached = restaurantReviewCache.get(id);
            setAvgRating(cached.avgRating);
            setTotalReviews(cached.totalReviews);
            return;
        }
        let ignore = false;
        (async () => {
            setLoadingReviews(true);
            try {
                const data = await loadForRestaurant(id);
                if (ignore) return;
                let list = Array.isArray(data) ? data : [];
                // Guard: ensure only reviews truly belonging to this restaurant
                const filtered = list.filter(r => r.restaurantID === id);
                if (filtered.length || list.length === 0) {
                    list = filtered; // use filtered when any match or keep empty
                }
                const count = list.length;
                const avg = count > 0 ? (list.reduce((s, r) => s + (Number(r.rating) || 0), 0) / count) : 0;
                const rounded = Number(avg.toFixed(1));
                setAvgRating(rounded);
                setTotalReviews(count);
                restaurantReviewCache.set(id, { avgRating: rounded, totalReviews: count });
            } catch (e) {
                if (!ignore) {
                    setAvgRating(0);
                    setTotalReviews(0);
                }
            } finally {
                if (!ignore) setLoadingReviews(false);
            }
        })();
        return () => { ignore = true; };
    }, [restaurant?.restaurantID, restaurant?.avgRating, restaurant?.totalReviews, loadForRestaurant]);

    // Compute minimum hall price (priceFrom) if not provided
    useEffect(() => {
        const id = restaurant?.restaurantID;
        if (!id) return;
        // If already provided upstream and valid, use it
        if (restaurant?.priceFrom !== undefined && restaurant.priceFrom !== null) {
            setPriceFrom(restaurant.priceFrom);
            return;
        }
        // Cached
        if (restaurantPriceCache.has(id)) {
            setPriceFrom(restaurantPriceCache.get(id));
            return;
        }
        let ignore = false;
        (async () => {
            setLoadingPrice(true);
            try {
                const halls = await loadByRestaurant(id);
                if (ignore) return;
                const prices = (Array.isArray(halls) ? halls : [])
                    .map(h => Number(h.price))
                    .filter(v => Number.isFinite(v) && v > 0);
                const minPrice = prices.length ? Math.min(...prices) : null;
                setPriceFrom(minPrice);
                restaurantPriceCache.set(id, minPrice);
            } catch (e) {
                if (!ignore) setPriceFrom(null);
            } finally {
                if (!ignore) setLoadingPrice(false);
            }
        })();
        return () => { ignore = true; };
    }, [restaurant?.restaurantID, restaurant?.priceFrom, loadByRestaurant]);

    return (
        <Card
            className="border-0 shadow-sm rounded-3 d-flex flex-column"
            style={{ overflow: "hidden", height: "99%" }}
        >
            <Card.Img
                src={restaurant.thumbnailURL}
                alt={restaurant.name}
                style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    transition: "transform 0.3s",
                    borderBottomLeftRadius: "0",
                    borderBottomRightRadius: "0"
                }}
                className="restaurant-img"
            />

            <Card.Body className="px-3">
                <Card.Title className="fw-bold fs-5 mb-2">
                    <Link
                        to={`/restaurants/${restaurant.restaurantID}`}
                        className="text-dark text-decoration-none"
                    >
                        {restaurant.name}
                    </Link>
                </Card.Title>

                {/* Rating (fetched if absent) */}
                <div className="d-flex align-items-center mb-1" style={{ minHeight: 24 }}>
                    {loadingReviews ? (
                        <span className="small text-muted">Đang tải đánh giá...</span>
                    ) : totalReviews > 0 ? (
                        <>
                            <RatingStars rating={avgRating} readOnly />
                            <span className="small fw-semibold text-secondary ms-1">
                                {avgRating} ({totalReviews})
                            </span>
                        </>
                    ) : (
                        <span className="small text-muted">Chưa có đánh giá</span>
                    )}
                </div>

                {/* Address */}
                <div className="d-flex align-items-start gap-2 mb-2">
                    <MapPin size={16} className="flex-shrink-0 mt-1" />
                    <p className="text-muted small mb-0">
                        {restaurant.fullAddress}
                    </p>
                </div>
                {/* <Row className="justify-content-between">
                                        <Col xs="auto" className="d-flex align-items-center gap-2 mb-2">
                                            <Users size={16} color="#e11d48" />
                                            <p className="small mb-0">
                                                {restaurant.minCapacity} - {restaurant.maxCapacity} bàn
                                            </p>
                                        </Col>

                                        <Col xs="auto" className="d-flex align-items-center gap-2 mb-2">
                                            <Landmark size={16} color="#e11d48" />
                                            <p className="small mb-0">{restaurant.hallCount} sảnh</p>
                                        </Col>
                                    </Row> */}

                {/* ✅ Promotion nổi bật */}
                {restaurant.bestPromotion && (
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span
                            className="px-2 py-1 small fw-semibold d-flex align-items-center"
                            style={{
                                background: "linear-gradient(90deg, #f43f5e, #f87171)", // gradient đỏ – hồng
                                color: "white",
                                borderRadius: "6px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%",
                            }}
                            title={restaurant.bestPromotion} // hiển thị full text khi hover
                        >
                            <Gem size={16} color="white" className="me-1" />
                            {restaurant.bestPromotion}
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="d-flex align-items-center gap-1 mb-2">
                    <CircleDollarSign size={16} color="#e11d48" />
                    {priceFrom != null ? (
                        <p className="mb-0 small text-secondary">
                            Giá chỉ từ{" "}
                            <span className="fw-semibold" style={{ color: "#e11d48" }}>
                                {formatFullCurrency(priceFrom)}
                            </span>
                        </p>
                    ) : (
                        <p className="mb-0 small text-muted">
                            {loadingPrice ? "Đang cập nhật giá..." : "Liên hệ để biết giá"}
                        </p>
                    )}
                </div>
            </Card.Body>

            {/* Hover effect */}
            <style>{`
        .restaurant-img:hover {
          transform: scale(1.1);
        }
      `}</style>
        </Card>
    );
}