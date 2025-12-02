import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Image, Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import PartnerLayout from "../../../layouts/PartnerLayout";
import useAuth from "../../../hooks/useAuth";
import { useRestaurant } from "../../../hooks/useRestaurant";
import { uploadImageToCloudinary } from "../../../services/uploadServices";

export default function CreateRestaurantPage() {
    const { user } = useAuth();
    const { createOne, addImage } = useRestaurant();
    const [submitting, setSubmitting] = useState(false);
    // Helper: revoke object URL if it's a blob URL to avoid memory leaks
    const revokeIfBlob = (url) => {
        try {
            if (url && typeof url === "string" && url.startsWith("blob:")) {
                URL.revokeObjectURL(url);
            }
        } catch (_) {
            // no-op
        }
    };
    const [newRestaurant, setNewRestaurant] = useState({
        // Will be filled at submit time; keep safe defaults in case user not loaded yet
        restaurantPartnerID: "",
        name: "",
        phone: "",
        description: "",
        thumbnailURL: "",
        thumbnailFile: null,
        // Keep images as unified items to avoid desync between URLs and Files
        imageItems: [], // [{ file, url }]
        address: {
            number: "",
            street: "",
            ward: "",
        },
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Nếu là field con của address
        if (["number", "street", "ward"].includes(name)) {
            setNewRestaurant((prev) => ({
                ...prev,
                address: { ...prev.address, [name]: value },
            }));
        } else {
            setNewRestaurant((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setNewRestaurant((prev) => {
                // Revoke previous thumbnail preview if any
                revokeIfBlob(prev.thumbnailURL);
                return { ...prev, thumbnailURL: previewUrl, thumbnailFile: file };
            });
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        const items = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
        setNewRestaurant((prev) => ({
            ...prev,
            imageItems: [...(prev.imageItems || []), ...items],
        }));
    };

    const handleViewImage = (url) => {
        setSelectedImage(url);
        setShowModal(true);
    };

    const handleDeleteImage = (url) => {
        if (window.confirm("Bạn có chắc muốn xóa ảnh này không?")) {
            if (newRestaurant.thumbnailURL === url) {
                // If deleting thumbnail, revoke and clear both URL and file
                revokeIfBlob(url);
                setNewRestaurant((prev) => ({ ...prev, thumbnailURL: "", thumbnailFile: null }));
            } else {
                // Remove by URL from unified image items and revoke the blob
                setNewRestaurant((prev) => {
                    const remain = (prev.imageItems || []).filter((it) => it.url !== url);
                    // Revoke all matching blob URLs
                    (prev.imageItems || []).forEach((it) => { if (it.url === url) revokeIfBlob(it.url); });
                    return { ...prev, imageItems: remain };
                });
            }
        }
    };

    const handleCreate = async () => {
        try {
            if (submitting) return; // prevent duplicate submits
            setSubmitting(true);
            if (!user) throw new Error("Bạn cần đăng nhập");
                        // Backend association alias is 'restaurantpartner' (lowercase). Login / me may return only basic user without association.
                        // Try all possible shapes.
                        const restaurantPartnerID = user?.restaurantpartner?.restaurantPartnerID
                            || user?.restaurantPartnerID
                            || user?.restaurantPartner?.restaurantPartnerID;
            if (!restaurantPartnerID) throw new Error("Thiếu thông tin Partner ID");

            // Upload thumbnail if file provided
            let thumbnailURL = newRestaurant.thumbnailURL;
            if (newRestaurant.thumbnailFile) {
                thumbnailURL = await uploadImageToCloudinary(newRestaurant.thumbnailFile);
            }

            const payload = {
                name: newRestaurant.name,
                description: newRestaurant.description,
                phone: newRestaurant.phone || null,
                thumbnailURL,
                restaurantPartnerID,
                address: {
                    number: newRestaurant.address.number,
                    street: newRestaurant.address.street,
                    ward: newRestaurant.address.ward,
                },
            };

            const created = await createOne(payload);

            // Upload additional images sequentially (only items still present)
            for (const it of (newRestaurant.imageItems || [])) {
                try {
                    const url = await uploadImageToCloudinary(it.file);
                    await addImage({ restaurantID: created.restaurantID, imageURL: url });
                } catch (e) {
                    console.warn("Upload/add image failed", e);
                }
            }

            alert("Tạo nhà hàng thành công!");

            // Cleanup object URLs to avoid memory leaks
            revokeIfBlob(newRestaurant.thumbnailURL);
            (newRestaurant.imageItems || []).forEach((it) => revokeIfBlob(it.url));

            // Reset form state after successful creation
            setNewRestaurant({
                restaurantPartnerID: "",
                name: "",
                phone: "",
                description: "",
                thumbnailURL: "",
                thumbnailFile: null,
                imageItems: [],
                address: { number: "", street: "", ward: "" },
            });
        } catch (err) {
            alert(err.message || "Tạo nhà hàng thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const fullAddressPreview = `${newRestaurant.address.number} ${newRestaurant.address.street}, ${newRestaurant.address.ward}`.trim();
    const imagesCount = (newRestaurant.imageItems || []).length;

    return (
        <PartnerLayout>
            <Card>
                <Card.Body>
                    <h4 className="mb-3">Tạo nhà hàng mới</h4>
                    <Form>
                        {/* --- Thông tin cơ bản --- */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="restaurantName">
                                    <Form.Label>Tên nhà hàng</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={newRestaurant.name}
                                        onChange={handleChange}
                                        placeholder="Nhập tên nhà hàng..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="restaurantPhone">
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        value={newRestaurant.phone}
                                        onChange={handleChange}
                                        placeholder="VD: 0909xxxxxx"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* --- Địa chỉ tách riêng --- */}
                        <h6 className="mt-4 mb-2 fw-bold">Địa chỉ</h6>
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="addressNumber">
                                    <Form.Label>Số nhà</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="number"
                                        value={newRestaurant.address.number}
                                        onChange={handleChange}
                                        placeholder="VD: 123"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="addressStreet">
                                    <Form.Label>Đường</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="street"
                                        value={newRestaurant.address.street}
                                        onChange={handleChange}
                                        placeholder="VD: Nguyễn Văn Linh"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="addressWard">
                                    <Form.Label>Phường/Xã</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="ward"
                                        value={newRestaurant.address.ward}
                                        onChange={handleChange}
                                        placeholder="VD: Hải Châu"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Preview địa chỉ đầy đủ */}
                        {fullAddressPreview && (
                            <p className="text-muted mb-4">
                                <strong>Địa chỉ đầy đủ:</strong> {fullAddressPreview}
                            </p>
                        )}

                        <Form.Group className="mb-3" controlId="restaurantDescription">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                name="description"
                                value={newRestaurant.description}
                                onChange={handleChange}
                                placeholder="Giới thiệu nhà hàng của bạn..."
                            />
                        </Form.Group>

                        {/* --- Thumbnail --- */}
                        <Form.Group className="mb-4" controlId="restaurantThumbnail">
                            <Form.Label>Ảnh đại diện (Thumbnail)</Form.Label>
                            <div className="d-flex align-items-center gap-3">
                                {newRestaurant.thumbnailURL ? (
                                    <div style={{ position: "relative" }}>
                                        <Image
                                            src={newRestaurant.thumbnailURL}
                                            thumbnail
                                            style={{
                                                width: "150px",
                                                height: "100px",
                                                objectFit: "cover",
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                                            }}
                                            onClick={() => handleViewImage(newRestaurant.thumbnailURL)}
                                        />
                                        <Button
                                            onClick={() => handleDeleteImage(newRestaurant.thumbnailURL)}
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
                                            color: "#777",
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
                            <Form.Label>
                                Hình ảnh khác
                                <span className="ms-2 text-muted" style={{ fontSize: "0.9rem" }}>
                                    (Đã chọn: {imagesCount})
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImagesChange}
                            />
                            <Row className="mt-3">
                                {(newRestaurant.imageItems && newRestaurant.imageItems.length > 0) ? (
                                    newRestaurant.imageItems.map((it, idx) => (
                                        <Col md={3} key={idx} className="mb-3 text-center">
                                            <div style={{ position: "relative" }}>
                                                <Image
                                                    src={it.url}
                                                    thumbnail
                                                    onClick={() => handleViewImage(it.url)}
                                                    style={{
                                                        width: "100%",
                                                        height: "150px",
                                                        objectFit: "cover",
                                                        borderRadius: "10px",
                                                        cursor: "pointer",
                                                    }}
                                                />
                                                <Button
                                                    onClick={() => handleDeleteImage(it.url)}
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

                        <Button variant="primary" onClick={handleCreate} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Đang tạo...
                                </>
                            ) : (
                                "Tạo nhà hàng"
                            )}
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
        </PartnerLayout>
    );
}
