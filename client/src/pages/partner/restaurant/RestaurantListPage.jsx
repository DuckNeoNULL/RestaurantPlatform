// File: RestaurantsPage.jsx
import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import AppLayout from "../../../layouts/PartnerLayout";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { useRestaurant } from "../../../hooks/useRestaurant";
// Removed mock initialRestaurants; data now loaded from backend
const RestaurantCard = (props) => {
  const navigate = useNavigate();
  // card-level actions handled via props
  const handleClick = () => {
    const confirmChange = window.confirm(
      `Bạn có chắc muốn ${props.r.status ? "ngừng hoạt động" : "kích hoạt lại"} nhà hàng "${props.r.name}" không?`
    );
    if (confirmChange) {
      props.onToggleStatus(props.r.restaurantID);
    }
  };
  return (
    <Card style={{ height: '100%' }}>
      <Card.Body>
        <Card.Title
          className="text-dark"
          style={{ cursor: "pointer", color: "black" }}
          onClick={() => navigate(`/partner/restaurants/detail/${props.r.restaurantID}`)}
        >{props.r.name}
        </Card.Title>
        <Card.Text>{props.r.address?.fullAddress || props.r.address || ""}</Card.Text>
        <div className="d-flex justify-content-between mb-3">
          <div>Số sảnh: <strong>{props.r.hallCount ?? 0}</strong></div>
          <div>Trạng thái: <strong>{props.r.status ? 'Đang hoạt động' : 'Ngừng hoạt động'}</strong></div>
        </div>
        <Button
          variant={props.r.status ? 'success' : 'danger'}
          className="text-white mb-3"
          onClick={handleClick}
        >
          {props.r.status ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Button>
      </Card.Body>
    </Card>
  );
}
const RestaurantsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { list, status, error, loadAllPartner, toggleStatus } = useRestaurant();
  // console.log(loadAllPartner(user?.userID));
  // Fetch partner-specific restaurants when user & partnerID ready
  useEffect(() => {
    if (!user) return;
    const partnerID = user?.userID || null;
    if (!partnerID) return;
    // only fetch if list is empty (avoid refetch spam on re-renders)
    if (!list || list.length === 0) {
      loadAllPartner(partnerID).catch(() => {/* error handled via slice */});
    }
  }, [user, list, loadAllPartner]);

  const handleAddRestaurant = () => {
    navigate("/partner/restaurants/new");
  };
  const handleToggleStatus = async (id) => {
    const ok = window.confirm("Bạn có chắc muốn đổi trạng thái nhà hàng này?");
    if (!ok) return;
    try {
      const current = list.find(r => r.restaurantID === id);
      const newStatus = current ? !current.status : true;
      await toggleStatus({ restaurantID: id, newStatus });
      // optimistic UI update if slice doesn't patch immediately
      // (Optional: if slice already updates, this can be removed)
      // NOTE: Since we're relying on Redux list, we skip local state update.
    } catch (e) {
      alert(e.message || "Đổi trạng thái thất bại");
    }
  };
  const filteredRestaurants = (list || []).filter(r => {
    const matchesSearch = (r.name || '').toLowerCase().includes(search.toLowerCase());
    const statusStr = r.status ? 'active' : 'inactive';
    const matchesFilter = filter === "all" || statusStr === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout>
      <div className="mb-4">
        <Row className="g-2 align-items-center">
          {/* Ô tìm kiếm */}
          <Col xs={12} md={4}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Tìm nhà hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Col>

          {/* Bộ lọc */}
          <Col xs={12} md={3}>
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </Form.Select>
          </Col>

          {/* Nút thêm mới */}
          <Col xs={12} md="auto">
            <Button variant="primary" className="w-100 w-md-auto" onClick={handleAddRestaurant}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: "500",
                padding: "8px 16px",
              }}>
              <i className="fa fa-plus"></i>Thêm nhà hàng mới
            </Button>
          </Col>
        </Row>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {status === 'loading' && (
          <div className="text-center text-muted">Đang tải...</div>
        )}
        {status === 'failed' && error && (
          <div className="text-center text-danger">{error}</div>
        )}
        {status !== 'loading' && !error && filteredRestaurants.map(r => (
          <Col key={r.restaurantID}>
            <RestaurantCard r={r} onToggleStatus={handleToggleStatus} />
          </Col>
        ))}
      </Row>
    </AppLayout>
  );
};

export default RestaurantsPage;
