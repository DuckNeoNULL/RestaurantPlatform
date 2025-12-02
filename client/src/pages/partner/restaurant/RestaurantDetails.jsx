import React, { useState } from "react";
import { Tabs, Tab, Alert } from "react-bootstrap";
import AppLayout from "../../../layouts/PartnerLayout";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useRestaurant } from "../../../hooks/useRestaurant";
import { useEventType } from "../../../hooks/useEventType";
// Import từng tab component
import RestaurantProfile from "./RestaurantProfile";
import RestaurantHalls from "./HallListPage";
import MenuManagement from "./MenuListPage";
import DishManagement from "./DishListPage";
import ServiceListPage from "./ServiceListPage";
import AmenityListPage from "./AmenityListPage";
import PromotionListPage from "./PromotionListPage";
export default function RestaurantDetail() {
  const { id } = useParams();
  const restaurantId = parseInt(id, 10);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loadById, updateOne } = useRestaurant();
  const {
    items: allEventTypes = [],
    loading: eventTypesLoading,
    error: eventTypesError,
    loadAll: loadAllEventTypes,
  } = useEventType();
  useEffect(() => {
    if (!id) return;
    let ignore = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const data = await loadById(restaurantId);
        if (!ignore) setRestaurant(data);
      } catch (e) {
        if (!ignore) setError(e.message || "Không thể tải nhà hàng");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, restaurantId]);

  // Load supported event types once for the profile tab
  useEffect(() => {
    loadAllEventTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeTab, setActiveTab] = useState("profile"); // <-- quản lý active tab

  if (loading) {
    return (
      <AppLayout>
        <div className="mt-3 text-center text-muted">Đang tải...</div>
      </AppLayout>
    );
  }
  if (error) {
    return (
      <AppLayout>
        <Alert variant="danger" className="mt-3">{error}</Alert>
      </AppLayout>
    );
  }
  if (!restaurant) {
    return (
      <AppLayout>
        <Alert variant="danger" className="mt-3">
          Không tìm thấy nhà hàng với ID: {id}
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h2 className="mb-4">Chi tiết nhà hàng</h2>
      <Tabs
        activeKey={activeTab}   // <-- dùng state
        onSelect={(k) => setActiveTab(k)} // cập nhật state khi chuyển tab
        id="restaurant-tabs"
        className="mb-3"
      >
        <Tab eventKey="profile" title="Hồ sơ">
          {/* Pass real event types from store instead of hardcoded list */}
          {eventTypesError && (
            <Alert variant="warning" className="mb-2">
              Không tải được danh sách loại sự kiện. Bạn vẫn có thể tiếp tục chỉnh sửa thông tin khác.
            </Alert>
          )}
          <RestaurantProfile
            restaurant={restaurant}
            allEventTypes={allEventTypes}
          />
        </Tab>
        <Tab eventKey="amenities" title="Tiện nghi">
          <AmenityListPage restaurant={restaurant} onUpdated={setRestaurant} />
        </Tab>
        <Tab eventKey="halls" title="Sảnh tiệc">
          <RestaurantHalls
            restaurant={restaurant}
            setActiveTab={setActiveTab} // <-- truyền setter xuống HallList
          />
        </Tab>
        <Tab eventKey="menu" title="Thực đơn">
          <MenuManagement />
        </Tab>
        <Tab eventKey="dishes" title="Món ăn">
          <DishManagement />
        </Tab>
        <Tab eventKey="services" title="Dịch vụ">
          <ServiceListPage restaurant={restaurant} />
        </Tab>
        <Tab eventKey="promotions" title="Ưu đãi">
          <PromotionListPage />
        </Tab>
      </Tabs>
    </AppLayout>
  );
}