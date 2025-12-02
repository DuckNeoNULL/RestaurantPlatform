import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageCarousel from "../../../components/ImageCarousel";
import SearchSectionHall from "../../../components/searchbar/SearchSectionHall";
import { useSearchForm } from "../../../hooks/useSearchForm";
import { useHall } from "../../../hooks/useHall";

export default function HallList({ restaurant, onSelectHall }) {
  const navigate = useNavigate();
  const { state: searchState } = useSearchForm();
  const { availableHalls, loadAvailable, status, error } = useHall();
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load available halls when restaurant changes (initial load without filters)
  useEffect(() => {
    if (restaurant?.restaurantID) {
      loadAvailable({ restaurantId: restaurant.restaurantID });
    }
  }, [restaurant?.restaurantID, loadAvailable]);

  // Update filtered halls when available halls data changes
  useEffect(() => {
    setFilteredHalls(Array.isArray(availableHalls) ? availableHalls : []);
  }, [availableHalls]);

  const handleSearch = async (searchData) => {
    console.log("Search data:", searchData);

    try {
      // Build params for API call - match server expectations
      const params = {};

      // Always include restaurantId
      if (restaurant?.restaurantID) {
        params.restaurantId = restaurant.restaurantID;
      }

      // Add date if provided
      if (searchData.date && searchData.date.trim() !== '') {
        params.date = searchData.date;
      }

      // Add time slots (startTime and endTime are already set by TimeSelect)
      if (searchData.startTime && searchData.endTime) {
        params.startTime = searchData.startTime;
        params.endTime = searchData.endTime;
      }

      if (searchData.tables) {
        params.maxTable = searchData.tables;
      }

      // Note: tables and eventType filtering should be done on server side
      // but for now, we'll send them and let server handle if implemented
      // searchData.tables && (params.tables = searchData.tables);
      // searchData.eventType && (params.eventType = searchData.eventType);

      await loadAvailable(params);
      console.log("Available halls loaded with filters");
      setHasSearched(true);
    } catch (err) {
      console.error("Error loading available halls:", err);
    }
  };

  const handleRequestBooking = (hall) => {
    // Validate that all search information is filled
    console.log(searchState);
    const { date, tables, eventType } = searchState || {};
    if (!date || !tables || !eventType) {
      alert("Vui lòng điền đầy đủ thông tin tìm kiếm (ngày, số bàn tối đa, loại sự kiện) trước khi gửi yêu cầu đặt chỗ.");
      return;
    }

    navigate("/bookingForm", {
      state: {
        restaurant: restaurant,
        hall: hall, // Send full hall object instead of just hallId
        searchData: searchState,
      },
    });
  };

  return (
    <div>
      <h4 className="section-title">Danh sách sảnh</h4>
      <SearchSectionHall noOverlap onSearch={handleSearch} restaurantID={restaurant?.restaurantID} />
      {hasSearched && (
        <div className="mt-4">
        {status === 'loading' && (
          <div className="text-center text-muted">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Đang tải danh sách sảnh...</p>
          </div>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">
            Lỗi khi tải danh sách sảnh: {error}
          </div>
        )}
        {status === 'succeeded' && Array.isArray(filteredHalls) && filteredHalls.length > 0 ? (
          filteredHalls.map((hall) => (
        <div key={hall.id} className="card mb-4"
          style={{
            boxShadow: "0 4px 6px rgba(0,0,0,0.25)",
            border: "none"
          }}
        >
          <div className="row g-0 p-3">
            <div className="col-md-3 d-flex align-items-center">
              <img
                src={hall.images[0]?.imageURL}
                alt={hall.name}
                className="img-fluid rounded w-100"
                style={{ height: "180px", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-9">
              <div className="card-body py-0">
                <h5
                  className="card-title"
                  style={{ color: "#e11d48", fontWeight: "bold", cursor: "pointer" }}
                  data-bs-toggle="modal"
                  data-bs-target="#hallModal"
                  onClick={() => onSelectHall(hall)}
                >
                  {hall.name}
                </h5>
                <p className="card-text mb-1">Diện tích: <strong>{hall.area} m²</strong></p>
                <p className="card-text mb-1">Sức chứa: <strong>{hall.capacity} khách</strong></p>
                <p className="card-text mb-1">Giá: <strong>{hall.price.toLocaleString()} VND</strong></p>
              </div>

              <div className="card-footer bg-transparent border-0 text-end">
                <button
                  className="requestBtn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRequestBooking(hall);
                  }}
                >
                  Gửi yêu cầu đặt chỗ
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
        ) : status === 'succeeded' ? (
          <div className="text-center text-muted mt-4">Không có sảnh phù hợp với tiêu chí tìm kiếm</div>
        ) : null}
      </div>
      )}

      {/* Modal ảnh sảnh */}
      <div
        className="modal fade"
        id="hallModal"
        tabIndex="-1"
        aria-labelledby="hallModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header" style={{ color: "#fafef9" }}>
              <h5 className="modal-title" id="hallModalLabel" style={{ color: "#fafef9" }}>
                {restaurant.selectedHall?.name}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body px-4">
              {restaurant.selectedHall && (
                <div className="row">
                  <div className="col-md-6">
                    <ImageCarousel
                      id={`hallCarousel-${restaurant.selectedHall.id}`}
                      images={restaurant.selectedHall.images.map(img => img.imageURL)}
                    />
                  </div>
                  <div className="col-md-6">
                    <p style={{ textAlign: "justify" }}>
                      {restaurant.selectedHall.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}