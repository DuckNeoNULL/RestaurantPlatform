import React, { useState, useEffect, useRef } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function FilterResult({ venues = [], onFilter }) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000000);
  const [currentPromo, setCurrentPromo] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);

  const trackRef = useRef(null);
  

  // ✅ Lấy danh sách tiện nghi từ backend
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await axios.get("http://localhost:5000/amenities");
        setAmenities(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải tiện nghi:", err);
      }
    };
    fetchAmenities();
  }, []);

  // ✅ Quảng cáo luân phiên
  const promotions = [
    "🎉 Giảm 25% khi đặt trước 30 ngày",
    "💖 Tặng voucher 2 triệu cho tiệc cưới",
    "🌟 Miễn phí trang trí cơ bản",
    "🍾 Tặng rượu champagne cho khách VIP",
    "📸 Gói chụp ảnh kỷ niệm miễn phí",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promotions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Định dạng VND
  const formatVND = (val) =>
    new Intl.NumberFormat("vi-VN").format(Math.round(val));

  // ✅ Kéo slider khoảng giá
  const handleDrag = (e, type) => {
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
    const value = 5000000 + percent * (100000000 - 5000000);

    if (type === "min" && value < maxPrice - 1000000) setMinPrice(value);
    if (type === "max" && value > minPrice + 1000000) setMaxPrice(value);
  };

  const startDrag = (type) => {
    const move = (e) => handleDrag(e, type);
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  // ✅ Tick chọn rating
  const toggleRating = (r) => {
    setSelectedRatings((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  // ✅ Tick chọn amenity
  const toggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Lọc dữ liệu khi người dùng thao tác filter
  useEffect(() => {
    const userFiltering =
      selectedRatings.length > 0 ||
      selectedAmenities.length > 0 ||
      minPrice > 0 ||
      maxPrice < 100000000;

    if (!userFiltering) return; // nếu chưa chọn gì thì không lọc

    let filtered = [...venues];

    // 🔹 Lọc theo khoảng giá
    filtered = filtered.filter((v) => {
      const halls = v.halls || [];
      const minHallPrice = halls.length
        ? Math.min(...halls.map((h) => Number(h.price)))
        : 0;
      return minHallPrice >= minPrice && minHallPrice <= maxPrice;
    });

    // 🔹 Lọc theo rating
    if (selectedRatings.length > 0) {
      filtered = filtered.filter((v) =>
        selectedRatings.some((r) => (v.avgRating || 0) >= r)
      );
    }

    // 🔹 Lọc theo tiện nghi
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((v) =>
        selectedAmenities.every((a) =>
          v.amenityIDs?.includes(a)
        )
      );
    }

    onFilter(filtered);
  }, [minPrice, maxPrice, selectedRatings, selectedAmenities]);

  // ✅ Reset filter
  const resetFilter = () => {
    setMinPrice(0);
    setMaxPrice(100000000);
    setSelectedRatings([]);
    setSelectedAmenities([]);
    onFilter(venues); // quay về danh sách ban đầu
  };

  return (
    <aside>
      {/* 🎁 PROMOTION BOX */}
      <Card
        className="mb-4 shadow-sm"
        style={{
          border: "none",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #E11D48, #F43F5E)",
          color: "white",
          height: "160px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          fontWeight: 600,
          fontSize: "15px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            transition: "transform 0.6s ease",
            transform: `translateY(-${currentPromo * 100}%)`,
          }}
        >
          {promotions.map((promo, index) => (
            <div
              key={index}
              style={{
                height: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <i className="bi bi-gift-fill" style={{ fontSize: "18px" }}></i>
              {promo}
            </div>
          ))}
        </div>
      </Card>

      {/* 💰 PRICE RANGE */}
      <Card className="mb-4 shadow-sm" style={{ border: "none", borderRadius: "12px", padding: "20px" }}>
        <h5 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>Khoảng giá</h5>

        <div
          ref={trackRef}
          style={{
            position: "relative",
            height: "6px",
            backgroundColor: "#d1d5db",
            borderRadius: "3px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              height: "6px",
              backgroundColor: "#0d6efd",
              borderRadius: "3px",
              left: `${(minPrice / 100000000) * 100}%`,
              width: `${((maxPrice - minPrice) / 100000000) * 100}%`,
            }}
          ></div>

          <div
            onMouseDown={() => startDrag("min")}
            style={{
              position: "absolute",
              top: "-7px",
              left: `calc(${(minPrice / 100000000) * 100}% - 8px)`,
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#0d6efd",
              boxShadow: "0 0 5px rgba(0,0,0,0.3)",
              cursor: "grab",
            }}
          ></div>

          <div
            onMouseDown={() => startDrag("max")}
            style={{
              position: "absolute",
              top: "-7px",
              left: `calc(${(maxPrice / 100000000) * 100}% - 8px)`,
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#0d6efd",
              boxShadow: "0 0 5px rgba(0,0,0,0.3)",
              cursor: "grab",
            }}
          ></div>
        </div>

        <Row className="mt-3 text-center">
          <Col xs={6}>
            <div className="border rounded-pill py-1">{formatVND(minPrice)} VND</div>
          </Col>
          <Col xs={6}>
            <div className="border rounded-pill py-1">{formatVND(maxPrice)} VND</div>
          </Col>
        </Row>
      </Card>

      {/* ⭐ RATING */}
      <Card className="mb-4 shadow-sm" style={{ border: "none", borderRadius: "12px", padding: "20px" }}>
        <h5 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "10px" }}>Đánh giá</h5>
        {[4.5, 4.0, 3.5, 3.0].map((r) => (
          <Form.Check
            key={r}
            type="checkbox"
            id={`rating-${r}`}
            label={
              <span>
                {"⭐".repeat(Math.floor(r))} <span style={{ color: "#6b7280" }}>{r}+</span>
              </span>
            }
            checked={selectedRatings.includes(r)}
            onChange={() => toggleRating(r)}
            style={{ marginBottom: "8px", fontSize: "14px", color: "#374151" }}
          />
        ))}
      </Card>

      {/* 🏨 AMENITIES */}
      <Card className="shadow-sm" style={{ border: "none", borderRadius: "12px", padding: "20px" }}>
        <h5 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "10px" }}>Tiện nghi</h5>

        {amenities.length > 0 ? (
          amenities.map((item) => (
            <Form.Check
              key={item.amenityID}
              type="checkbox"
              id={`amenity-${item.amenityID}`}
              label={item.name}
              checked={selectedAmenities.includes(item.amenityID)}
              onChange={() => toggleAmenity(item.amenityID)}
              style={{ marginBottom: "8px", fontSize: "14px", color: "#374151" }}
            />
          ))
        ) : (
          <p style={{ fontSize: "14px", color: "#6b7280" }}>(Chưa có dữ liệu tiện nghi)</p>
        )}
      </Card>

      {/* 🔄 RESET */}
      <Button
        variant="outline-danger"
        className="w-100 mt-3"
        style={{ borderRadius: "8px", fontWeight: "600", padding: "12px" }}
        onClick={resetFilter}
      >
        <i className="bi bi-arrow-clockwise" style={{ marginRight: "6px" }}></i>
        Đặt lại bộ lọc
      </Button>
    </aside>
  );
}
