import React, { useState } from "react";
import Pagination from "../../../components/Pagination";
import RatingStars from "../../../components/RatingStars";

const ReviewList = ({ reviews, pageSize = 3 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const items = Array.isArray(reviews) ? reviews : [];
  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentReviews = items.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <h4 className="section-title mb-4" style={{ color: "#e11d48" }}>
        Đánh giá
      </h4>

      {items.length === 0 ? (
        <p className="text-muted">Chưa có đánh giá nào.</p>
      ) : (
        <>
          {currentReviews.map((review, idx) => {
            const name = review?.customerName || "Ẩn danh";
            const initial = name.charAt(0).toUpperCase();
            const rating = Number.isFinite(review?.rating) ? review.rating : 0;
            const dateStr = review?.createdAt
              ? new Date(review.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "";
            return (
              <div
                key={review?.id ?? idx}
                className="card mb-3 border-0 shadow-sm"
                style={{ borderRadius: "12px" }}
              >
                <div className="card-body d-flex align-items-start">
                  {/* Avatar chữ cái đầu */}
                  <div
                    className="me-3"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#e11d48",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {initial}
                  </div>

                  <div className="flex-grow-1">
                    <h5
                      className="card-title mb-1 reviewer-name"
                      style={{ fontSize: "1.1rem" }}
                    >
                      {name}
                    </h5>
                    <div className="d-flex align-items-center mb-2">
                      <RatingStars rating={rating} color="#e11d48" />
                      <span
                        className="text-muted ms-2"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {dateStr ? ` - ${dateStr}` : ""}
                      </span>
                    </div>
                    <p
                      className="card-text"
                      style={{ color: "#333", fontSize: "0.95rem" }}
                    >
                      {review?.comment || ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default ReviewList;