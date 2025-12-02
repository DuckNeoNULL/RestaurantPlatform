import { useState, useRef } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import useAmenity from "../../../../hooks/useAmenity";

import RatingStars from "../../../../components/RatingStars";

export default function FilterResult() {
  const [minPrice, setMinPrice] = useState(5000000);
  const [maxPrice, setMaxPrice] = useState(100000000);
  const [minInputValue, setMinInputValue] = useState("5000000");
  const [maxInputValue, setMaxInputValue] = useState("100000000");
  const trackRef = useRef(null);
  const { amenities, loading, error } = useAmenity();
  const formatVND = (val) => {
    const num =
      typeof val === "string" ? parseInt(val.replace(/\D/g, "")) || 0 : val;
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Chuyển từ string format về number
  const parseFormattedNumber = (str) => {
    return parseInt(str.replace(/\./g, "")) || 0;
  };

  // Kéo slider
  const handleDrag = (e, type) => {
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.min(
      Math.max(0, (e.clientX - rect.left) / rect.width),
      1
    );
    const value = Math.min(
      100000000, // chặn max
      Math.max(5000000, 5000000 + percent * (100000000 - 5000000))
    );

    if (type === "min") {
      const newVal = Math.min(value, maxPrice - 1000000);
      setMinPrice(newVal);
      setMinInputValue(newVal.toString());
    }
    if (type === "max") {
      const newVal = Math.max(value, minPrice + 1000000);
      setMaxPrice(newVal);
      setMaxInputValue(newVal.toString());
    }
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

  const handleMinChange = (e) => {
    const inputValue = e.target.value;

    // Cho phép nhập số và xóa
    if (inputValue === "") {
      setMinInputValue("");
      return;
    }

    // Chỉ lấy ký tự số
    const sanitized = inputValue.replace(/\D/g, "");
    setMinInputValue(sanitized);

    // Kiểm tra format hợp lệ (không có 2 dấu chấm liên tiếp)
    const parts = sanitized.split(".");
    if (parts.length > 1 && parts.some((part) => part === "")) {
      return; // Không cho phép format không hợp lệ
    }

    setMinInputValue(sanitized);
    // Parse giá trị và validate
    const numericValue = parseFormattedNumber(sanitized);
    if (!isNaN(numericValue)) {
      let val = numericValue;

      // Giới hạn giá trị
      if (val < 5000000) val = 5000000;
      if (val > maxPrice - 1000000) val = maxPrice - 1000000;
      if (val > 100000000) val = 100000000;

      setMinPrice(val);
    }
  };

  const handleMaxChange = (e) => {
    const inputValue = e.target.value;

    // Cho phép nhập số và xóa
    if (inputValue === "") {
      setMaxInputValue("");
      return;
    }

    // Chỉ lấy ký tự số
    const sanitized = inputValue.replace(/[^\d\.]/g, "");

    // Kiểm tra format hợp lệ (không có 2 dấu chấm liên tiếp)
    const parts = sanitized.split(".");
    if (parts.length > 1 && parts.some((part) => part === "")) {
      return; // Không cho phép format không hợp lệ
    }

    setMaxInputValue(sanitized);

    // Parse giá trị và validate
    const numericValue = parseFormattedNumber(sanitized);
    if (!isNaN(numericValue)) {
      let val = numericValue;

      // QUAN TRỌNG: Giới hạn không được vượt quá 100.000.000
      if (val > 100000000) {
        val = 100000000;
        setMaxInputValue("100.000.000");
      }

      if (val < minPrice + 1000000) val = minPrice + 1000000;
      setMaxPrice(val);
    }
  };

  const handleMinBlur = () => {
    if (minInputValue) {
      const numericValue = parseFormattedNumber(minInputValue)
      if (!isNaN(numericValue)) {
        let val = numericValue
        if (val < 5000000) val = 5000000
        if (val > maxPrice - 1000000) val = maxPrice - 1000000
        if (val > 100000000) val = 100000000
        
        setMinPrice(val)
        setMinInputValue(formatVND(val))
      }
    } else {
      setMinInputValue(formatVND(minPrice))
    }
  }

  const handleMaxBlur = () => {
    if (maxInputValue) {
      const numericValue = parseFormattedNumber(maxInputValue)
      if (!isNaN(numericValue)) {
        let val = numericValue
        if (val > 100000000) val = 100000000
        if (val < minPrice + 1000000) val = minPrice + 1000000
        
        setMaxPrice(val)
        setMaxInputValue(formatVND(val))
      }
    } else {
      setMaxInputValue(formatVND(maxPrice))
    }
  }

  const cardStyle = {
    border: "none",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  };

  return (
    <aside>
      {/* 💰 PRICE RANGE */}
      <Card className="mb-4" style={cardStyle}>
        <h5
          style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}
        >
          Khoảng giá
        </h5>

        {/* Thanh trượt */}
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
          {/* Thanh chọn */}
          <div
            style={{
              position: "absolute",
              height: "6px",
              backgroundColor: "#e23359ff",
              borderRadius: "3px",
              left: `${(minPrice / 100000000) * 100}%`,
              width: `${((maxPrice - minPrice) / 100000000) * 100}%`,
            }}
          ></div>

          {/* Thumb Min */}
          <div
            onMouseDown={() => startDrag("min")}
            style={{
              position: "absolute",
              top: "-7px",
              left: `calc(${(minPrice / 100000000) * 100}% - 8px)`,
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#e23359ff",
              boxShadow: "0 0 5px rgba(0,0,0,0.3)",
              cursor: "grab",
            }}
          ></div>

          {/* Thumb Max */}
          <div
            onMouseDown={() => startDrag("max")}
            style={{
              position: "absolute",
              top: "-7px",
              left: `calc(${(maxPrice / 100000000) * 100}% - 8px)`,
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#e23359ff",
              boxShadow: "0 0 5px rgba(0,0,0,0.3)",
              cursor: "grab",
            }}
          ></div>
        </div>

        {/* Nhập giá trực tiếp */}
        <Row className="mt-3 text-center">
          {/* MIN PRICE */}
          <Col xs={6}>
            <div style={{ position: "relative" }}>
              <Form.Control
                value={minInputValue}
                onChange={handleMinChange}
                onBlur={handleMinBlur}
                placeholder="5.000.000"
                className="no-spinner"
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "left",
                  paddingRight: "40px",
                  borderRadius: "20px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6b7280",
                  pointerEvents: "none",
                }}
              >
                VND
              </span>
            </div>
          </Col>

          {/* MAX PRICE */}
          <Col xs={6}>
            <div style={{ position: "relative" }}>
              <Form.Control
                max="100000000"
                value={maxInputValue}
                onChange={handleMaxChange}
                onBlur={handleMaxBlur}
                placeholder="100.000.000"
                className="no-spinner"
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "left",
                  paddingRight: "40px",
                  borderRadius: "20px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6b7280",
                  pointerEvents: "none",
                }}
              >
                VND
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ⭐ RATING */}
      <Card className="mb-4" style={cardStyle}>
        <h5 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
          Đánh giá
        </h5>
        {[5.0, 4.0, 3.0, 2.0, 1.0].map((r) => (
          <Form.Check
            key={r}
            type="checkbox"
            id={`rating-${r}`}
            label={
              <div className="d-flex align-items-center gap-1">
                <RatingStars rating={r} />
                <span style={{ fontSize: 14, color: "#6b7280" }}>{r}+</span>
              </div>
            }
            style={{ marginBottom: 8 }}
          />
        ))}
      </Card>

      {/* AMENITY CARD */}
      <Card className="mb-4" style={cardStyle}>
        <h5 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
          Tiện nghi
        </h5>

        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: "red" }}>Lỗi tải dữ liệu!</p>}

        {!loading && amenities.length > 0
          ? amenities.map((item) => (
              <Form.Check
                key={item.amenityID || item.id}
                type="checkbox"
                id={`amenity-${item.amenityID || item.id}`}
                label={item.name}
                style={{ marginBottom: 8, fontSize: 14 }}
              />
            ))
          : !loading && (
              <p style={{ fontSize: 14, color: "#6b7280" }}>
                (Không có tiện nghi)
              </p>
            )}
      </Card>

      {/* 🔄 RESET */}
      <Button
        variant="outline-danger"
        className="w-100 mt-3"
        style={{
          borderRadius: "8px",
          fontWeight: "600",
          padding: "12px",
          boxShadow: "0 2px 8px rgb(0,0,0,0.06)",
        }}
      >
        <i className="bi bi-arrow-clockwise" style={{ marginRight: "6px" }}></i>
        Đặt lại bộ lọc
      </Button>
    </aside>
  );
}
