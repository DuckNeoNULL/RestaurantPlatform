import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import axios from "../../../../api/axios";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users");
      console.log("📌 Users from API:", res.data);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi tải users:", err);
    }
  };

  const getRoleName = (role) =>
    role === 0 ? "Khách hàng" : role === 1 ? "Đối tác" : "Admin";

  const filteredUsers = users.filter((u) => {
    const matchName = u.fullName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? u.status === 1 : u.status === 0);
    const matchRole = roleFilter === "all" || u.role.toString() === roleFilter;
    return matchName && matchStatus && matchRole;
  });

  const toggleStatus = async (id, currentStatus) => {
    const confirmMsg =
      currentStatus === 1
        ? "Bạn có chắc muốn KHÓA tài khoản này không?"
        : "Bạn có chắc muốn MỞ KHÓA tài khoản này không?";

    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.post(`/admin/users/update/status/${id}`, {
        status: currentStatus === 1 ? 0 : 1,
      });
      fetchUsers();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  return (
    <AdminLayout title="Quản lý người dùng">
      <div className="container py-4">
        {/* Statistic cards */}
        <div className="row g-4 mb-4">
          {[
            {
              title: "Tổng người dùng",
              value: users.length,
              color: "text-primary",
              icon: "bi bi-people",
            },
            {
              title: "Đang hoạt động",
              value: users.filter((u) => u.status === 1).length,
              color: "text-success",
              icon: "bi bi-check-circle",
            },
            {
              title: "Mới trong 7 ngày",
              value: users.filter((u) => {
                const diff =
                  (new Date() - new Date(u.createdAt)) / (1000 * 60 * 60 * 24);
                return diff <= 7;
              }).length,
              color: "text-info",
              icon: "bi bi-clock-history",
            },
          ].map((card, index) => (
            <div className="col-md-4" key={index}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 fw-medium">{card.title}</p>
                    <h3 className={`fw-bold ${card.color}`}>{card.value}</h3>
                  </div>
                  <i className={`${card.icon} fs-2 ${card.color}`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex flex-wrap align-items-center gap-3">
              <div className="input-group" style={{ width: "250px" }}>
                <span className="input-group-text bg-light border-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo tên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: "180px" }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Bị khóa</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-select"
                style={{ width: "180px" }}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="0">Khách hàng</option>
                <option value="1">Đối tác</option>
                <option value="2">Admin</option>
              </select>
            </div>

            <button className="btn btn-primary px-4">
              <i className="bi bi-plus-lg me-2"></i>Thêm người dùng
            </button>
          </div>
        </div>

        {/* User Cards */}
        <div className="row g-4">
          {filteredUsers.map((user) => (
            <div className="col-md-4" key={user.userID}>
              <div className="card h-100 shadow-sm border-0 position-relative">
                <span
                  className={`position-absolute top-0 end-0 m-3 badge rounded-pill ${
                    user.status === 1
                      ? "bg-success-subtle text-success"
                      : "bg-danger-subtle text-danger"
                  }`}
                >
                  {user.status === 1 ? "Hoạt động" : "Bị khóa"}
                </span>

                <div className="card-body text-center">
                  <img
                    src={user.avatarURL}
                    alt={user.fullName}
                    className="rounded-circle mb-3 shadow-sm"
                    width="90"
                    height="90"
                    style={{ objectFit: "cover" }}
                  />
                  <h6 className="fw-semibold">{user.fullName}</h6>
                  <p className="text-muted small mb-1">{user.email}</p>
                  <p className="text-secondary small mb-3">
                    Vai trò: <strong>{getRoleName(user.role)}</strong>
                  </p>

                  <div className="d-flex justify-content-center gap-2">
                    <Link
                      to={`/admin/users/${user.userID}`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Chi tiết
                    </Link>
                    <button
                      className={`btn btn-sm text-white ${
                        user.status === 1 ? "btn-danger" : "btn-success"
                      }`}
                      onClick={() => toggleStatus(user.userID, user.status)}
                    >
                      {user.status === 1 ? "Khóa" : "Mở khóa"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
