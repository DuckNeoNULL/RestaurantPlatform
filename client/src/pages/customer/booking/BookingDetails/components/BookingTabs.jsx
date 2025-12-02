import React from "react";

export default function BookingTabs({ activeTab, setActiveTab, isApproved, paymentCompleted }) {
    return (
        <nav className="booking-nav">
            <div className="nav nav-tabs" id="bookingTabs" role="tablist">
                <button
                    className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                    style={{
                        backgroundColor: "#fefaf9",
                        color: "#D81C45",
                        borderColor: "#D81C45",
                    }}
                >
                    <i className="fas fa-info-circle"></i> Tổng quan
                </button>
                {(isApproved || paymentCompleted) && (
                    <>
                        <button
                            className={`nav-link ${activeTab === "contract" ? "active" : ""}`}
                            onClick={() => setActiveTab("contract")}
                            style={{
                                backgroundColor: "#fefaf9",
                                color: "#D81C45",
                                borderColor: "#D81C45",
                            }}
                        >
                            <i className="fas fa-file-contract"></i> Hợp đồng
                        </button>
                        <button
                            className={`nav-link ${activeTab === "payments" ? "active" : ""}`}
                            onClick={() => setActiveTab("payments")}
                            style={{
                                backgroundColor: "#fefaf9",
                                color: "#D81C45",
                                borderColor: "#D81C45",
                            }}
                        >
                            <i className="fas fa-credit-card"></i> Lịch sử thanh toán
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
