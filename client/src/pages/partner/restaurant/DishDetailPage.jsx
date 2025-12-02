import React, { useMemo, useState, useEffect } from "react";
import { Button, Form, Card, Image } from "react-bootstrap";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";
import { uploadImageToCloudinary } from "../../../services/uploadServices";

export default function DishDetailPage({ dish, onBack }) {
  const [form, setForm] = useState({ ...dish });
  const { dishCategories, updateOneDish, loadDishCategoriesByRestaurant } = useAdditionRestaurant();
  const categories = dishCategories || [];
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // best-effort: if no categories, try to load by restaurant from dish data
    if (!categories?.length && dish?.restaurantID) {
      loadDishCategoriesByRestaurant(dish.restaurantID).catch(() => {});
    }
  }, [categories?.length, dish?.restaurantID, loadDishCategoriesByRestaurant]);

  const handleSelectFile = async (e) => {
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

  const handleSave = async () => {
    try {
      const id = form.dishID ?? form.id;
      const payload = {
        name: form.name,
        categoryID: Number(form.categoryID) || form.categoryID,
        status: Number(form.status),
        imageURL: form.imageURL,
      };
      await updateOneDish({ id, payload });
      alert("Đã lưu thay đổi");
      onBack();
    } catch (err) {
      alert(`Lưu thất bại: ${err?.message || err}`);
    }
  };

  return (
    <div className="p-4">
      <Button variant="secondary" onClick={onBack} className="mb-3">
        ← Quay lại
      </Button>
      <Card className="shadow-lg p-4" style={{ maxWidth: "600px" }}>
        {form.imageURL ? (
          <Card.Img
            variant="top"
            src={form.imageURL}
            alt={form.name}
            style={{ borderRadius: "10px", objectFit: "cover", height: "300px", marginBottom: "20px" }}
          />
        ) : (
          <div className="mb-3 text-muted">Chưa có ảnh</div>
        )}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Ảnh món</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleSelectFile} disabled={uploading} />
            {form.imageURL && (
              <div className="mt-2">
                <Button variant="outline-danger" size="sm" onClick={() => setForm({ ...form, imageURL: "" })} disabled={uploading}>
                  Xóa ảnh
                </Button>
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tên món</Form.Label>
            <Form.Control
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Loại món</Form.Label>
            <Form.Select
              value={form.categoryID}
              onChange={(e) => setForm({ ...form, categoryID: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            >
              <option value={1}>Đang bán</option>
              <option value={0}>Ngừng bán</option>
            </Form.Select>
          </Form.Group>
          <div className="d-flex gap-2 mt-3">
            <Button variant="secondary" onClick={onBack}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={uploading}>
              {uploading ? "Đang tải ảnh…" : "Lưu"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}