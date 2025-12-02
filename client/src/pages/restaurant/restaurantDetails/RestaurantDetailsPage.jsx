import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Star, Heart, MessageSquare, Users } from "lucide-react";
import ImageCarousel from "../../../components/ImageCarousel";
import "../../../styles/RestaurantDetailsStyles.css";
import RatingStars from "../../../components/RatingStars";
import CapacityRange from "../../../components/CapacityRange";
import NavBar from "../../../components/RestaurantNavBar";
import { faBuildingColumns, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HallList from "./HallList";
import MenuList from "./MenuList";
import ServiceList from "./ServiceList";
import ReviewList from "./ReviewList";
import EventTypeList from "./EventTypeList";
import PromotionList from "./PromotionList";
import MainLayout from "../../../layouts/MainLayout";
import SearchSection from "../../../components/searchbar/SearchSection";
import { useNavigate, useParams } from "react-router-dom";
import useBooking from "../../../hooks/useBooking";
import { useRestaurant } from "../../../hooks/useRestaurant";
import { useReview } from "../../../hooks/useReview";
export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const restaurantId = Number.parseInt(id, 10);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const navigate = useNavigate();
  const { setBookingField, clear } = useBooking();
  const { loadById } = useRestaurant();
  const { list: reviews, loadForRestaurant } = useReview();

  useEffect(() => {
    if (!restaurantId) return;
    let ignore = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const data = await loadById(restaurantId);
        if (!ignore) setRestaurant(data);
      } catch (e) {
        if (!ignore) setError(e?.message || "Không thể tải nhà hàng");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [restaurantId, loadById]);

  // Load reviews for this restaurant using useReview
  useEffect(() => {
    if (!restaurantId) return;
    let ignore = false;
    (async () => {
      try {
        await loadForRestaurant(restaurantId);
      } catch (_) {
        // Review hook already stores error; safe to ignore locally
      }
    })();
    return () => { ignore = true; };
  }, [restaurantId, loadForRestaurant]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container my-4">
          <div className="mt-3 text-center text-muted">Đang tải...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container my-4">
          <div className="alert alert-danger mt-3" role="alert">{error}</div>
        </div>
      </MainLayout>
    );
  }

  if (!restaurant) {
    return (
      <MainLayout>
        <div className="container my-4">
          <div className="alert alert-warning mt-3" role="alert">Không tìm thấy nhà hàng với ID: {id}</div>
        </div>
      </MainLayout>
    );
  }

  const resImages = [restaurant.thumbnailURL, ...(restaurant.images || []).map(img => img.imageURL)];

  const totalReviews = (reviews || []).length;
  const avgRating = totalReviews > 0 ? ((reviews || []).reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalReviews) : 0;

  const maxLength = 350;
  const desc = restaurant.description || "";
  const isLong = desc.length > maxLength;
  const displayText = expanded
    ? desc
    : desc.slice(0, maxLength) + (isLong ? "..." : "");

  return (
    <MainLayout>
      <div style={{ width: "100%" }}>
        <SearchSection noOverlap />
      </div>
      <div className="container my-4">

        <NavBar />
        <section id="overview">
          {/* Tên & Địa chỉ */}
          <div
            className="p-4 my-4 d-flex flex-column flex-md-row justify-content-between align-items-start"
            style={{
              borderRadius: "12px",
              backgroundColor: "#fff",
              boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
            }}
          >
            {/* Thông tin nhà hàng */}
            <div style={{ flex: "1 1 70%", lineHeight: "1.8" }}>
              <h1
                style={{
                  color: "#e11d48",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  fontSize: "2rem",
                }}
              >
                {restaurant.name}
              </h1>

              <p className="text-muted mb-2 d-flex align-items-center">
                <MapPin size={20} className="me-2" />
                {restaurant.address.fullAddress}
              </p>

              <div className="d-flex align-items-center flex-wrap mb-3">
                <span className="d-inline-flex align-items-center me-3">
                  <Users size={16} color="#e11d48" className="me-1" />
                  <CapacityRange halls={restaurant.halls} />
                </span>
                <span className="mx-2">•</span>
                <span className="d-inline-flex align-items-center me-3">
                  <FontAwesomeIcon
                    icon={faBuildingColumns}
                    style={{ color: "#e11d48" }}
                    className="me-restaurantEmail1"
                  />
                  {restaurant.hallCount} sảnh
                </span>
              </div>

              {/* Nút Gửi yêu cầu tư vấn nằm trong card, bên dưới thông tin */}
              <button
                className="d-flex align-items-center justify-content-center mt-2"
                style={{
                  borderRadius: "50px",
                  padding: "0.5rem 1.5rem",
                  fontWeight: "bold",
                  backgroundColor: "#f4c430", // vàng đất
                  color: "#000",
                  border: "none",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                }}
                onClick={() => {
                  // Optional: clear previous booking to avoid stale data
                  try { clear(); } catch {}
                  // Prefill basic booking info for the form
                  setBookingField("restaurant", restaurant.name || "");
                  const hallName = (selectedHall?.name) || (restaurant.halls?.[0]?.name) || "";
                  setBookingField("hall", hallName);
                  // Navigate to booking form; include ids in state if needed later
                  navigate("/", {
                    state: {
                      restaurantId: restaurant.id,
                      hallId: selectedHall?.id || restaurant.halls?.[0]?.id,
                    },
                  });
                }}
              >
                <MessageSquare size={18} className="me-2" /> Gửi yêu cầu tư vấn
              </button>
            </div>

            <div className="align-items-start mt-3 mt-md-0 ms-md-3">
              <div className="d-flex align-items-center text-warning">
                <RatingStars rating={avgRating} />
                <span className="ms-2 fw-semibold">{avgRating.toFixed(1)}/ 5</span>
              </div>

              <div className="text-muted text-end" style={{ fontSize: "0.8rem", marginTop: "-2px" }}>
                ({totalReviews} đánh giá)
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              {/* Gallery */}
              <ImageCarousel id="restaurantImages" images={resImages} />
            </div>
            <div className="col-md-4">
              <div className="card mb-4"
                style={{
                  boxShadow: "0 4px 6px rgba(0,0,0,0.25)",
                  border: "none"
                }}
              >
                <div className="card-body p-4">
                  <h5 className="mb-3 text-uppercase fw-bold" style={{ color: "#e11d48" }}>
                    Tiện ích
                  </h5>
                  <ul className="list-unstyled mb-0">
                    {restaurant.amenities.map((amenity, idx) => (
                      <li
                        key={idx}
                        className="d-flex align-items-center mb-2"
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-2"
                          style={{ color: "#e11d48" }}
                        />
                        <span className="text-dark">{amenity.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bản đồ */}
              <div className="card"
                style={{
                  boxShadow: "0 4px 6px rgba(0,0,0,0.25)",
                  border: "none"
                }}
              >
                <div className="ratio ratio-4x3">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(restaurant.address.fullAddress)}&output=embed`}
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="map"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* Nội dung chính */}
          <div className="row mt-4 mb-4">
            {/* Thông tin */}
            <div className="col-md-8">
              {/* Giới thiệu */}
              <h4 className="section-title">Giới thiệu</h4>
              <p className="description-text">{displayText}</p>
              {isLong && (
                <button
                  className="btn-toggle"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                </button>
              )}
            </div>
          </div >
          <EventTypeList restaurant={restaurant} />
        </section>
        <hr className="mt-4" />
        <section id="promotions">
          <PromotionList restaurant={restaurant} />
        </section>
        <hr className="mt-4" />
        <section id="halls">
          <HallList
            restaurant={{ ...restaurant, selectedHall }}
            onSelectHall={setSelectedHall}
          />
        </section>
        <hr className="mt-4" />
        <section id="menus">
          <MenuList restaurant={restaurant} />
        </section>
        <hr className="mt-4" />
        <section id="services">
          <ServiceList restaurant={restaurant} />
        </section>
        <hr className="mt-4" />
        <section id="reviews">
          <ReviewList reviews={reviews} />
        </section>
      </div>
    </MainLayout>
  );
}
