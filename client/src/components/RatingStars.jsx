import React from "react";

/**
 * RatingStars
 * - Read-only by default (supports half-star display)
 * - If `onChange` is provided and `readOnly` is not true, becomes interactive (1..5 stars)
 */
export default function RatingStars({ rating = 0, onChange, readOnly = false, sizeClass = "fs-7" }) {
  const isInteractive = typeof onChange === "function" && !readOnly;

  if (isInteractive) {
    // Interactive: render 5 clickable stars (no half selection)
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = rating >= value;
          return (
            <i
              key={value}
              className={`bi ${filled ? "bi-star-fill" : "bi-star"} text-warning ${sizeClass} me-1`}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              aria-label={`Chọn ${value} sao`}
              onClick={() => onChange(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(value);
                }
              }}
            />
          );
        })}
      </div>
    );
  }

  // Read-only: preserve half-star visualization
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="d-flex align-items-center" aria-label={`${rating} sao`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <i key={`full-${i}`} className={`bi bi-star-fill text-warning ${sizeClass} me-1`}></i>
      ))}
      {hasHalfStar && (
        <i className={`bi bi-star-half text-warning ${sizeClass} me-1`}></i>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <i key={`empty-${i}`} className={`bi bi-star text-warning ${sizeClass} me-1`}></i>
      ))}
    </div>
  );
}
