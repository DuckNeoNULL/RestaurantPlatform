import React, { useEffect, useState, useMemo } from "react";
import axios from "../../../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import { Form } from "react-bootstrap";
import { Search } from "lucide-react";

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const STATUS = {
    0: { label: "PENDING", color: "#f39c12" },
    1: { label: "ACCEPTED", color: "#3498db" },
    2: { label: "REJECTED", color: "#e74c3c" },
    3: { label: "CONFIRMED", color: "#2ecc71" },
    4: { label: "DEPOSITED", color: "#9b59b6" },
    5: { label: "EXPIRED", color: "#7f8c8d" },
    6: { label: "CANCELLED", color: "#c0392b" },
    7: { label: "COMPLETED", color: "#27ae60" },
  };

  const fetchData = async () => {
    try {
      const res = await axios.get("/admin/bookings");
      setBookings(res.data.data);
      setLoading(false);
    } catch (error) {
      setErr("Lỗi tải dữ liệu");
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDetail = (id) => navigate(`/admin/bookings/${id}`);

  // Filter bookings based on search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;

    const query = searchQuery.toLowerCase().trim();
    return bookings.filter((b) => {
      const bookingID = String(b.bookingID || "").toLowerCase();
      const restaurantName = (
        b?.hall?.restaurant?.name || ""
      ).toLowerCase();
      const customerName = (b.customer?.user?.fullName || "").toLowerCase();
      const eventType = (b.eventType?.name || "").toLowerCase();
      const eventDate = new Date(b.eventDate)
        .toLocaleDateString("vi-VN")
        .toLowerCase();
      const totalAmount = String(b.totalAmount || "").toLowerCase();
      const statusLabel = (STATUS[b.status]?.label || "").toLowerCase();

      return (
        bookingID.includes(query) ||
        restaurantName.includes(query) ||
        customerName.includes(query) ||
        eventType.includes(query) ||
        eventDate.includes(query) ||
        totalAmount.includes(query) ||
        statusLabel.includes(query)
      );
    });
  }, [bookings, searchQuery]);

  return (
    <AdminLayout title="Quản lý đặt tiệc">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0 text-primary">Danh sách đặt tiệc</h2>
          {!loading && bookings.length > 0 && (
            <div style={{ width: "350px", position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  pointerEvents: "none",
                }}
              />
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo nhà hàng, khách hàng, loại tiệc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: "40px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9375rem",
                }}
              />
            </div>
          )}
        </div>

        {loading && <p className="text-muted text-center">Đang tải...</p>}
        {err && <p className="text-danger text-center">{err}</p>}

        {!loading && bookings.length === 0 && (
          <p className="text-muted text-center">Không có booking nào.</p>
        )}

        {searchQuery && !loading && bookings.length > 0 && (
          <div className="mb-3">
            <small className="text-muted">
              Tìm thấy <strong>{filteredBookings.length}</strong> kết quả
              {filteredBookings.length !== bookings.length &&
                ` trong tổng số ${bookings.length} đặt tiệc`}
            </small>
          </div>
        )}

        {!loading && filteredBookings.length > 0 && (
          <div className="card shadow-sm rounded-4 overflow-hidden">
            <div className="d-flex px-4 py-3 fw-semibold bg-light text-muted border-bottom">
              <div className="col-3">Nhà hàng</div>
              <div className="col-2">Ngày tiệc</div>
              <div className="col-2">Khách hàng</div>
              <div className="col-2">Loại tiệc</div>
              <div className="col-2 text-end">Tổng tiền</div>
              <div className="col-1 text-center">Chi tiết</div>
            </div>

            {filteredBookings.map((b, index) => (
              <div
                key={b.bookingID}
                className="d-flex px-4 py-3 border-bottom align-items-center"
                style={{ background: index % 2 ? "#fafafa" : "#fff" }}
              >
                <div className="col-3">
                  <div className="fw-semibold">
                    {b?.hall?.restaurant?.name || "?"}
                  </div>
                  <span
                    className="badge mt-1"
                    style={{
                      background: STATUS[b.status]?.color,
                      fontSize: "0.75rem",
                    }}
                  >
                    {STATUS[b.status]?.label}
                  </span>
                </div>

                <div className="col-2">
                  {new Date(b.eventDate).toLocaleDateString("vi-VN")}
                </div>

                <div className="col-2">
                  {b.customer?.user?.fullName || "?"}
                </div>

                <div className="col-2">{b.eventType?.name || "?"}</div>

                <div className="col-2 text-end fw-bold text-primary">
                  ₫{Number(b.totalAmount).toLocaleString("vi-VN")}
                </div>

                <div className="col-1 text-center">
                  <button
                    className="btn btn-sm btn-outline-primary rounded-pill"
                    onClick={() => openDetail(b.bookingID)}
                  >
                    Xem
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && bookings.length > 0 && filteredBookings.length === 0 && (
          <div className="card shadow-sm rounded-4">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">
                {searchQuery
                  ? "Không tìm thấy đặt tiệc nào phù hợp với từ khóa tìm kiếm."
                  : "Không có booking nào."}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
