import React, { useMemo, useState } from "react";
import { Form, Button, Image } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";
import { uploadImageToCloudinary } from "../../../services/uploadServices";

export default function DishCreatePage({ onBack, categoryID: initialCategoryId }) {
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);
  const { dishCategories, loadDishCategoriesByRestaurant, createOneDish } = useAdditionRestaurant();

  const [form, setForm] = useState({
    name: "",
    categoryID: initialCategoryId || "",
    imageURL: "",
  });
  const [uploading, setUploading] = useState(false);

  const categories = dishCategories || [];

  React.useEffect(() => {
    if (restaurantID) {
      loadDishCategoriesByRestaurant(restaurantID).catch(() => {});
    }
  }, [restaurantID, loadDishCategoriesByRestaurant]);

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
      if (!restaurantID) throw new Error("Thiếu restaurantID trong URL");
      if (!form.name || !form.categoryID) {
        alert("Vui lòng nhập tên món và chọn loại món");
        return;
      }
      const payload = {
        restaurantID,
        name: form.name,
        categoryID: Number(form.categoryID) || form.categoryID,
        imageURL: form.imageURL,
        status: 1,
      };
      await createOneDish(payload);
      alert("Món mới đã được lưu");
      onBack();
    } catch (err) {
      alert(`Tạo món thất bại: ${err?.message || err}`);
    }
  };

  return (
    <div className="p-4">
      <h2>Thêm món ăn</h2>
      <Form className="mt-3" style={{ maxWidth: "500px" }}>
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
            <option value="">-- Chọn loại món --</option>
            {categories.map((c) => (
              <option key={c.categoryID} value={c.categoryID}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Ảnh món</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleSelectFile} disabled={uploading} />
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
        <div className="d-flex gap-2 mt-4">
          <Button variant="secondary" onClick={onBack}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={uploading}>
            {uploading ? "Đang tải ảnh…" : "Lưu"}
          </Button>
        </div>
      </Form>
    </div>
  );
}