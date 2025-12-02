import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import BookingForm from "./BookingForm";
import PriceSummaryPanel from "./PriceSummaryPanel";
import SubmitBookingButton from "./SubmitBookingButton";
import useBooking from "../../../hooks/useBooking";
import MainLayout from "../../../layouts/MainLayout";
import useAuth from "../../../hooks/useAuth";
import { Col, Row } from "react-bootstrap";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";

const BookingPage = () => {
  const location = useLocation();
  const stateRestaurant = location?.state?.restaurant;
  const stateHall = location?.state?.hall; // Receive full hall object
  const searchData = location?.state?.searchData;
  const restaurantID = stateRestaurant?.restaurantID;
  const { user } = useAuth();
  const { setBookingField, booking } = useBooking();
  const { loadPromotions, promotions } = useAdditionRestaurant();
  
  // Use restaurant from state; fallback to mock
  const restaurant = stateRestaurant || {};
  let fitlerMenu = Array.isArray(restaurant?.menus) ? restaurant.menus : [];
  let fitlerServices = Array.isArray(restaurant?.services) ? restaurant.services : [];
  fitlerMenu=fitlerMenu.filter(menu => menu.status === 1);
  fitlerServices=fitlerServices.filter(service => service.status === 1);
  // Prepare menus mapped for MenuSelectorModal: { 
  //id, name, price, categories: [{ name, limit, dishes: [string] }] }
  const menus = useMemo(() => {
    const src = fitlerMenu;
    return src.map((m) => ({
      id: m.id ?? m.menuID ?? m.name,
      name: m.name || 'Menu không tên',
      price: m.price ?? m.basePrice ?? 0,
      description: m.description || "",
      categories: Array.isArray(m.categories) ? m.categories.map((c) => ({
        name: c.name || 'Danh mục không tên',
        limit: c.requiredQuantity ?? c.limit ?? 0,
        dishes: Array.isArray(c.dishes) ? c.dishes.map((d) => (typeof d === "string" ? d : d?.name)).filter(Boolean) : [],
      })) : [],
    }));
  }, [restaurant]);

  // Prepare services for ServiceSelector
  const services = useMemo(() => {
    const svc = fitlerServices;
    return svc.map((s) => ({
      id: s.id ?? s.serviceID ?? s.name,
      name: s.name || 'Dịch vụ không tên',
      price: s.price ?? s.basePrice ?? 0,
      eventTypeID: s.eventTypeID || null,
    }));
  }, [restaurant]);

  // Prefill booking info from effective restaurant and hall
  useEffect(() => {

    if (!restaurant) return;
    try {
      setBookingField("eventTypeID", searchData?.eventType || ""); 
      setBookingField("restaurant", restaurant.name || "");
      setBookingField("tables", searchData?.tables || 0);

      if (stateHall) {
        setBookingField("hall", stateHall.name || "");
        setBookingField("hallPrice", stateHall.price || 0);
        // Store hallID as well for later submit payload
        setBookingField("hallID", stateHall.hallID ?? stateHall.id);
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant, stateHall]);

  // Load promotions based on searchData
  useEffect(() => {
   
    if (searchData && restaurantID) {
      loadPromotions({
        // eventType: searchData.eventType,
        date: searchData.date,
        tables: searchData.tables,
        restaurantId: restaurantID,
      }).catch(() => {});
    }
  }, [searchData, restaurantID, loadPromotions]);
  return (
    <MainLayout>
      <main className="container mx-auto px-4 py-12 space-y-12">
        <Row>
          <Col xs={12} md={6} lg={7} >
            <BookingForm menus={menus} services={services} restaurant={restaurant} hall={stateHall} user={user} searchData={searchData} promotions={promotions} />
          </Col>
          <Col xs={12} md={6} lg={5} >
            <PriceSummaryPanel />
          </Col>
        </Row>
      </main>
    </MainLayout >
  );
};

export default BookingPage;