import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Button, Row, Col, Badge, Alert, Image } from "react-bootstrap";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";
import { useParams } from "react-router-dom";
import { uploadImageToCloudinary } from "../../../services/uploadServices";

export default function MenuCreatePage({ onBack, restaurantID: restaurantIdProp }) {
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(restaurantIdProp || paramRestaurantID || paramId) || undefined, [restaurantIdProp, paramId, paramRestaurantID]);

  const {
    dishes,
    dishCategories,
    status,
    error,
    loadDishesByRestaurant,
    loadDishCategoriesByRestaurant,
    createOneMenu,
  } = useAdditionRestaurant();

  const [form, setForm] = useState({
    name: "",
    price: "",
    dishes: [], // dishIDs
    status: 1, // bit 1/0
    imageURL: "",
  });
  const [warning, setWarning] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!restaurantID) return;
    // load dishes and categories in parallel
    loadDishCategoriesByRestaurant(restaurantID).catch(() => {});
    loadDishesByRestaurant(restaurantID).catch(() => {});
  }, [restaurantID, loadDishCategoriesByRestaurant, loadDishesByRestaurant]);

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, imageURL: url }));
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`Tải ảnh thất bại: ${err?.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const grouped = useMemo(() => {
    const cats = (dishCategories || [])
      .filter((c) => Number(c.status) === 1)
      .slice()
      .sort((a, b) => Number(b.status) - Number(a.status)); // active first
    const byCat = {};
    (dishes || [])
      .filter((d) => Number(d.status) === 1)
      .forEach((d) => {
        const key = d.categoryID;
        if (!byCat[key]) byCat[key] = [];
        byCat[key].push(d);
      });
    return { cats, byCat };
  }, [dishCategories, dishes]);

  const toggleDish = (id) => {
    setForm((prev) => ({
      ...prev,
      dishes: prev.dishes.includes(id)
        ? prev.dishes.filter((d) => d !== id)
        : [...prev.dishes, id],
    }));
  };

  const validateRequired = () => {
    const missing = (grouped.cats || []).reduce((acc, cat) => {
      const inCat = (form.dishes || [])
        .map((id) => (dishes || []).find((d) => d.dishID === id))
        .filter((d) => d && d.categoryID === cat.categoryID);
      const need = Number(cat.requiredQuantity) || 0;
      if (inCat.length < need) acc.push(`${cat.name} (thiếu ${need - inCat.length} món)`);
      return acc;
    }, []);
    if (missing.length) {
      setWarning(`Chưa đủ món trong các nhóm: ${missing.join(", ")}`);
      return false;
    }
    setWarning("");
    return true;
  };

  const handleSubmit = async () => {
    if (!restaurantID) return alert("Thiếu restaurantID");
    if (!validateRequired()) return;
    try {
      setSaving(true);
      await createOneMenu({
        restaurantID,
        name: form.name?.trim(),
        price: Number(form.price) || 0,
        status: Number(form.status) === 1 ? 1 : 0,
        imageURL: form.imageURL,
        dishIDs: form.dishes,
      });
      onBack?.();
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(`Tạo thực đơn thất bại: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <Button variant="secondary" onClick={onBack} className="mb-3">
        ← Quay lại
      </Button>

      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4">Thêm Thực đơn mới</h3>

          {(status === "loading") && (
            <div className="alert alert-info py-2">Đang tải danh sách món và nhóm món…</div>
          )}
          {error && (
            <div className="alert alert-danger py-2">Lỗi: {String(error)}</div>
          )}
          {warning && (
            <Alert variant="warning" className="py-2">⚠️ {warning}</Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên thực đơn</Form.Label>
              <Form.Control
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá / bàn (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                  >
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Ngừng hoạt động</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh menu</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageFile} disabled={uploading} />
              {form.imageURL ? (
                <div className="mt-3">
                  <Image src={form.imageURL} alt="preview" fluid rounded style={{ maxHeight: 200, objectFit: "cover" }} />
                  <div className="mt-2">
                    <Button variant="outline-danger" size="sm" onClick={() => setForm({ ...form, imageURL: "" })} disabled={uploading}>
                      Xóa ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <small className="text-muted">Chưa chọn ảnh</small>
              )}
            </Form.Group>

            {/* Dishes grouped by category */}
            {(grouped.cats || []).map((cat) => {
              const dishesInCat = (grouped.byCat[cat.categoryID] || []).slice().sort((a,b)=>Number(b.status)-Number(a.status));
              const selectedInCat = (form.dishes || [])
                .map((id) => (dishes || []).find((d) => d.dishID === id))
                .filter((d) => d && d.categoryID === cat.categoryID);
              const isFull = selectedInCat.length >= (Number(cat.requiredQuantity) || 0);
              return (
                <div key={cat.categoryID} className="mb-4">
                  <h5 className="d-flex align-items-center justify-content-between">
                    <span>
                      {cat.name} {" "}
                      <Badge bg={isFull ? "success" : "warning"}>
                        yêu cầu: {Number(cat.requiredQuantity) || 0} | đã chọn: {selectedInCat.length}
                      </Badge>
                    </span>
                  </h5>
                  <div className="d-flex flex-wrap gap-3">
                    {dishesInCat.length ? dishesInCat.map((d) => (
                      <Form.Check
                        key={d.dishID}
                        type="checkbox"
                        label={d.name}
                        checked={form.dishes.includes(d.dishID)}
                        onChange={() => toggleDish(d.dishID)}
                      />
                    )) : (
                      <div className="text-muted">Không có món nào trong nhóm này.</div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="mt-4">
              <Button variant="primary" onClick={handleSubmit} disabled={saving || uploading}>
                {saving || uploading ? "Đang lưu…" : "Lưu"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}