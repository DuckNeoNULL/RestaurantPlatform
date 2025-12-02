import React, { useEffect, useState } from "react";
import { Table, Button, Badge, InputGroup, FormControl } from "react-bootstrap";
import AdminLayout from "../../../../layouts/AdminLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminRestaurantList() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");

  // 🟦 Load từ backend
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/restaurants");
      setRestaurants(res.data);
    } catch (error) {
      console.error("❌ Error loading restaurants: ", error);
    }
  };

  // 🟦 Tìm kiếm
  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🟦 Format trạng thái
  const getStatusBadge = (status) => {
    const active = Number(status) === 1;

    return active ? (
      <Badge bg="success" pill>
        Đang hoạt động
      </Badge>
    ) : (
      <Badge bg="secondary" pill>
        Ngừng hoạt động
      </Badge>
    );
  };

  // 🟦 Lấy tên đối tác
  const getPartnerName = (r) => {
  return (
    r.partner?.owner?.fullName ||
    r.partner?.owner?.email ||
    "—"
  );
};

  // 🟦 Đi vào chi tiết
  const handleViewDetail = (id) => {
    navigate(`/admin/restaurants/${id}`);
  };

  return (
    <AdminLayout title="Danh sách nhà hàng">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0">Danh sách nhà hàng</h2>
          <div style={{ maxWidth: "320px" }}>
            <InputGroup>
              <FormControl
                placeholder="Tìm kiếm nhà hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline-primary">
                <i className="fas fa-search"></i>
              </Button>
            </InputGroup>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="fas fa-info-circle fa-2x mb-2"></i>
            <p>Không tìm thấy nhà hàng nào phù hợp.</p>
          </div>
        ) : (
          <div className="table-responsive shadow-sm rounded-4">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light text-muted">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Tên nhà hàng</th>
                  <th>Địa chỉ</th>
                  <th>Đối tác</th>
                  <th>Trạng thái</th>
                  <th className="text-end" style={{ width: "150px" }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, index) => (
                  <tr key={r.restaurantID}>
                    <td>{index + 1}</td>

                    {/* Tên nhà hàng + thumbnail */}
                    <td className="fw-semibold">
                      <div className="d-flex align-items-center">
                        <img
                          src={r.thumbnailURL}
                          alt={r.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            marginRight: "10px",
                          }}
                        />
                        <span>{r.name}</span>
                      </div>
                    </td>

                    <td>{r.address?.fullAddress || "—"}</td>

                    {/* Tên đối tác */}
                    <td>{getPartnerName(r)}</td>

                    <td>{getStatusBadge(r.status)}</td>

                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-3"
                        onClick={() => handleViewDetail(r.restaurantID)}
                      >
                        <i className="fas fa-eye me-1"></i> Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
