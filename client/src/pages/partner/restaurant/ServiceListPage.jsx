// File: src/pages/partner/Restaurant/ServiceListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import ServiceDetailPage from "./ServiceDetailPage";
import ServiceCreatePage from "./ServiceCreatePage";
import { useParams } from "react-router-dom";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";
import { useEventType } from "../../../hooks/useEventType";

export default function ServiceListPage({ readOnly = false, restaurant = null }) {
  const [activeService, setActiveService] = useState(null);
  const [creatingService, setCreatingService] = useState(false);
  const [activeEventType, setActiveEventType] = useState(null);
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);
  const { services, loadServicesByRestaurant, updateOneService, status, error } = useAdditionRestaurant();
  const { items: eventTypes, loadAll: loadAllEventTypes } = useEventType();
  const allowedEventTypeIDs = useMemo(() => {
    const ets = Array.isArray(restaurant?.eventTypes) ? restaurant.eventTypes : [];
    return ets.map((e) => e?.eventTypeID ?? e?.id).filter(Boolean);
  }, [restaurant]);
  const filteredEventTypes = useMemo(() => {
    if (!allowedEventTypeIDs || allowedEventTypeIDs.length === 0) return eventTypes || [];
    return (eventTypes || []).filter((et) => allowedEventTypeIDs.includes(et.eventTypeID ?? et.id));
  }, [eventTypes, allowedEventTypeIDs]);

  useEffect(() => {
    loadAllEventTypes().catch(() => {});
  }, [loadAllEventTypes]);

  useEffect(() => {
    if (restaurantID) {
      loadServicesByRestaurant(restaurantID).catch(() => {});
    }
  }, [restaurantID, loadServicesByRestaurant]);

  // === Thêm dịch vụ mới ===
  const handleAddService = (eventTypeID) => {
    if (readOnly) return;
    setActiveEventType(eventTypeID);
    setCreatingService(true);
  };

  // === Toggle trạng thái dịch vụ ===
  const handleToggleServiceStatus = async (id) => {
    if (readOnly) return;
    try {
      const current = (services || []).find((s) => (s.serviceID ?? s.id) === id);
      const newStatus = Number(current?.status) === 1 ? 0 : 1;
      await updateOneService({ id, payload: { status: newStatus } });
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.message || "Đổi trạng thái thất bại");
    }
  };

  return (
    <>
      {creatingService ? (
        readOnly ? (
          <div className="alert alert-secondary text-center mt-3">
            Chế độ chỉ xem: không thể tạo mới dịch vụ.
          </div>
        ) : (
          <ServiceCreatePage
            eventTypeID={activeEventType}
            eventTypes={filteredEventTypes}
            onBack={() => setCreatingService(false)}
          />
        )
      ) : activeService ? (
        <ServiceDetailPage
          service={activeService}
          eventTypes={filteredEventTypes}
          onBack={() => setActiveService(null)}
          readOnly={readOnly}
        />
      ) : (
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Danh sách dịch vụ theo loại sự kiện</h3>
          </div>
          {(filteredEventTypes || []).map((type) => {
            const servicesByType = (services || []).filter(
              (s) => Number(s.eventTypeID) === Number(type.eventTypeID ?? type.id)
            );

            return (
              <div
                key={type.eventTypeID}
                className="border rounded-4 p-3 mb-4 bg-light shadow-sm"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex flex-column">
                    <div className="mb-1 fw-bold" style={{ maxWidth: "250px" }}>
                      {type.name}
                    </div>
                  </div>

                  {!readOnly && (
                    <button
                      className="btn btn-success text-white"
                      onClick={() => handleAddService(type.eventTypeID ?? type.id)}
                    >
                      + Thêm dịch vụ
                    </button>
                  )}
                </div>

                <div className="row">
                  {servicesByType.length > 0 ? (
                    servicesByType.map((s) => (
                      <div
                        key={s.serviceID ?? s.id}
                        className="col-md-4 mb-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => setActiveService(s)}
                      >
                        <div className="card h-100 shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title fw-bold">{s.name}</h5>
                            <p className="card-text mb-1">
                              Giá: {(Number(s.price) || 0).toLocaleString("vi-VN")} ₫
                            </p>
                            <p className="card-text mb-2">Đơn vị: {s.unit}</p>

                            <div
                              className={`badge ${
                                Number(s.status) === 1 ? "bg-success" : "bg-secondary"
                              }`}
                              style={{
                                cursor: readOnly ? "default" : "pointer",
                                opacity: readOnly ? 0.6 : 1,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (readOnly) return;
                                const confirmMsg =
                                  Number(s.status) === 1
                                    ? "Bạn có chắc chắn muốn ngừng bán dịch vụ này?"
                                    : "Bạn có chắc chắn muốn kích hoạt dịch vụ này?";
                                if (window.confirm(confirmMsg)) {
                                  handleToggleServiceStatus(s.serviceID ?? s.id);
                                }
                              }}
                            >
                              {Number(s.status) === 1
                                ? "Đang hoạt động"
                                : "Ngừng bán"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted fst-italic">
                      Chưa có dịch vụ nào cho loại này
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
