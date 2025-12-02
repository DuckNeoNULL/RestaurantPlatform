import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { usePromotion } from "../../../hooks/usePromotion";
import api from "../../../api/axios";

export default function PromotionCreatePage({ onBack }) {
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);
  const { createOne, loadByRestaurant, status } = usePromotion();

  const [form, setForm] = useState({
    name: "",
    description: "",
    minTable: 0,
    discountType: 0,
    discountValue: "",
    startDate: "",
    endDate: "",
  });

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [selectedServiceIDs, setSelectedServiceIDs] = useState([]);

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Reset selected services if switching away from Free type
    if (name === "discountType" && Number(value) !== 1 && selectedServiceIDs.length) {
      setSelectedServiceIDs([]);
    }
  };

  // Load services of the restaurant to allow selecting free services
  useEffect(() => {
    const fetchServices = async () => {
      if (!restaurantID) return;
      setServicesLoading(true);
      setServicesError(null);
      try {
        const res = await api.get(`/services/restaurant/${restaurantID}`);
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setServices(list);
      } catch (err) {
        setServicesError(err?.message || "Lỗi tải danh sách dịch vụ");
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, [restaurantID]);

  const toggleService = (id) => {
    setSelectedServiceIDs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantID) {
      alert("Không tìm thấy restaurantID từ URL. Không thể tạo khuyến mãi.");
      return;
    }

    const discountType = Number(form.discountType) === 1 ? "Free" : "Percent";
    const payload = {
      restaurantID,
      name: (form.name || "").trim(),
      description: (form.description || "").trim(),
      minTable: Number(form.minTable) || 0,
      discountPercentage: Number(form.discountValue) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      discountType,
      serviceIDs: discountType === "Free" ? selectedServiceIDs : [],
    };

    if (!payload.name) {
      alert("Vui lòng nhập tên khuyến mãi.");
      return;
    }
    if (!payload.startDate || !payload.endDate) {
      alert("Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (discountType === "Percent" && (payload.discountPercentage <= 0 || payload.discountPercentage > 100)) {
      alert("Giá trị giảm phần trăm phải trong khoảng 1-100.");
      return;
    }
    if (discountType === "Free" && (!Array.isArray(payload.serviceIDs) || payload.serviceIDs.length === 0)) {
      alert("Vui lòng chọn ít nhất một dịch vụ miễn phí.");
      return;
    }

    try {
      setSaving(true);
      await createOne(payload);
      try { if (restaurantID) await loadByRestaurant(restaurantID); } catch {}
      alert("Tạo khuyến mãi thành công!");
      if (onBack) onBack();
    } catch (err) {
      alert(`Tạo khuyến mãi thất bại: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5>Tạo khuyến mãi mới</h5>
        <Button variant="secondary" onClick={onBack}>
          ← Quay lại
        </Button>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tên khuyến mãi</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Số bàn tối thiểu</Form.Label>
                <Form.Control
                  type="number"
                  name="minTable"
                  value={form.minTable}
                  onChange={handleChange}
                  min={0}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại giảm giá</Form.Label>
                <Form.Select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                >
                  <option value={0}>Phần trăm</option>
                  <option value={1}>Miễn phí dịch vụ</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              {Number(form.discountType) === 0 && (
                <Form.Group>
                  <Form.Label>Giá trị giảm (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="discountValue"
                    value={form.discountValue}
                    onChange={handleChange}
                    min={0}
                    max={100}
                  />
                </Form.Group>
              )}
            </Col>
          </Row>

          {Number(form.discountType) === 1 && (
            <Form.Group className="mb-3">
              <Form.Label>Chọn dịch vụ miễn phí</Form.Label>
              {servicesLoading ? (
                <div>Đang tải danh sách dịch vụ...</div>
              ) : servicesError ? (
                <div className="text-danger">{servicesError}</div>
              ) : services.length === 0 ? (
                <div>Nhà hàng chưa có dịch vụ nào.</div>
              ) : (
                <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
                  {services.map((s) => (
                    <Form.Check
                      key={s.serviceID}
                      type="checkbox"
                      id={`svc-${s.serviceID}`}
                      label={`${s.name} ${s.unit ? `(${s.unit})` : ''} — ${Number(s.price) || 0}đ`}
                      checked={selectedServiceIDs.includes(s.serviceID)}
                      onChange={() => toggleService(s.serviceID)}
                      className="mb-1"
                    />)
                  )}
                </div>
              )}
            </Form.Group>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ngày bắt đầu</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ngày kết thúc</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end">
            <Button type="submit" variant="primary" disabled={saving || status === "loading"}>
              {saving || status === "loading" ? "Đang tạo..." : "Lưu khuyến mãi"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}