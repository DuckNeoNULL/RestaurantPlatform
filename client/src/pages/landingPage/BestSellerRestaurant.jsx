import React, { useRef, useState, useEffect, getTopBookedRestaurants } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Spotlight } from "lucide-react";
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
        thumbnailURL: "/assets/img/hotel.jpg",
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

export default function BestSellerRestaurant() {
    const scrollRef = useRef(null);
    const [items, setItems] = useState(TOP_RESTAURANTS);
    const showArrows = items.length > 4;

    useEffect(() => {
        let mounted = true;
    (async () => {
            try {
        const res = await getTopBookedRestaurants({ limit: 8 });
                const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                if (!mounted || arr.length === 0) return;
                // normalize to RestaurantCard shape
                const mapped = arr.map((r) => ({
                    restaurantID: r.restaurantID ?? r.id ?? r.restaurantId,
                    name: r.name,
                    fullAddress: r.fullAddress ?? r.address?.fullAddress ?? r.address ?? "",
                    priceFrom: r.priceFrom ?? r.startingPrice ?? r.minPricePerGuest ?? r.priceFromPerGuest,
                    avgRating: r.avgRating ?? r.averageRating ?? r.rating ?? 0,
                    totalReviews: r.totalReviews ?? r.reviewCount ?? r.reviews ?? 0,
                    thumbnailURL: r.thumbnailURL ?? r.thumbnailUrl ?? r.imageURL ?? r.images?.[0]?.imageURL ?? "/assets/img/hotel.jpg",
                    minCapacity: r.minCapacity ?? r.minGuests ?? r.minTables ?? 0,
                    maxCapacity: r.maxCapacity ?? r.maxGuests ?? r.maxTables ?? 0,
                    hallCount: r.hallCount ?? (Array.isArray(r.halls) ? r.halls.length : undefined) ?? 0,
                    bestPromotion: r.bestPromotion?.name ?? r.bestPromotion ?? undefined,
                }));
                setItems(mapped);
            } catch (_) {
                // keep mock if backend fails
            }
        })();
        return () => { mounted = false; };
    }, []);

    const scrollBy = (distance) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
    };

    return (
        <section className="py-3">
            <Container>
                <div className="d-flex align-items-center gap-2 mb-4">
                    <Spotlight size={26} />
                    <h2 className="fw-bold mb-0" style={{ color: "#E11D48" }}>
                        Top nhà hàng được đặt nhiều nhất
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