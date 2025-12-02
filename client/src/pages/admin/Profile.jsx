import React from "react";
import { Row, Col, Card, Badge, Button } from "react-bootstrap";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminProfilePage() {
  // 🔹 Giả lập thông tin admin (sau này bạn có thể lấy từ context hoặc API)
  const admin = {
    id: 1,
    fullName: "Nguyễn Thịnh",
    email: "admin@lifevent.vn",
    phone: "0901234567",
    role: 2,
    createdAt: "2023-09-01",
    avatarURL: "https://i.pravatar.cc/200?img=68",
    status: 1, // 1 = active
    permissions: ["Quản lý người dùng", "Quản lý nhà hàng", "Xử lý thanh toán"],
    lastLogin: "06/11/2025 09:12",
    totalUsers: 248,
    totalPartners: 52,
    totalRestaurants: 31,
  };

  const roleLabel = admin.role === 2 ? "Quản trị viên hệ thống" : "Người dùng";

  return (
    <AdminLayout title="Hồ sơ Quản trị viên">
      <div className="container py-4">
        <Row className="g-4 align-items-stretch">
          {/* LEFT: Avatar + Thông tin cơ bản */}
          <Col md={4}>
            <Card className="shadow-sm border-0 rounded-4 text-center p-4 h-100">
              <div className="position-relative mb-3">
                <img
                  src={admin.avatarURL}
                  alt={admin.fullName}
                  className="rounded-circle shadow-sm"
                  width="140"
                  height="140"
                  style={{
                    objectFit: "cover",
                    border: "4px solid #fff",
                  }}
                />
                <Badge
                  bg={admin.status === 1 ? "success" : "secondary"}
                  pill
                  className="position-absolute top-0 start-50 translate-middle-x mt-2"
                >
                  {admin.status === 1 ? "Đang hoạt động" : "Bị khóa"}
                </Badge>
              </div>

              <h4 className="fw-semibold mb-0">{admin.fullName}</h4>
              <p className="text-muted small mb-1">{admin.email}</p>
              <span className="badge bg-primary mb-3">{roleLabel}</span>

              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-pill"
              >
                <i className="fas fa-pen me-2"></i>Chỉnh sửa hồ sơ
              </Button>

              <hr className="my-4" />

              <div className="text-start small">
                <p className="mb-1">
                  <strong>📞 SĐT:</strong> {admin.phone}
                </p>
                <p className="mb-1">
                  <strong>📅 Tham gia từ:</strong>{" "}
                  {new Date(admin.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <p className="mb-1">
                  <strong>⏰ Lần đăng nhập gần nhất:</strong>{" "}
                  {admin.lastLogin}
                </p>
              </div>
            </Card>
          </Col>

          {/* RIGHT: Thông tin quản lý & hệ thống */}
          <Col md={8}>
            <Card className="shadow-sm border-0 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">
                <i className="fas fa-chart-line me-2 text-primary"></i>
                Thống kê hệ thống
              </h5>

              <Row className="text-center mb-4">
                <Col md={4}>
                  <div className="p-3 bg-light rounded-4 shadow-sm">
                    <h4 className="fw-bold text-primary mb-1">
                      {admin.totalUsers}
                    </h4>
                    <p className="text-muted small mb-0">Người dùng</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3 bg-light rounded-4 shadow-sm">
                    <h4 className="fw-bold text-success mb-1">
                      {admin.totalPartners}
                    </h4>
                    <p className="text-muted small mb-0">Đối tác</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3 bg-light rounded-4 shadow-sm">
                    <h4 className="fw-bold text-warning mb-1">
                      {admin.totalRestaurants}
                    </h4>
                    <p className="text-muted small mb-0">Nhà hàng</p>
                  </div>
                </Col>
              </Row>

              <h5 className="fw-bold mb-3">
                <i className="fas fa-user-shield me-2 text-primary"></i>
                Quyền hạn & bảo mật
              </h5>

              <div className="border rounded-4 p-3 bg-white shadow-sm">
                <Row>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Email đăng nhập:</strong> {admin.email}
                    </p>
                    <p className="mb-1">
                      <strong>Mật khẩu:</strong> <code>********</code>
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Trạng thái:</strong>{" "}
                      <span
                        className={`badge ${
                          admin.status === 1 ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {admin.status === 1 ? "Hoạt động" : "Khóa"}
                      </span>
                    </p>
                    <p className="mb-1">
                      <strong>Phân quyền:</strong> Toàn quyền hệ thống
                    </p>
                  </Col>
                </Row>

                <div className="mt-3">
                  <strong>Quyền truy cập:</strong>
                  <ul className="mb-0 mt-2">
                    {admin.permissions.map((p, i) => (
                      <li key={i} className="text-muted small">
                        <i className="fas fa-check text-success me-2"></i>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-end mt-4">
                <Button variant="primary" className="rounded-pill me-2">
                  <i className="fas fa-lock me-2"></i>Đổi mật khẩu
                </Button>
                <Button variant="outline-danger" className="rounded-pill">
                  <i className="fas fa-sign-out-alt me-2"></i>Đăng xuất
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
