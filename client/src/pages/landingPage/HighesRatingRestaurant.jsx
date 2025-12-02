import React, { useRef } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Spotlight, Star } from "lucide-react";
import RestaurantCard from "./RestaurantCard";
import ArrowButton from "../../components/ArrowButton";

const TOP_RESTAURANTS = [
    {
        restaurantID: 1,
        name: "Golden Palace",
        fullAddress: "123 Trần Phú, Hải Châu, Đà Nẵng",
        priceFrom: 500000,
        avgRating: 4.8,
        totalReviews: 245,
        thumbnailURL: "/assets/img/hotel.jpg",
        minCapacity: 20,
        maxCapacity: 40,
        hallCount: 3,
        bestPromotion: "Giảm 15% cho tiệc cưới",
    },
    {
        restaurantID: 2,
        name: "White Swan",
        fullAddress: "456 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng",
        priceFrom: 450000,
        avgRating: 4.7,
        totalReviews: 198,
        thumbnailURL: "/top-restaurant-2.jpg",
        minCapacity: 20,
        maxCapacity: 40,
        hallCount: 3,
        bestPromotion: "Giảm 15% cho tiệc cưới",
    },
    {
        restaurantID: 3,
        name: "Ocean View",
        fullAddress: "789 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
        priceFrom: 600000,
        avgRating: 4.9,
        totalReviews: 312,
        thumbnailURL: "/top-restaurant-3.jpg",
        minCapacity: 20,
        maxCapacity: 40,
        hallCount: 3,
        bestPromotion: "Giảm 15% cho tiệc cưới",
    },
    {
        restaurantID: 4,
        name: "Royal Garden",
        fullAddress: "321 Lê Duẩn, Hải Châu, Đà Nẵng",
        priceFrom: 550000,
        avgRating: 4.6,
        totalReviews: 167,
        thumbnailURL: "/top-restaurant-4.jpg",
        minCapacity: 20,
        maxCapacity: 40,
        hallCount: 3,
        bestPromotion: "Giảm 15% cho tiệc cưới",
    },
    {
        restaurantID: 5,
        name: "Sunset Hall",
        fullAddress: "78 Hoàng Sa, Sơn Trà, Đà Nẵng",
        priceFrom: 520000,
        avgRating: 4.5,
        totalReviews: 140,
        thumbnailURL: "/top-restaurant-5.jpg",
        minCapacity: 20,
        maxCapacity: 40,
        hallCount: 2,
        bestPromotion: "Giảm 10% cho đặt sớm",
    },
];

export default function HighestRatingRestaurant() {
    const scrollRef = useRef(null);
    const showArrows = TOP_RESTAURANTS.length > 4;

    const scrollBy = (distance) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
    };

    return (
        <section className="py-5">
            <Container>
                <div className="d-flex align-items-center gap-2 mb-4">
                    <Star size={26} />
                    <h2 className="fw-bold mb-0" style={{ color: "#E11D48" }}>
                        Top nhà hàng được đánh giá cao nhất
                    </h2>
                </div>

                <div style={{ position: "relative" }}>
                    {showArrows && (
                        <>
                            <div style={{
                                position: "absolute",
                                left: "-20px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 20,
                            }}>
                                <ArrowButton direction="left" onClick={() => scrollBy(-320)} />
                            </div>

                            <div style={{
                                position: "absolute",
                                right: "-20px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 20,
                            }}>
                                <ArrowButton direction="right" onClick={() => scrollBy(320)} />
                            </div>
                        </>
                    )}

                    <Row
                        ref={scrollRef}
                        style={{
                            flexWrap: "nowrap",      // quan trọng: không wrap
                            overflowX: "hidden",
                            scrollBehavior: "smooth",
                            alignItems: "stretch",
                        }}
                        className="g-2"
                    >
                        {TOP_RESTAURANTS.map(r => (
                            <Col
                                as="div"
                                key={r.restaurantID}
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                style={{
                                    flex: "0 0 auto",     // prevent wrapping; allow horizontal scroll
                                    minWidth: 260,        // ensure reasonable card width on small screens
                                    maxWidth: 320,
                                }}
                            >
                                <RestaurantCard restaurant={r} />
                            </Col>
                        ))}
                    </Row>

                </div>
            </Container>

            <style>{`
        /* hide native scrollbar but keep scroll functionality */
        div[role="list"] {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        div[role="list"]::-webkit-scrollbar { display: none; }

        /* simple image hover effect kept */
        .restaurant-img:hover { transform: scale(1.05); transition: transform 220ms ease; }
      `}</style>
        </section>
    );
}