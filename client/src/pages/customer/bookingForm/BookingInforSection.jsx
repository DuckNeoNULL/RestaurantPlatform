import React, { useEffect, useMemo, useState } from "react";
import DateInput from "../../../components/searchbar/DateInput";
import MenuSelectorModal from "./MenuSelectorModal";
import ServiceSelector from "./ServiceSelector";
import PromotionBadge from "./PromotionBadge";
import useBooking from "../../../hooks/useBooking";
import { Badge, Button, Col, Form, Row, Table } from "react-bootstrap";
import ServiceSelectorModal from "./ServiceSelectorModal";
import SpecialRequestSection from "./SpecialRequestSection";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";
const BookingInfoSection = ({
  menus = [],
  services = [],
  restaurant,
  hall,
  searchData,
  promotions,
}) => {
  const { booking, setBookingField, setMenu, setDishes, setServices } =
    useBooking();
  const { bookingInfo, menu } = booking;
  const [menuPreview, setMenuPreview] = useState(null);
  const [dishesPreview, setDishesPreview] = useState({});
  const [showMenuPreview, setShowMenuPreview] = useState(false);
  const [showServicePreview, setShowServicePreview] = useState(false);
 
  const { loadMenuById, loadDishCategoriesByRestaurant } = useAdditionRestaurant();

  // Check if data comes from search (should be locked)
  const isFromSearch = !!searchData;

  // Local state for editable fields
  const [date, setDate] = useState(searchData?.date || bookingInfo?.date || "");
  const [eventType, setEventType] = useState(
    searchData?.eventType || bookingInfo?.eventType || ""
  );
  const [tables, setTables] = useState(
    searchData?.tables || bookingInfo?.tables || 1
  );
  // Use hall object passed from props
 
  const serviceFiltered = useMemo(() => {
    // Filter services based on eventTypeID if provided
    if (!eventType) return services;
    const eventTypeNum = Number(eventType);
    return services.filter(service => 
      service.eventTypeID === eventTypeNum || 
      service.eventTypeID === null || 
      service.eventTypeID === undefined
    );
  }, [eventType, services]);
  const selectedHall = hall;
  // Update booking state when local state changes
  useEffect(() => {
    setBookingField("restaurant", restaurant?.name || "");
    setBookingField("hall", selectedHall?.name || "");
    // Only update these fields if not from search (to prevent overriding search data)
    if (!isFromSearch) {
      setBookingField("date", date);
      setBookingField("eventType", eventType);
      setBookingField("tables", tables);
    } else {
      // For search data, set them once
      setBookingField("date", searchData.date || date);
      setBookingField("eventType", searchData.eventType || eventType);
      setBookingField("tables", searchData.tables || tables);
    }
  }, [
    restaurant,
    selectedHall,
    date,
    eventType,
    tables,
    setBookingField,
    isFromSearch,
    searchData,
  ]);

  return (
    <section
      className="p-4 border rounded bg-white shadow-sm text-sm"
      style={{ fontSize: "0.95rem" }}
    >
      <h3 className="fw-bold mb-3" style={{ color: "#e11d48" }}>
        Chi tiết đặt chỗ
      </h3>
      <div className="mb-3">
        <Row className="mb-2">
          <Col xs={5} className="fw-semibold">
            Nhà hàng
          </Col>
          <Col>{restaurant?.name}</Col>
        </Row>

        <Row className="mb-2">
          <Col xs={5} className="fw-semibold">
            Sảnh
          </Col>
          <Col>{selectedHall?.name}</Col>
        </Row>

        <Row className="mb-2 align-items-center">
          <Col xs={5} className="fw-semibold">
            Ngày diễn ra{" "}
            {isFromSearch && (
              <span className="text-muted small">(được lock từ tìm kiếm)</span>
            )}
          </Col>
          <Col>
            <DateInput
              value={date}
              onChange={isFromSearch ? undefined : setDate}
              labelText=""
              disabled={isFromSearch}
            />
          </Col>
        </Row>

        <Row className="mb-2 align-items-center">
          <Col xs={5} className="fw-semibold">
            Loại sự kiện{" "}
            {isFromSearch && (
              <span className="text-muted small">(được lock từ tìm kiếm)</span>
            )}
          </Col>
          <Col>
            <Form.Select
              value={eventType}
              onChange={
                isFromSearch ? undefined : (e) => setEventType(e.target.value)
              }
              disabled={isFromSearch}
            >
              <option value="">Chọn loại sự kiện</option>
              {(restaurant?.eventTypes || []).map((et) => (
                <option key={et.eventTypeID || et} value={et.eventTypeID || et}>
                  {et.name || et}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-2 align-items-center">
          <Col xs={5} className="fw-semibold">
            Số bàn{" "}
            {isFromSearch && (
              <span className="text-muted small">(được lock từ tìm kiếm)</span>
            )}
          </Col>
          <Col>
            <Form.Control
              type="number"
              min={1}
              value={tables}
              onChange={
                isFromSearch
                  ? undefined
                  : (e) => setTables(Math.max(1, Number(e.target.value || 1)))
              }
              disabled={isFromSearch}
            />
          </Col>
        </Row>
      </div>

      {/* <div className="grid grid-cols-2 gap-3">
        <input name="restaurant" placeholder="Restaurant" value={bookingInfo.restaurant} disabled className="form-control bg-gray-50" />
        <input name="hall" placeholder="Hall" value={bookingInfo.hall} disabled className="form-control bg-gray-50" />
        <div>
          <label className="small">Ngày</label>
          <DateInput
            value={bookingInfo.date}
            onChange={(v) => setBookingField("date", v)}
            labelText="Ngày tổ chức"
          />
        </div>
        <div>
          <label className="small">Số bàn</label>
          <input
            name="tableCount"
            type="number"
            min={1}
            value={bookingInfo.tables}
            onChange={(e) => setBookingField("tables", Math.max(1, Number(e.target.value || 1)))}
            className="form-control"
          />
        </div>

        <div>
          <label className="small">Loại sự kiện</label>
          <select
            name="eventType"
            className="form-select"
            value={bookingInfo.eventType}
            onChange={(e) => setBookingField("eventType", e.target.value)}
          >
            <option>Tiệc cưới</option>
            <option>Sinh nhật</option>
            <option>Liên hoan</option>
            <option>Hội thảo</option>
            <option>Tiệc công ty</option>
          </select>
        </div> */}

      <div className="mb-3">
        <Row className="mb-2 align-items-center">
          <Col xs={5} className="fw-semibold">
            Thực đơn
          </Col>
          <Col className="d-flex justify-content-end gap-2">
            <MenuSelectorModal
              menus={menus}
              loadMenuDetails={loadMenuById}
              loadDishCategoriesByRestaurant={loadDishCategoriesByRestaurant}
              restaurantId={restaurant?.restaurantID}
              onSelect={(selection) => {
                // selection: { menu, dishes }
                const pickedMenu = selection.menu;
                const menuObj =
                  typeof pickedMenu === "string"
                    ? { name: pickedMenu }
                    : pickedMenu;
                setMenu(menuObj);
                setMenuPreview(menuObj);
                // Build full dish objects with real dishID using dishMap in categories
                const dishObjects = [];
                (menuObj.categories || []).forEach(cat => {
                  const selectedNames = (selection.dishes?.[cat.name] || []);
                  selectedNames.forEach(name => {
                    const realId = cat.dishMap?.[name];
                    dishObjects.push({ dishID: realId, name, categoryID: cat.categoryID });
                  });
                });
                setDishes(dishObjects);
                // Persist dishIDs separately in bookingInfo for submission
                if (Array.isArray(selection.dishIDs)) {
                  setBookingField('dishIDs', selection.dishIDs);
                }
                const dishesObj = {};
                Object.keys(selection.dishes).forEach((cat) => {
                  dishesObj[cat] = selection.dishes[cat];
                });
                setDishesPreview(dishesObj);
              }}
            />
            {menuPreview && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowMenuPreview((s) => !s)}
              >
                {showMenuPreview ? "Ẩn chi tiết" : "Xem chi tiết"}
              </Button>
            )}
          </Col>
        </Row>
        {/* Bảng hiển thị realtime từ state tạm */}
        {showMenuPreview && menuPreview && (
          <div className="mt-3">
            <Table striped bordered hover size="sm" responsive>
              <thead className="table-dark">
                <tr>
                  <th>Danh mục</th>
                  <th>Món ăn</th>
                  <th>Số lượng yêu cầu</th>
                </tr>
              </thead>
              <tbody>
                {menuPreview.categories.map((cat) => {
                  const catDishes = dishesPreview[cat.name] || [];
                  return (
                    <tr key={cat.name}>
                      <td className="fw-semibold">{cat.name}</td>
                      <td>
                        {catDishes.length > 0 ? (
                          catDishes.map((d, idx) => (
                            <Badge
                              key={idx}
                              bg="info"
                              text="dark"
                              pill
                              className="me-1 mb-1"
                            >
                              {d}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">Chưa chọn</span>
                        )}
                      </td>
                      <td>{cat.limit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>
      <div className="mb-3">
        <Row className="mb-2 align-items-center">
          <Col xs={5} className="fw-semibold">
            Dịch vụ
          </Col>
          <Col className="d-flex justify-content-end gap-2">
            <ServiceSelectorModal
              services={serviceFiltered}
              // eventTypeID={eventType.eventTypeID || eventType}
              onSelect={(payload) => {
                const svcList = (payload?.services || []).map((s) => ({
                  id: s.id,
                  serviceID: s.serviceID,
                  name: s.name,
                  price: s.price,
                  quantity: Number(s.quantity || 1),
                  unit: s.unit,
                }));
                setServices(svcList);
              }}
            />
            {services.length === 0 && (
              <div className="text-muted small mt-2">Không có dịch vụ bổ sung phù hợp với loại sự kiện này.</div>
            )}
            {booking.services.length > 0 && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowServicePreview((s) => !s)}
              >
                {showServicePreview ? "Ẩn chi tiết" : "Xem chi tiết"}
              </Button>
            )}
          </Col>
        </Row>

        {showServicePreview &&
          booking.services &&
          booking.services.length > 0 && (
            <div className="mt-3">
              <Table striped bordered hover size="sm" responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Dịch vụ</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.services.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.quantity ?? 1}</td>
                      <td>
                        {(s.price || 0).toLocaleString()}₫/ {s.unit}
                      </td>
                      <td>
                        {((s.price || 0) * (s.quantity || 1)).toLocaleString()}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
      </div>
      {/* <ServiceSelector services={services} /> */}
      <PromotionBadge promotions={promotions} tables={searchData.tables} menu={menu} services={booking.services} hallFee={selectedHall?.price || 0} />
      <SpecialRequestSection />
    </section>
  );
};

export default BookingInfoSection;
