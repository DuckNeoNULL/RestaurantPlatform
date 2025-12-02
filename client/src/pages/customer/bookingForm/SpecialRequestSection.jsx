import useBooking from "../../../hooks/useBooking";

const SpecialRequestSection = () => {
  const { booking, setBookingField } = useBooking();
  const value = booking?.bookingInfo?.specialRequest || "";
  return (
    <div className="mt-3">
      <label className="fw-semibold mb-1">Yêu cầu đặc biệt</label>
      <textarea
        style={{ width: "100%" }}
        name="specialRequest"
        placeholder="Các yêu cầu đặc biệt"
        rows={3}
        className="w-full p-2 border rounded-lg"
        value={value}
        onChange={(e) => setBookingField("specialRequest", e.target.value)}
      />
    </div>
  );
};

export default SpecialRequestSection;
