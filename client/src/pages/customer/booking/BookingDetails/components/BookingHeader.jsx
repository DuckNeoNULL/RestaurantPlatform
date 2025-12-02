import React from "react";

export default function BookingHeader({ restaurantName, eventDate, statusText }) {
    return (
        <div
            className="booking-header"
            style={{
                background: "linear-gradient(135deg, #D81C45 0%, #D81C45 100%)",
                color: "#fefaf9",
            }}
        >
            <div className="row align-items-center">
                <div className="col-md-8">
                    <h1 className="booking-title" style={{ color: "#fefaf9" }}>
                        Chi tiết đặt tiệc
                    </h1>
                    <p className="booking-subtitle">
                        {restaurantName} • {eventDate}
                    </p>
                </div>
                <div className="col-md-4 text-end">
                    <span
                        className="status-badge"
                        style={{
                            backgroundColor: "#fefaf9",
                            color: "#D81C45",
                            border: "2px solid #D81C45",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "bold",
                        }}
                    >
                        {statusText}
                    </span>
                </div>
            </div>
        </div>
    );
}
