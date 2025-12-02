import React from "react";
import { GeoAltFill, PeopleFill } from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom"; // ✅ Thêm để link qua detail
import RatingStars from "../../../components/RatingStars";
import "../../../styles/ProductCardStyle.css";

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN").format(
    Number(String(n).replace(/[^\d]/g, ""))
  );

const priceRangeFromPrice = (priceStr) => {
  const base = Number(String(priceStr).replace(/[^\d]/g, "")) || 0;
  if (!base) return null;
  const min = Math.round(base * 0.9);
  return { min };
};

const tablesFromCapacity = (capacityStr) => {
  const match = String(capacityStr || "").match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    const lo = Math.round(Number(match[1]) / 10);
    const hi = Math.round(Number(match[2]) / 10);
    return `${lo}–${hi} bàn`;
  }
  return capacityStr ? `${capacityStr} bàn` : "—";
};

export default function ProductCard({ venue }) {
  const promo =
    venue.promotion ||
    (Array.isArray(venue.promotions) && venue.promotions.length
      ? venue.promotions[0]
      : "Mã giảm đến 200k có trong ví của bạn");

  const range = venue.priceMin
    ? { min: venue.priceMin }
    : priceRangeFromPrice(venue.price);

  // Tính capacity từ halls nếu có, hoặc dùng maxCapacity đã được tính sẵn
  const getCapacity = () => {
    if (venue.maxCapacity) return venue.maxCapacity;
    if (venue.halls && Array.isArray(venue.halls) && venue.halls.length > 0) {
      const maxTable = Math.max(...venue.halls.map((h) => Number(h.maxTable) || 0));
      return maxTable > 0 ? maxTable : null;
    }
    return venue.capacityTables || venue.capacity || null;
  };
  
  const capacity = getCapacity();

  return (
    <div
      className="card mb-4"
      style={{
        border: "none",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="row g-0">
        {/* Ảnh full, bỏ hover effect */}
        <div className="col-md-4">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-100 h-100"
            style={{ objectFit: "cover", borderRadius: "12px 0 0 12px" }}
          />
        </div>

        {/* Nội dung */}
        <div className="col-md-8">
          <div className="card-body d-flex flex-column h-100 p-3">
            {/* Header + rating */}
            <div className="d-flex justify-content-between align-items-start mb-2">
              {/* ✅ Link sang trang detail */}
              <Link
                to={`/restaurant/${venue.id}`} // <-- Link qua detail
                style={{
                  textDecoration: "none",
                  color: "#222",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
                className="venue-link-hover"
              >
                {venue.name}
              </Link>

              {/* ✅ Rating Stars */}
              {venue.rating != null && <RatingStars rating={venue.rating} />}
            </div>

            {/* Địa điểm */}
            {venue.location && (
              <div className="mb-2 text-muted" style={{ fontSize: "14px" }}>
                <GeoAltFill className="me-1" />
                {venue.location}
              </div>
            )}

            {/* Sức chứa */}
            <div className="mb-2">
              <PeopleFill className="me-1 text-secondary" />
              <span className="text-secondary me-1">Sức chứa:</span>
              <strong>
                {capacity ? `${capacity} bàn` : "—"}
              </strong>
            </div>

            {/*Badge khuyến mãi*/}
            {promo && (
              <div
                className="mt-2 d-flex align-items-center"
                style={{
                  background: "#ffc5d1ff", // pastel nhẹ
                  color: "#c73669ff",
                  fontSize: "14px",
                  fontWeight: "500",
                  borderRadius: "999px",
                  padding: "6px 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  maxWidth: "100%",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  width: "fit-content",
                  gap: "8px",
                }}
              >
                {/* Bọc icon vào nền tròn để khỏi bị chìm */}
                <div
                  style={{
                    background: "#e23359ff",
                    padding: "5px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="https://ik.imagekit.io/tvlk/image/imageResource/2024/11/26/1732635982113-3a6b6412ef32ce9edf2f58095a8954b4.png?tr=h-24,q-75,w-24"
                    alt="promo"
                    style={{ width: "14px", height: "14px" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>

                {/* Nội dung khuyến mãi */}
                {promo}
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto">
              <div className="d-flex justify-content-between align-items-center mt-3">
                {/* Giá chỉ từ */}
                {range ? (
                  <div className="d-flex flex-column">
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        fontWeight: "500",
                        marginBottom: "2px",
                      }}
                    >
                      Giá chỉ từ
                    </span>
                    <div className="d-flex align-items-baseline gap-1">
                      <span
                        style={{
                          color: "#e23359ff",
                          fontSize: "22px",
                          fontWeight: "700",
                          lineHeight: "1",
                        }}
                      >
                        {formatVND(range.min)}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#b24767ff",
                          fontWeight: "600",
                        }}
                      >
                        VND
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="m-0 fw-medium">Liên hệ báo giá</p>
                )}

                <Link
                  to={`/restaurant/${venue.id}`}
                  style={{
                    background: "#e23359ff", // pastel đậm hơn promo 1 xíu
                    color: "#fff", // chữ nổi bật hơn
                    border: "none",
                    padding: "8px 18px", // to hơn xíu
                    fontSize: "15px", // chữ to hơn
                    fontWeight: "700", // in đậm
                    borderRadius: "8px",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "0.2s ease-in-out",
                  }}
                  className="detail-btn-hover"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
