import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Image, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function RestaurantProfile(props) {

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    description: "",
    thumbnailURL: "",
    imageURLs: [],
    address: {
      number: "",
      street: "",
      ward: "",
    },
    eventTypes: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (props.restaurant) {
      setProfile({
        name: props.restaurant.name || "",
        phone: props.restaurant.phone || props.restaurant.contactPhone || "",
        description: props.restaurant.description || "",
        thumbnailURL: props.restaurant.thumbnailURL || "",
        imageURLs: props.restaurant.imageURLs || [],
        address: {
          number: props.restaurant.address?.number || "",
          street: props.restaurant.address?.street || "",
          ward: props.restaurant.address?.ward || "",
        },
        // Chỉ lưu ID
        eventTypes: props.restaurant.eventTypes
          ? props.restaurant.eventTypes.map((e) => e.eventTypeID)
          : [],
      });
    }
  }, [props.restaurant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["number", "street", "ward"].includes(name)) {
      setProfile((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, thumbnailURL: previewUrl }));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setProfile((prev) => ({
      ...prev,
      imageURLs: [...(prev.imageURLs || []), ...newPreviews],
    }));
  };

  const handleSave = () => {
    (async () => {
      try {
        if (!props.restaurant || !props.restaurant.restaurantID) throw new Error('Missing restaurant id');
        const id = props.restaurant.restaurantID;
        const payload = {
          name: profile.name,
          phone: profile.phone,
          description: profile.description,
          thumbnailURL: profile.thumbnailURL,
          // send images as array of URLs (if you upload images later, replace with upload flow)
          imageURLs: profile.imageURLs || [],
          address: {
            number: profile.address.number,
            street: profile.address.street,
            ward: profile.address.ward,
          },
          eventTypes: profile.eventTypes || [],
        };

        // call API (PUT /api/restaurants/:id)
        const res = await fetch(`/api/restaurants/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error('Update failed', data);
          throw new Error(data?.error || data?.message || 'Update failed');
        }

        // notify parent if provided
        if (typeof props.onSaved === 'function') props.onSaved(data);
        alert('Lưu thành công!');
      } catch (err) {
        console.error('Error saving profile', err);
        alert('Lưu thất bại: ' + (err.message || 'Có lỗi xảy ra'));
      }
    })();
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
        <h4 className="mb-3">Hồ sơ nhà hàng</h4>
        <Form>
          {/* --- Thông tin cơ bản --- */}
          <Form.Group controlId="restaurantName" className="mb-3">
            <Form.Label>Tên nhà hàng</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="restaurantPhone">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={2}>
              <Form.Group controlId="restaurantNumber">
                <Form.Label>Số nhà</Form.Label>
                <Form.Control
                  type="text"
                  name="number"
                  value={profile.address.number}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="restaurantStreet">
                <Form.Label>Đường</Form.Label>
                <Form.Control
                  type="text"
                  name="street"
                  value={profile.address.street}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="restaurantWard">
                <Form.Label>Phường / Xã</Form.Label>
                <Form.Control
                  type="text"
                  name="ward"
                  value={profile.address.ward}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* --- Event Types --- */}
          <Form.Group className="mb-4">
            <Form.Label>Sự kiện hỗ trợ</Form.Label>
            <div className="d-flex flex-wrap gap-3">
              {props.allEventTypes?.map((event) => (
                <Form.Check
                  key={event.eventTypeID}
                  type="checkbox"
                  label={event.name}
                  checked={
                    profile.eventTypes?.some((e) => e === event.eventTypeID) || false
                  }
                  onChange={() => {
                    setProfile((prev) => {
                      const selected = prev.eventTypes || [];
                      if (selected.includes(event.eventTypeID)) {
                        // bỏ chọn
                        return {
                          ...prev,
                          eventTypes: selected.filter((id) => id !== event.eventTypeID),
                        };
                      } else {
                        // thêm chọn
                        return { ...prev, eventTypes: [...selected, event.eventTypeID] };
                      }
                    });
                  }}
                />
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-3" controlId="restaurantDescription">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="description"
              value={profile.description}
              onChange={handleChange}
            />
          </Form.Group>

          {/* --- Thumbnail --- */}
          <Form.Group className="mb-4" controlId="restaurantThumbnail">
            <Form.Label>Ảnh đại diện (Thumbnail)</Form.Label>
            <div className="d-flex align-items-center gap-3">
              {profile.thumbnailURL ? (
                <div style={{ position: "relative" }}>
                  <Image
                    src={profile.thumbnailURL}
                    thumbnail
                    style={{
                      width: "150px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => handleViewImage(profile.thumbnailURL)}
                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  {/* Nút xoá thumbnail */}
                  <Button
                    onClick={() => handleDeleteImage(profile.thumbnailURL)}
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
                      boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease, transform 0.1s ease",
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} size="sm" />
                  </Button>
                </div>
              ) : (
                <div
                  style={{
                    width: "150px",
                    height: "100px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    border: "1px dashed #ccc",
                  }}
                >
                  <span>Chưa có ảnh</span>
                </div>
              )}
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </div>
          </Form.Group>

          {/* --- Ảnh khác --- */}
          <Form.Group className="mb-4" controlId="restaurantImages">
            <Form.Label>Hình ảnh khác</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
            />
            <Row className="mt-3">
              {profile.imageURLs && profile.imageURLs.length > 0 ? (
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
                          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease, transform 0.1s ease",
                        }}
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
          <Button variant="primary" onClick={handleSave}>
            Lưu
          </Button>
          {/* --- Modal xem ảnh --- */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
            <Modal.Body className="text-center">
              {selectedImage && (
                <Image
                  src={selectedImage}
                  fluid
                  style={{ maxHeight: "80vh", borderRadius: "10px" }}
                />
              )}
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