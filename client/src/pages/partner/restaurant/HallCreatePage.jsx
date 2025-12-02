import React, { useMemo, useState } from "react";
import { Card, Form, Button, Row, Col, Image, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useHall } from "../../../hooks/useHall";
import { uploadImageToCloudinary } from "../../../services/uploadServices";

export default function HallCreate({ onBack }) {
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);
  const { createOne, addImageToHall, loadByRestaurant, status } = useHall();

  const [profile, setProfile] = useState({
    name: "",
    description: "",
    minTable: "",
    maxTable: "",
    area: "",
    price: "",
    status: true,
    imageURLs: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setProfile((prev) => ({
      ...prev,
      imageURLs: [...prev.imageURLs, ...newPreviews],
    }));
    setSelectedFiles((prev) => [...prev, ...files]);
  };


  const handleSave = async () => {
    if (!restaurantID) {
      alert("Không tìm thấy restaurantID từ URL. Không thể tạo sảnh.");
      return;
    }
    const payload = {
      restaurantID,
      name: profile.name?.trim(),
      description: profile.description?.trim() || "",
  minTable: Number(profile.minTable) || 0,
  maxTable: Number(profile.maxTable) || 0,
      area: Number(profile.area) || 0,
      price: Number(profile.price) || 0,
      status: !!profile.status,
    };

    if (!payload.name) {
      alert("Vui lòng nhập tên sảnh.");
      return;
    }

    try {
      setSaving(true);
      const created = await createOne(payload);

      // Upload selected files to Cloudinary and attach URLs
      if (created?.hallID && selectedFiles.length) {
        for (const file of selectedFiles) {
          try {
            const url = await uploadImageToCloudinary(file);
            await addImageToHall({ hallID: created.hallID, imageURL: url });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Upload/add image failed:", e);
          }
        }
      }

  // refresh list to ensure latest data reflects without manual reload
  try { if (restaurantID) await loadByRestaurant(restaurantID); } catch {}
  alert("Tạo hall thành công!");
      if (onBack) onBack();
    } catch (err) {
      alert(`Tạo hall thất bại: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleViewImage = (url) => {
    setSelectedImage(url);
    setShowModal(true);
  };

  const handleDeleteImage = (url) => {
    if (window.confirm("Bạn có chắc muốn xóa ảnh này không?")) {
      setProfile((prev) => ({
        ...prev,
        imageURLs: prev.imageURLs.filter((img) => img !== url),
      }));
    }
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Tạo mới sảnh</h4>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              ← Quay lại
            </Button>
          )}
        </div>

        <Form>
          <Form.Group controlId="hallName" className="mb-3">
            <Form.Label>Tên sảnh</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={saving || status === "loading"}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="hallMinTable">
                <Form.Label>Số bàn tối thiểu</Form.Label>
                <Form.Control
                  type="number"
                  name="minTable"
                  value={profile.minTable}
                  onChange={handleChange}
                  disabled={saving || status === "loading"}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="hallArea">
                <Form.Label>Diện tích (m²)</Form.Label>
                <Form.Control
                  type="number"
                  name="area"
                  value={profile.area}
                  onChange={handleChange}
                  disabled={saving || status === "loading"}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="hallMaxTable">
                <Form.Label>Số bàn tối đa</Form.Label>
                <Form.Control
                  type="number"
                  name="maxTable"
                  value={profile.maxTable}
                  onChange={handleChange}
                  disabled={saving || status === "loading"}
                />
              </Form.Group>
              <Form.Group controlId="hallPrice">
                <Form.Label>Giá thuê (₫)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={profile.price}
                  onChange={handleChange}
                  disabled={saving || status === "loading"}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="hallDescription">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="description"
              value={profile.description}
              onChange={handleChange}
              disabled={saving || status === "loading"}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="hallImages">
            <Form.Label>Hình ảnh</Form.Label>
            <Form.Control type="file" multiple accept="image/*" onChange={handleImagesChange} disabled={saving || status === "loading"} />
            <Row className="mt-3">
              {profile.imageURLs.length > 0 ? (
                profile.imageURLs.map((img, idx) => (
                  <Col md={3} key={idx} className="mb-3 text-center">
                    <div style={{ position: "relative" }}>
                      <Image
                        src={img}
                        thumbnail
                        onClick={() => handleViewImage(img)}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          cursor: "pointer",
                        }}
                      />
                      <Button
                        onClick={() => handleDeleteImage(img)}
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        disabled={saving || status === "loading"}
                      >
                        <FontAwesomeIcon icon={faTimes} size="sm" />
                      </Button>
                    </div>
                  </Col>
                ))
              ) : (
                <Col>
                  <em>Chưa có ảnh nào.</em>
                </Col>
              )}
            </Row>
          </Form.Group>

          <Button variant="primary" onClick={handleSave} disabled={saving || status === "loading"}>
            {saving || status === "loading" ? "Đang tạo..." : "Tạo mới"}
          </Button>

          <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
            <Modal.Body className="text-center">
              {selectedImage && <Image src={selectedImage} fluid style={{ maxHeight: "80vh", borderRadius: "10px" }} />}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        </Form>
      </Card.Body>
    </Card>
  );
}