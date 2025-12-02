import React, { useState } from "react";
import useBooking from "../../../hooks/useBooking";
import useAuth from "../../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { getEventTypes } from "../../../services/eventTypeAndAmenityService";

const SubmitBookingButton = () => {
  const { submit, recalcPrice, booking } = useBooking();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      recalcPrice();
      const restaurantId = location?.state?.restaurantId;
      const hallId = location?.state?.hallId || booking?.bookingInfo?.hallID;

      // Derive customerID
      const customerID = user?.customerID || user?.userID || user?.id || null;

      // Map eventType name -> eventTypeID via service
      let eventTypeID = booking?.bookingInfo?.eventTypeID || null;
      try {
        const ets = await getEventTypes();
        const name = (booking?.bookingInfo?.eventType || "").trim().toLowerCase();
        const found = ets.find((et) => String(et.name || "").trim().toLowerCase() === name);
        if (found) eventTypeID = found.eventTypeID || found.id;
      } catch { }

      // Ensure menuID
      const menuID = booking?.menu?.menuID || booking?.menu?.id || null;

      // Promotion IDs (only send numeric IDs to backend)
      let promotionIDs = [];
      if (booking?.appliedPromotion) {
        const pid = booking.appliedPromotion.promotionID ?? booking.appliedPromotion.id;
        const numId = Number(pid);
        if (Number.isInteger(numId) && !Number.isNaN(numId)) promotionIDs = [numId];
      }

      // Map services to server expected { serviceID, quantity }
      const servicesForServer = (booking?.services || []).map((s) => ({
        serviceID: s.serviceID || s.id,
        quantity: s.quantity || 1,
      }));

      // Dish IDs: prefer bookingInfo.dishIDs, fallback to derive from dishes array
      let dishIDs = Array.isArray(booking?.bookingInfo?.dishIDs) ? booking.bookingInfo.dishIDs : [];
      if (!dishIDs.length) {
        dishIDs = (booking?.dishes || [])
          .map(d => d.dishID ?? d.id)
          .filter(id => Number.isInteger(Number(id)))
          .map(Number);
      }
      // ensure uniqueness
      dishIDs = Array.from(new Set(dishIDs));

      // Provide default times if not yet collected in UI to satisfy backend validation
      const startTime = booking?.bookingInfo?.startTime || "18:00:00";
      const endTime = booking?.bookingInfo?.endTime || "22:00:00";

      // Build EXACT server payload shape to avoid unknown-column errors
      const extra = {
        customerID,
        eventTypeID,
        hallID: hallId,
        menuID,
        eventDate: booking?.bookingInfo?.date,
        startTime,
        endTime,
        tableCount: booking?.bookingInfo?.tables,
        specialRequest: booking?.bookingInfo?.specialRequest || "",
        dishIDs,
        services: servicesForServer,
        promotionIDs,
      };

      console.log('Booking data to send:', extra);

      // Basic client-side validations
      const missing = [];
      if (!customerID) missing.push("customerID");
      if (!eventTypeID) missing.push("eventTypeID");
      if (!extra.hallID) missing.push("hallID");
      if (!menuID) missing.push("menuID");
      if (!extra.eventDate) missing.push("eventDate");
      if (!extra.tableCount || Number(extra.tableCount) <= 0) missing.push("tableCount");
      if (!startTime || !endTime) missing.push("startTime/endTime");
      if (missing.length) {
        throw new Error(`Thiếu thông tin bắt buộc: ${missing.join(", ")}`);
      }
      await submit(extra);
      navigate("/customer/bookings");
    } catch (err) {
      alert(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-end my-3">
      <button
        type="button"
        className="border-0 text-white px-3 py-2 fw-medium"
        disabled={loading}
        onClick={handleSubmit}
        style={{ borderRadius: "0.375rem", backgroundColor: "#e11d48" }}
      >
        {loading ? "Đang gửi..." : "Gửi yêu cầu đặt chỗ"}
      </button>
    </div>

  );
};

export default SubmitBookingButton;