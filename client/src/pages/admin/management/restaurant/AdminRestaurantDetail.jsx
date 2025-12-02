import React, { useEffect, useState } from "react";
import { Tabs, Tab, Alert } from "react-bootstrap";
import AdminLayout from "../../../../layouts/AdminLayout";
import axios from "axios";
import { useParams } from "react-router-dom";

import RestaurantProfile from "../../../partner/restaurant/RestaurantProfile";
import RestaurantHalls from "../../../partner/restaurant/HallListPage";
import MenuManagement from "../../../partner/restaurant/MenuListPage";
import DishManagement from "../../../partner/restaurant/DishListPage";
import ServiceListPage from "../../../partner/restaurant/ServiceListPage";
import AmenityListPage from "../../../partner/restaurant/AmenityListPage";
import PromotionListPage from "../../../partner/restaurant/PromotionListPage";

export default function AdminRestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const res = await axios.get(`/api/restaurants/${id}`);
        setRestaurant(res.data);
      } catch (error) {
        console.error("❌ Error loading restaurant:", error);
        setRestaurant(null);
      }
    };

    loadRestaurant();
  }, [id]);

  if (!restaurant) {
    return (
      <AdminLayout>
        <Alert variant="danger" className="mt-3">
          Không tìm thấy nhà hàng với ID: {id}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chi tiết nhà hàng (Admin)">
      <div className="container py-4">
        <h2 className="mb-4">{restaurant.name}</h2>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          id="restaurant-tabs"
          className="mb-3"
        >
          <Tab eventKey="profile" title="Hồ sơ">
            <RestaurantProfile restaurant={restaurant} readOnly={true} />
          </Tab>

          <Tab eventKey="amenities" title="Tiện nghi">
            <AmenityListPage restaurantId={restaurant.restaurantID} readOnly={true} />
          </Tab>

          <Tab eventKey="halls" title="Sảnh tiệc">
            <RestaurantHalls restaurantId={restaurant.restaurantID} readOnly={true} />
          </Tab>

          <Tab eventKey="menu" title="Thực đơn">
            <MenuManagement restaurantId={restaurant.restaurantID} readOnly={true} />
          </Tab>

          <Tab eventKey="dishes" title="Món ăn">
            <DishManagement restaurantId={restaurant.restaurantID} readOnly={true} />
          </Tab>

          <Tab eventKey="services" title="Dịch vụ">
            <ServiceListPage restaurantId={restaurant.restaurantID} readOnly={true} />
          </Tab>

          <Tab eventKey="promotions" title="Ưu đãi">
            <PromotionListPage restaurantId={restaurant.restaurantID} readOnly={true} />
          </Tab>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
