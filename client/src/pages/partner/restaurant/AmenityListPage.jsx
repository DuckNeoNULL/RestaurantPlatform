import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEventType } from "../../../hooks/useEventType";
import { useRestaurant } from "../../../hooks/useRestaurant";

export default function AmenityListPage({ restaurant, readOnly = false, onUpdated, saveOnChange = false }) {
  const { amenities, amenitiesLoading, amenitiesError, loadAmenities } = useEventType();
  const { updateOne, status: restaurantStatus } = useRestaurant();

  const initialSelected = useMemo(() => {
    const list = restaurant?.amenities || [];
    return list.map((a) => a.amenityID);
  }, [restaurant]);

  const [selected, setSelected] = useState(initialSelected);
  const [isEditing, setIsEditing] = useState(false);
  const [savingIds, setSavingIds] = useState(() => new Set());

  useEffect(() => {
    // keep selected in sync if restaurant prop changes
    setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    loadAmenities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleAmenity = async (amenityID) => {
    const canEdit = saveOnChange ? true : isEditing;
    if (!canEdit || readOnly || !restaurant?.restaurantID) return;
    // compute next selection optimistically
    const nextSelected = selected.includes(amenityID)
      ? selected.filter((id) => id !== amenityID)
      : [...selected, amenityID];

    if (saveOnChange) {
      // optimistic UI update + persist immediately
      setSelected(nextSelected);
      setSavingIds((prev) => new Set(prev).add(amenityID));
      try {
        const updated = await updateOne({ id: restaurant.restaurantID, payload: { amenities: nextSelected } });
        if (typeof onUpdated === "function") onUpdated(updated, { added: [], removed: [], selected: nextSelected });
      } catch (e) {
        // revert on failure
        setSelected(selected);
        alert(e.message || "Cập nhật tiện ích thất bại");
      } finally {
        setSavingIds((prev) => {
          const copy = new Set(prev);
          copy.delete(amenityID);
          return copy;
        });
      }
    } else {
      // edit locally, save later
      setSelected(nextSelected);
    }
  };

  const handleSave = async () => {
    if (readOnly || !restaurant?.restaurantID) return;
    try {
      const updated = await updateOne({ id: restaurant.restaurantID, payload: { amenities: selected } });
      setIsEditing(false);
      // compute changes to send back to parent (added/removed IDs)
      const added = selected.filter((id) => !initialSelected.includes(id));
      const removed = initialSelected.filter((id) => !selected.includes(id));
      if (typeof onUpdated === "function") onUpdated(updated, { added, removed, selected });
    } catch (e) {
      alert(e.message || "Cập nhật tiện ích thất bại");
    }
  };

  const handleCancel = () => {
    if (readOnly) return;
    setSelected(initialSelected);
    setIsEditing(false);
  };

  return (
    <div className="p-3">
      <Card className="shadow-sm border-0 rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Tiện ích của nhà hàng</h4>

          {!readOnly && !saveOnChange && (
            !isEditing ? (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
              </Button>
            ) : (
              <div className="d-flex gap-2">
                <Button variant="success" onClick={handleSave} disabled={restaurantStatus === 'loading'}>
                  {restaurantStatus === 'loading' ? (
                    <><Spinner size="sm" /> Đang lưu...</>
                  ) : (
                    <><FontAwesomeIcon icon={faSave} /> Lưu</>
                  )}
                </Button>
                <Button variant="secondary" onClick={handleCancel}>
                  <FontAwesomeIcon icon={faTimes} /> Hủy
                </Button>
              </div>
            )
          )}
        </div>

        <p className="text-muted mb-4">
          {readOnly
            ? "Chế độ chỉ xem: bạn chỉ có thể xem các tiện ích được kích hoạt."
            : "Chọn các tiện ích mà nhà hàng của bạn đang cung cấp."}
        </p>

        {amenitiesError && (
          <Alert variant="warning" className="mb-3">Không tải được danh sách tiện ích.</Alert>
        )}

        <Row>
          {amenities.map((amenity) => {
            const isChecked = selected.includes(amenity.amenityID);
            const isActive = amenity.status === 1 || amenity.status === true || amenity.status === undefined;

            return (
              <Col key={amenity.amenityID} md={6} lg={4} className="mb-3">
                <Card
                  className={`p-3 border-0 shadow-sm rounded-3 d-flex flex-row align-items-center justify-content-between ${
                    !isActive ? "opacity-50" : ""
                  }`}
                  style={{
                    cursor:
                      isEditing && !readOnly ? "pointer" : "default",
                  }}
                  onClick={() => handleToggleAmenity(amenity.amenityID)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Form.Check
                      type="checkbox"
                      checked={isChecked}
                      disabled={(saveOnChange ? false : !isEditing) || readOnly || !isActive || savingIds.has(amenity.amenityID)}
                      onChange={() => handleToggleAmenity(amenity.amenityID)}
                    />
                    <span className="fw-semibold">{amenity.name}</span>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
        {amenitiesLoading && (
          <div className="text-muted fst-italic">Đang tải danh sách tiện ích...</div>
        )}
        {amenities.length === 0 && !amenitiesLoading && (
          <p className="text-muted fst-italic text-center mt-3">
            Chưa có tiện ích nào được tạo bởi quản trị viên.
          </p>
        )}
      </Card>
    </div>
  );
}
