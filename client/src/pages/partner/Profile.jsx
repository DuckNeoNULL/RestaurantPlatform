import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import PartnerLayOut from "../../layouts/PartnerLayout";
// import "../../styles/ProfileStyles.css";

export default function Profile() {
  const [formData, setFormData] = useState({
    email: "example@email.com",
    fullName: "Nguyễn Văn A",
    phone: "0905123456",
    password: "",
    createdAt: "2025-10-04",
    status: 1,
    licenseUrl: "https://example.com/license.pdf",
    commissionRate: 0.1,
    restaurantName: "Nhà hàng Biển Xanh",
    restaurantAddress: "123 Đường Võ Nguyên Giáp, Đà Nẵng",
    openTime: "08:00",
    closeTime: "22:00",
    description: "Nhà hàng chuyên hải sản tươi sống và món Việt.",
    avatar: "",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Dữ liệu cập nhật:", formData)
    alert("Thông tin đã được lưu thành công!")
  }

  const styles = `
    .profile-header-gradient {
      background: linear-gradient(135deg, #E11D48 0%, #F65C76 100%);
      height: 120px;
      position: relative;
      overflow: hidden;
    }

    .profile-header-gradient::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.3;
    }

    .avatar-gradient {
      background: linear-gradient(135deg, #E11D48 0%, #F65C76 100%);
    }

    .icon-gradient {
      background: linear-gradient(135deg, #E11D48 0%, #F65C76 100%);
    }

    .btn-gradient {
      background: linear-gradient(135deg, #E11D48 0%, #F65C76 100%);
      border: none;
    }

    .btn-gradient:hover {
      background: linear-gradient(135deg, #F65C76 0%, #E11D48 100%);
      box-shadow: 0 8px 20px rgba(225, 29, 72, 0.3);
    }

    .form-control:focus {
      border-color: #E11D48;
      box-shadow: 0 0 0 0.2rem rgba(225, 29, 72, 0.25);
    }

    .btn-outline-secondary {
      color: #E11D48;
      border-color: #E11D48;
    }

    .btn-outline-secondary:hover {
      background-color: #E11D48;
      border-color: #E11D48;
      color: white;
    }

    .text-primary {
      color: #E11D48 !important;
    }

    .text-muted-custom {
      color: rgba(0, 0, 0, 0.6);
    }

    .sticky-sidebar {
      position: sticky;
      top: 20px;
    }

    @media (max-width: 991px) {
      .sticky-sidebar {
        position: relative;
        top: 0;
        margin-bottom: 2rem;
      }
    }
  `

  return (
    <PartnerLayOut>
      <Container className="my-5">
        <Row className="g-4">
          {/* LEFT: Thông tin avatar */}
          <Col lg={4}>
            <div className="sticky-sidebar">
              <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Body
                  className="text-center"
                >
                  {/* Avatar với border trắng */}
                  <div className="d-inline-block position-relative mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center shadow-lg mx-auto"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #7b6b6cff 0%, #b08a8eff 100%)",
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        color: "white",
                        border: "4px solid white",
                      }}
                    >
                      {formData.fullName.charAt(0).toUpperCase()}
                    </div>

                    {/* Change Avatar Button */}
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        id="avatarUpload"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) alert(`Bạn đã chọn ảnh: ${file.name}`)
                        }}
                        style={{ display: "none" }}
                      />
                      <label
                        htmlFor="avatarUpload"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-4"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-camera me-2"></i>
                        Đổi ảnh đại diện
                      </label>
                    </Form.Group>

                    {/* Profile Info */}
                    <h5 className="fw-bold text-dark mb-1">{formData.fullName}</h5>
                    <p className="small text-muted-custom mb-3">
                      <i className="bi bi-envelope me-2"></i>
                      {formData.email}
                    </p>

                    {/* Stats */}
                    <div className="border-top pt-3 mt-3">
                      <Row className="text-center g-3">
                        <Col xs={6}>
                          <div className="p-2">
                            <i className="bi bi-telephone-fill text-primary fs-5 d-block mb-1"></i>
                            <small className="text-muted-custom d-block">Điện thoại</small>
                            <strong className="text-dark small">{formData.phone}</strong>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="p-2">
                            <i className="bi bi-calendar-check-fill text-success fs-5 d-block mb-1"></i>
                            <small className="text-muted-custom d-block">Tham gia</small>
                            <strong className="text-dark small">{formData.createdAt}</strong>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* RIGHT: Form Card */}
          <Col lg={8}>
            <Card className="border-0 shadow">
              <Card.Body className="p-4">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                  <div className="flex-grow-1">
                    <h5 className="fw-bold text-dark mb-1">Thông tin đại diện nhà hàng</h5>
                    <p className="text-muted-custom small mb-0">Cập nhật thông tin cá nhân và tài khoản</p>
                  </div>
                  <Badge bg="success" className="px-3 py-2">
                    <i className="bi bi-check-circle me-1"></i>
                    Đã xác thực
                  </Badge>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* Account Section */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3 icon-gradient"
                        style={{
                          width: "40px",
                          height: "40px",
                          color: "white",
                        }}
                      >
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-0">Thông tin tài khoản</h6>
                    </div>

                    <div className="ps-5">
                      <Row className="g-3 mb-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold text-primary">Email</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-0">
                                <i className="bi bi-envelope"></i>
                              </span>
                              <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled
                                className="border-0 bg-light"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold text-primary">Số điện thoại</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-white border-0">
                                <i className="bi bi-telephone"></i>
                              </span>
                              <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="border-0"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold text-primary">Họ và tên</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-white border-0">
                                <i className="bi bi-person"></i>
                              </span>
                              <Form.Control
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="border-0"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold text-primary">Ngày tạo tài khoản</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-0">
                                <i className="bi bi-calendar"></i>
                              </span>
                              <Form.Control
                                type="text"
                                value={formData.createdAt}
                                disabled
                                className="border-0 bg-light"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* License Section */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3 icon-gradient"
                        style={{
                          width: "40px",
                          height: "40px",
                          color: "white",
                        }}
                      >
                        <i className="bi bi-file-earmark-text-fill"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-0">Hợp tác & Giấy phép</h6>
                    </div>

                    <div className="ps-5">
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold text-primary">Giấy phép kinh doanh</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-white border-0">
                                <i className="bi bi-link-45deg"></i>
                              </span>
                              <Form.Control
                                type="text"
                                name="licenseUrl"
                                value={formData.licenseUrl}
                                onChange={handleChange}
                                placeholder="Nhập đường dẫn..."
                                className="border-0"
                              />
                            </div>
                            {formData.licenseUrl && (
                              <a
                                href={formData.licenseUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="small d-inline-flex align-items-center mt-2"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Xem giấy phép
                              </a>
                            )}
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-semibold text-primary">Tỷ lệ hoa hồng (%)</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-0">
                                <i className="bi bi-percent"></i>
                              </span>
                              <Form.Control
                                type="number"
                                name="commissionRate"
                                value={formData.commissionRate}
                                disabled
                                className="border-0 bg-light"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                    <Button variant="outline-secondary" className="px-4 rounded-pill">
                      <i className="bi bi-x-circle me-2"></i>
                      Hủy
                    </Button>
                    <Button type="submit" className="px-4 rounded-pill btn-gradient text-white">
                      <i className="bi bi-check-circle me-2"></i>
                      Lưu thay đổi
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
        </Col>
      </Row>
    </Container>
    </PartnerLayOut >
  );
}
