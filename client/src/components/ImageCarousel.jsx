import React from "react";
export default function ImageCarousel({ id, images }) {
    return (
        <div id={id} className="carousel slide" data-bs-ride="false">
            <div className="carousel-inner">
                {images.map((img, i) => (
                    <div
                        key={i}
                        className={`carousel-item ${i === 0 ? "active" : ""}`}
                    >
                        <img src={img} className="d-block mx-auto" alt={`slide ${i}`} />
                    </div>
                ))}
            </div>

            <div className="carousel-indicators">
                {images.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        data-bs-target={`#${id}`}
                        data-bs-slide-to={i}
                        className={i === 0 ? "active" : ""}
                        aria-current={i === 0 ? "true" : undefined}
                        aria-label={`Slide ${i + 1}`}
                    ></button>
                ))}
            </div>

            <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#${id}`}
                data-bs-slide="prev"
            >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#${id}`}
                data-bs-slide="next"
            >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
}