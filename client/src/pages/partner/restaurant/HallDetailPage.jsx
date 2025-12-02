import React, { useState, useEffect, useMemo } from "react";
import { Card, Form, Button, Row, Col, Image, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useHall } from "../../../hooks/useHall";
import { useParams } from "react-router-dom";
import { uploadImageToCloudinary } from "../../../services/uploadServices";

export default function HallProfile(props) {
    const { hall = null, onBack, onUpdated, readOnly = false } = props;
    const {
        updateOne,
        loadByRestaurant,
        status,
        loadImages,
        selectImages,
        addImageToHall,
        removeImage,
    } = useHall();
    const { id: paramId, restaurantID: paramRestaurantID } = useParams();
    const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);

    // Mock data nếu không có props.hall
    const mockHall = useMemo(() => ({
        name: "Sảnh A",
        description: "Sảnh tiệc lớn, thích hợp tổ chức hội nghị và tiệc cưới.",
        capacity: 500,
        area: 600,
        price: 20000000,
        status: 1,
        imageURLs: [
            "https://mgs-storage.sgp1.digitaloceanspaces.com/satellite/50522f6c-9942-4cfb-8ccd-b6efc45eed72",
            "https://nhuminhplazahotel.com/wp-content/uploads/2024/07/bang-gia-nha-hang-tiec-cuoi5.jpg",
        ],
    }), []);

    const [profile, setProfile] = useState({
        name: "",
        description: "",
        minTable: "",
        maxTable: "",
        area: "",
        price: "",
        status: true,
        images: [], // [{ imageID?, imageURL }]
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const h = hall || mockHall; // dùng mock nếu props không có
        const statusVal = typeof h.status === "boolean"
            ? h.status
            : (typeof h.status === "number" ? h.status === 1 : String(h.status).toLowerCase() === "active");
        // Prefer full objects if available, else adapt from raw URLs
        const imagesFromRelations = Array.isArray(h.images)
            ? h.images.map((img) => ({ imageID: img.imageID, imageURL: img.imageURL }))
            : [];
        const imagesFromUrls = Array.isArray(h.imageURLs)
            ? h.imageURLs.map((u) => ({ imageURL: u }))
            : [];
        const images = imagesFromRelations.length ? imagesFromRelations : imagesFromUrls;
        setProfile({
            name: h.name || "",
            description: h.description || "",
            minTable: h.minTable ?? "",
            maxTable: h.maxTable ?? "",
            area: h.area ?? "",
            price: h.price ?? "",
            status: !!statusVal,
            images: images || [],
        });
    }, [hall, mockHall]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Fetch hall images from API (hallimg) on mount/change and read from Redux
    const reduxImages = selectImages(hall?.hallID);
    useEffect(() => {
        if (hall?.hallID) {
            // load images from server to ensure we display all persisted images
            loadImages(hall.hallID).catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hall?.hallID]);

    const handleImagesChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length || !hall?.hallID) return;
        // optionally show saving state while uploading
        setSaving(true);
        try {
            for (const file of files) {
                try {
                    const url = await uploadImageToCloudinary(file);
                    const added = await addImageToHall({ hallID: hall.hallID, imageURL: url });
                    const item = added && (added.imageURL || added.imageID)
                        ? { imageID: added.imageID, imageURL: added.imageURL }
                        : { imageURL: url };
                    setProfile((prev) => ({ ...prev, images: [...(prev.images || []), item] }));
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.warn("Upload/add image failed:", err);
                }
            }
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!hall?.hallID) {
            alert("Không tìm thấy hallID để cập nhật.");
            return;
        }
        const payload = {
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
            const updated = await updateOne({ id: hall.hallID, payload });
            if (updated) {
                // refresh local state from updated to keep in sync
                const statusVal = typeof updated.status === "boolean"
                    ? updated.status
                    : (typeof updated.status === "number" ? updated.status === 1 : String(updated.status).toLowerCase() === "active");
                const imagesFromRelations = Array.isArray(updated.images)
                    ? updated.images.map((img) => ({ imageID: img.imageID, imageURL: img.imageURL }))
                    : [];
                const imagesFromUrls = Array.isArray(updated.imageURLs)
                    ? updated.imageURLs.map((u) => ({ imageURL: u }))
                    : [];
                const nextImages = imagesFromRelations.length ? imagesFromRelations : imagesFromUrls;
                setProfile({
                    name: updated.name || "",
                    description: updated.description || "",
                    minTable: updated.minTable ?? "",
                    maxTable: updated.maxTable ?? "",
                    area: updated.area ?? "",
                    price: updated.price ?? "",
                    status: !!statusVal,
                    images: nextImages || [],
                });
                if (onUpdated) onUpdated(updated);
                // refresh list so parent grid reflects latest data without manual reload
                try { if (restaurantID) await loadByRestaurant(restaurantID); } catch {}
            }
            alert("Lưu thành công!");
        } catch (err) {
            alert(`Lưu thất bại: ${err?.message || err}`);
        } finally {
            setSaving(false);
        }
    };

    const handleViewImage = (url) => {
        setSelectedImage(url);
        setShowModal(true);
    };

    const handleDeleteImage = async (imgItem) => {
        if (!imgItem) return;
        if (!window.confirm("Bạn có chắc muốn xóa ảnh này không?")) return;
        try {
            if (imgItem.imageID && hall?.hallID) {
                await removeImage({ imageId: imgItem.imageID, hallId: hall.hallID });
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn("Delete image failed:", err);
        } finally {
            setProfile((prev) => ({
                ...prev,
                images: (prev.images || []).filter((it) => it.imageID !== imgItem.imageID && it.imageURL !== imgItem.imageURL),
            }));
        }
    };

    return (
        <Card>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Thông tin sảnh</h4>
                    <Button variant="secondary" className="mb-3" onClick={onBack}>
                        ← Quay lại
                    </Button>
                </div>

                <Form>
                    {/* --- Thông tin cơ bản --- */}
                    <Form.Group controlId="hallName" className="mb-3">
                        <Form.Label>Tên sảnh</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            disabled={readOnly || saving || status === "loading"}
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
                                    disabled={readOnly || saving || status === "loading"}
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
                                    disabled={readOnly || saving || status === "loading"}
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
                                    disabled={readOnly || saving || status === "loading"}
                                />
                            </Form.Group>
                            <Form.Group controlId="hallPrice">
                                <Form.Label>Giá thuê (₫)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={profile.price}
                                    onChange={handleChange}
                                    disabled={readOnly || saving || status === "loading"}
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
                            disabled={readOnly || saving || status === "loading"}
                        />
                    </Form.Group>

                    {/* --- Ảnh --- */}
                    <Form.Group className="mb-4" controlId="hallImages">
                        <Form.Label>Hình ảnh</Form.Label>
                        <Form.Control type="file" multiple accept="image/*" onChange={handleImagesChange} disabled={readOnly || saving || status === "loading"} />
                        <Row className="mt-3">
                            {(() => {
                                const displayImages = (reduxImages && reduxImages.length > 0) ? reduxImages : (profile.images || []);
                                return displayImages && displayImages.length > 0 ? (
                                    displayImages.map((img, idx) => (
                                    <Col md={3} key={idx} className="mb-3 text-center">
                                        <div style={{ position: "relative" }}>
                                            <Image
                                                src={img.imageURL}
                                                thumbnail
                                                onClick={() => handleViewImage(img.imageURL)}
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
                                                }}
                                                disabled={readOnly || saving || status === "loading"}
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
                                );
                            })()}
                        </Row>
                    </Form.Group>

                    <Button variant="primary" onClick={handleSave} disabled={readOnly || saving || status === "loading"}>
                        {saving || status === "loading" ? "Đang lưu..." : "Lưu"}
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
