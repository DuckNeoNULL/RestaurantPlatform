import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Form, Row, Col, Image, ListGroup, Badge, Alert } from "react-bootstrap";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";
import { uploadImageToCloudinary } from "../../../services/uploadServices";

export default function MenuDetailPage({ menu: propMenu, onBack, readOnly = false }) {
  const [menu, setMenu] = useState(() => ({ ...propMenu }));
  const [isEditing, setIsEditing] = useState(false);
  const [warning, setWarning] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const restaurantID = useMemo(() => Number(propMenu?.restaurantID) || undefined, [propMenu]);

  const {
    dishes,
    dishCategories,
    status,
    error,
    loadDishesByRestaurant,
    loadDishCategoriesByRestaurant,
    updateOneMenu,
  } = useAdditionRestaurant();

  useEffect(() => {
    // Normalize incoming dishes to an array of IDs for consistent handling
    const incoming = { ...propMenu };
    if (Array.isArray(incoming.dishes)) {
      incoming.dishes = incoming.dishes.map((d) => (typeof d === 'object' && d !== null ? d.dishID : d));
    }
    setMenu(incoming);
  }, [propMenu]);

  useEffect(() => {
    if (!restaurantID) return;
    loadDishCategoriesByRestaurant(restaurantID).catch(() => {});
    loadDishesByRestaurant(restaurantID).catch(() => {});
  }, [restaurantID, loadDishCategoriesByRestaurant, loadDishesByRestaurant]);

  const grouped = useMemo(() => {
    const cats = (dishCategories || [])
      .filter((c) => Number(c.status) === 1)
      .slice()
      .sort((a, b) => Number(b.status) - Number(a.status));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenu((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    setMenu((prev) => ({ ...prev, status: Number(e.target.value) }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadImageToCloudinary(file);
      setMenu((prev) => ({ ...prev, imageURL: url }));
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`Tải ảnh thất bại: ${err?.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDishToggle = (dishID) => {
    setMenu((prev) => {
      const selected = prev.dishes || [];
      if (selected.includes(dishID)) return { ...prev, dishes: selected.filter((id) => id !== dishID) };
      return { ...prev, dishes: [...selected, dishID] };
    });
  };

  const validateRequired = () => {
    const missing = (grouped.cats || []).reduce((acc, cat) => {
      const selectedInCat = (menu.dishes || [])
        .map((id) => (dishes || []).find((d) => d.dishID === id))
        .filter((d) => d && d.categoryID === cat.categoryID);
      const need = Number(cat.requiredQuantity) || 0;
      if (selectedInCat.length < need) acc.push(`${cat.name} (thiếu ${need - selectedInCat.length} món)`);
      return acc;
    }, []);
    if (missing.length) {
      setWarning(`Chưa đủ món trong các nhóm: ${missing.join(", ")}`);
      return false;
    }
    setWarning("");
    return true;
  };

  const handleSave = async () => {
    if (readOnly) return;
    if (!validateRequired()) return;
    try {
      setSaving(true);
      await updateOneMenu({
        id: menu.menuID ?? menu.id,
        payload: {
          name: menu.name,
          price: Number(menu.price) || 0,
          status: Number(menu.status) === 1 ? 1 : 0,
          imageURL: menu.imageURL,
          dishIDs: Array.isArray(menu.dishes)
            ? menu.dishes.map((x) => (typeof x === 'object' && x !== null ? x.dishID : x))
            : [],
        },
      });
      // eslint-disable-next-line no-alert
      alert("Đã lưu menu.");
      setIsEditing(false);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(`Cập nhật thất bại: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Chi tiết Menu</h4>
        <div>
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => (isEditing ? setIsEditing(false) : onBack?.())}
          >
            {isEditing ? "Hủy" : "← Quay lại"}
          </Button>
          {!isEditing && !readOnly && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {isEditing && warning && (
        <Alert variant="warning" className="py-2">⚠️ {warning}</Alert>
      )}
      {isEditing && status === "loading" && (
        <Alert variant="info" className="py-2">Đang tải dữ liệu món và nhóm món…</Alert>
      )}
      {isEditing && error && (
        <Alert variant="danger" className="py-2">Lỗi: {String(error)}</Alert>
      )}

      <Form>
        {isEditing ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Tên menu</Form.Label>
              <Form.Control name="name" value={menu.name || ""} onChange={handleChange} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá (VNĐ)</Form.Label>
                  <Form.Control type="number" name="price" value={menu.price || ""} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select value={Number(menu.status) === 1 ? 1 : 0} onChange={handleStatusChange}>
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Ngừng hoạt động</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh menu</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageFile} disabled={uploading} />
              {menu.imageURL ? (
                <div className="mt-3">
                  <Image src={menu.imageURL} alt="preview" fluid rounded style={{ maxHeight: 200, objectFit: "cover" }} />
                  <div className="mt-2">
                    <Button variant="outline-danger" size="sm" onClick={() => setMenu({ ...menu, imageURL: "" })} disabled={uploading}>
                      Xóa ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <small className="text-muted">Chưa chọn ảnh</small>
              )}
            </Form.Group>

            {/* Chọn món theo nhóm - Ẩn phần món nếu menu đang ngừng hoạt động */}
            {Number(menu.status) === 0 ? (
              <Alert variant="secondary" className="py-2">Menu đang ngừng hoạt động — danh sách món không hiển thị.</Alert>
            ) : (grouped.cats || []).map((cat) => {
              const dishesInCat = (grouped.byCat[cat.categoryID] || []).slice().sort((a,b)=>Number(b.status)-Number(a.status));
              const selectedInCat = (menu.dishes || [])
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
                  <Row>
                    {dishesInCat.length ? dishesInCat.map((dish) => {
                      const isSelected = (menu.dishes || []).includes(dish.dishID);
                      return (
                        <Col md={3} key={dish.dishID} className="mb-3">
                          <Card
                            className={`p-2 ${isSelected ? "border-primary shadow-sm" : "border-light"}`}
                            style={{ cursor: "pointer", transition: "0.2s" }}
                            onClick={() => handleDishToggle(dish.dishID)}
                          >
                            <Image
                              src={dish.imageURL || "https://via.placeholder.com/150?text=No+Image"}
                              alt={dish.name}
                              fluid
                              rounded
                              style={{ height: "100px", objectFit: "cover", marginBottom: "8px" }}
                            />
                            <div className="d-flex align-items-center justify-content-between">
                              <span>{dish.name}</span>
                              <Form.Check
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleDishToggle(dish.dishID);
                                }}
                              />
                            </div>
                          </Card>
                        </Col>
                      );
                    }) : (
                      <p className="text-muted">Không có món nào trong nhóm này.</p>
                    )}
                  </Row>
                </div>
              );
            })}

            <Button variant="success" onClick={handleSave} disabled={saving || uploading}>{saving || uploading ? "Đang lưu…" : "Lưu"}</Button>
          </>
        ) : (
          <>
            <Row className="mb-3">
              <Col md={4}>
                {menu.imageURL ? (
                  <Image src={menu.imageURL} alt="Menu" rounded fluid style={{ maxHeight: "250px" }} />
                ) : (
                  <div className="border p-3 text-center text-muted">Chưa có hình ảnh</div>
                )}
              </Col>
              <Col md={8}>
                <h4>{menu.name}</h4>
                <p><strong>Giá:</strong> {Number(menu.price || 0).toLocaleString("vi-VN")} ₫</p>
                <p><strong>Trạng thái:</strong> {Number(menu.status) === 1 ? "Đang hoạt động" : "Ngừng hoạt động"}</p>
              </Col>
            </Row>

            {/* Hiển thị danh sách món theo nhóm - ẩn khi menu inactive */}
            {Number(menu.status) === 0 ? (
              <div className="alert alert-secondary py-2">Menu đang ngừng hoạt động — không hiển thị danh sách món.</div>
            ) : (grouped.cats || []).map((cat) => {
              const dishesInCategory = (menu.dishes || [])
                .map((id) => (dishes || []).find((d) => d.dishID === id))
                .filter((d) => d && d.categoryID === cat.categoryID);
              return (
                <div key={cat.categoryID} className="mb-3">
                  <h6>{cat.name} <Badge bg="secondary">Yêu cầu: {Number(cat.requiredQuantity) || 0}</Badge></h6>
                  <ListGroup>
                    {dishesInCategory.length ? dishesInCategory.map((dish) => (
                      <ListGroup.Item key={dish.dishID} className="d-flex align-items-center">
                        <Image
                          src={dish.imageURL || "https://via.placeholder.com/100?text=No+Image"}
                          alt={dish.name}
                          rounded
                          style={{ height: "60px", width: "80px", objectFit: "cover", marginRight: "10px" }}
                        />
                        {dish.name}
                      </ListGroup.Item>
                    )) : (
                      <ListGroup.Item className="text-muted">(Chưa chọn món nào trong nhóm này)</ListGroup.Item>
                    )}
                  </ListGroup>
                </div>
              );
            })}
          </>
        )}
      </Form>
    </Card>
  );
}