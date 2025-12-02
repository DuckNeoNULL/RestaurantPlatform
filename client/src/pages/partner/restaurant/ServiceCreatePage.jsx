// File: src/pages/partner/Restaurant/ServiceCreatePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";
import { useEventType } from "../../../hooks/useEventType";

export default function ServiceCreatePage({ onBack, eventTypeID: initialEventTypeID, eventTypes: allowedEventTypes = [] }) {
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);
  const { createOneService, status } = useAdditionRestaurant();
  const { items: allEventTypes, loadAll: loadAllEventTypes } = useEventType();
  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "",
    eventTypeID: initialEventTypeID || "",
    imageURL: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load event types once
    loadAllEventTypes().catch(() => {});
  }, [loadAllEventTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantID) return;
    try {
      setSubmitting(true);
      const payload = {
        restaurantID,
        name: String(form.name || "").trim(),
        price: Number(form.price) || 0,
        unit: String(form.unit || "").trim(),
        eventTypeID: form.eventTypeID ? Number(form.eventTypeID) : null,
        imageURL: form.imageURL || null,
        status: 1,
      };
      await createOneService(payload);
      onBack();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err?.message || err || "Tạo dịch vụ thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Thêm dịch vụ mới</h4>
        <Button
          variant="light"
          className="me-2"
          onClick={onBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </Button>
      </div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Tên dịch vụ</Form.Label>
          <Form.Control
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Giá</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Đơn vị</Form.Label>
          <Form.Control
            name="unit"
            value={form.unit}
            onChange={handleChange}
            disabled={submitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Loại sự kiện</Form.Label>
          <Form.Select
            name="eventTypeID"
            value={form.eventTypeID}
            onChange={handleChange}
            required
            disabled={submitting}
          >
            <option value="">-- Chọn loại sự kiện --</option>
            {((allowedEventTypes && allowedEventTypes.length > 0) ? allowedEventTypes : (allEventTypes || [])).map((et) => (
              <option key={et.eventTypeID ?? et.id} value={et.eventTypeID ?? et.id}>
                {et.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button type="submit" variant="success" className="text-white" disabled={submitting || !restaurantID}>
          <FontAwesomeIcon icon={faPlus} /> {submitting ? "Đang tạo..." : "Thêm dịch vụ"}
        </Button>
      </Form>
    </Card>
  );
}