import React, { useEffect, useState } from "react";
import { Button, Card, Row, Col, Form, Modal } from "react-bootstrap";
import { useAdditionRestaurant } from "../../../../../hooks/useAdditionRestaurant";
// ===== MOCK DATA DEMO =====
const restaurants = [
  {
    id: 1,
    name: "Quảng Đại Gold",
    description: "Nhà hàng sang trọng, phù hợp tổ chức tiệc cưới & hội nghị.",
    address: { fullAddress: "8 30 Tháng 4, Hải Châu, Đà Nẵng" },
    halls: [
      { id: 1, name: "Sảnh Vàng", capacity: 300, area: 500, price: 10000000 },
      { id: 2, name: "Sảnh Bạc", capacity: 500, area: 800, price: 15000000 },
    ],
    menus: [
      {
        id: 1,
        name: "Menu Truyền Thống",
        price: 3500000,
        categories: [
          {
            name: "Khai vị",
            requiredQuantity: 1,
            dishes: [
              { id: 1, name: "Gỏi ngó sen tôm thịt" },
              { id: 2, name: "Súp cua gà xé" },
              { id: 3, name: "Chả giò hải sản" },
            ],
          },
          {
            name: "Món chính",
            requiredQuantity: 2,
            dishes: [
              { id: 4, name: "Gà hấp lá chanh" },
              { id: 5, name: "Bò nướng tiêu đen" },
              { id: 6, name: "Cá hấp xì dầu" },
              { id: 7, name: "Tôm rang me" },
            ],
          },
          {
            name: "Tráng miệng",
            requiredQuantity: 1,
            dishes: [
              { id: 8, name: "Chè hạt sen long nhãn" },
              { id: 9, name: "Rau câu dừa" },
            ],
          },
        ],
      },
      {
        id: 2,
        name: "Menu Cao Cấp",
        price: 4500000,
        categories: [
          {
            name: "Khai vị",
            requiredQuantity: 1,
            dishes: [
              { id: 10, name: "Gỏi tôm thịt đặc biệt" },
              { id: 11, name: "Nem nướng Huế" },
            ],
          },
          {
            name: "Món chính",
            requiredQuantity: 2,
            dishes: [
              { id: 12, name: "Tôm hùm nướng bơ tỏi" },
              { id: 13, name: "Bò Wagyu sốt tiêu đen" },
              { id: 14, name: "Cá tuyết hấp xì dầu" },
            ],
          },
          {
            name: "Tráng miệng",
            requiredQuantity: 1,
            dishes: [
              { id: 15, name: "Bánh flan caramel" },
              { id: 16, name: "Kem dừa non" },
            ],
          },
        ],
      },
    ],
    services: [
      {
        eventTypeID: 1,
        eventTypeName: "Tiệc cưới",
        list: [
          { id: 1, name: "Trang trí hoa tươi", price: 5000000 },
          { id: 2, name: "Ban nhạc sống", price: 8000000 },
          { id: 3, name: "MC chuyên nghiệp", price: 4000000 },
        ],
      },
      {
        eventTypeID: 2,
        eventTypeName: "Liên hoan",
        list: [
          { id: 4, name: "Máy chiếu & màn hình LED", price: 3000000 },
          { id: 5, name: "Hệ thống âm thanh ánh sáng", price: 6000000 },
        ],
      },
    ],
  },
];

// ===== MOCK BOOKING =====
const bookingMock = {
  bookingID: 1,
  customer: {
    fullName: "Nguyễn Văn A",
    phone: "0123456789",
    email: "nguyenvana@example.com",
  },
  restaurant: {
    name: restaurants[0].name,
    address: restaurants[0].address.fullAddress,
  },
  hall: restaurants[0].halls[0],
  eventType: "Tiệc cưới",
  eventDate: "2025-12-25",
  startTime: "18:00",
  endTime: "22:00",
  tableCount: 20,
  specialRequest: "Trang trí hoa hồng đỏ",
  status: 0,
  menu: restaurants[0].menus[0],
  services: [
    { id: 1, name: "Trang trí hoa tươi", quantity: 1, price: 5000000 },
    { id: 2, name: "Ban nhạc sống", quantity: 1, price: 8000000 },
  ],
};

export default function OverviewTab({ booking = bookingMock, onUpdateBooking }) {
  const PRIMARY = "#D81C45";
  const SUCCESS = "#198754";
  const { loadMenusByRestaurant, loadServicesByRestaurant } = useAdditionRestaurant();

  // =========================
  //  STATE CHÍNH
  // =========================
  const [localBooking, setLocalBooking] = useState(booking);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [tempMenu, setTempMenu] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [menus, setMenus] = useState([]);
  const [servicesOptions, setServicesOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const formatCurrency = (a) =>
    (a || 0).toLocaleString("vi-VN") + " VNĐ";

  const eventType = localBooking.eventType;
  const eventTypeID = localBooking.eventTypeID || localBooking.eventType?.eventTypeID;
  const displayMenu = isEditing ? editingData.menu : localBooking.menu;
  const displayServices = isEditing ? editingData.services : localBooking.services;
  const availableServices = (servicesOptions || [])
    .filter((s) => !eventTypeID || s.eventTypeID === eventTypeID)
    .map((s) => ({ id: s.serviceID || s.id, name: s.name, price: Number(s.price) || 0 }));

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!isEditing) return;
      const restaurantId = localBooking?.hall?.restaurantID || localBooking?.restaurant?.restaurantID;
      if (!restaurantId) return;
      setLoadingOptions(true);
      try {
        const [mns, svs] = await Promise.all([
          loadMenusByRestaurant(restaurantId),
          loadServicesByRestaurant(restaurantId),
        ]);
        if (ignore) return;
        setMenus(Array.isArray(mns) ? mns : []);
        setServicesOptions(Array.isArray(svs) ? svs : []);
      } catch (e) {
        if (!ignore) {
          setMenus([]);
          setServicesOptions([]);
        }
      } finally {
        if (!ignore) setLoadingOptions(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [isEditing, loadMenusByRestaurant, loadServicesByRestaurant, localBooking?.hall?.restaurantID, localBooking?.restaurant?.restaurantID]);

  // =========================
  //  TÍNH GIÁ
  // =========================
  const calculatePrices = () => {
    const data = isEditing ? editingData : localBooking;

    const hallPrice = data.hall?.price || 0;
    const menuPrice = (data.menu?.price || 0) * (data.tableCount || 0);
    const servicesTotal = (data.services || []).reduce(
      (sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1),
      0
    );

    const computedOriginal = hallPrice + menuPrice + servicesTotal;
    const originalPrice = Number(data.originalPrice) || computedOriginal;

    const promos = data.bookingpromotions || [];
    let discount = 0;
    let discountPercent = null;
    // Apply percent discount to (hall + menu) only, not services
    const discountBase = (data.hall?.price || 0) + ((data.menu?.price || 0) * (data.tableCount || 0));
    if (promos.length) {
      const p = promos[0]?.promotion;
      if (p && p.discountType === 0) {
        const pct = Number(p.discountValue) || 0;
        discount = Math.round(discountBase * pct / 100);
        discountPercent = pct;
      } else {
        // If fixed amount or other types come later, fallback to stored discountAmount when provided
        discount = Number(data.discountAmount) || 0;
      }
    } else {
      discount = Number(data.discountAmount) || 0;
    }

    const VAT = Number(data.VAT) || Math.round((originalPrice - discount) * 0.1);
    const total = Number(data.totalAmount) || (originalPrice - discount + VAT);

    return {
      hallPrice,
      menuPrice,
      servicesTotal,
      originalPrice,
      discount,
      discountPercent,
      VAT,
      total,
    };
  };

  const prices = calculatePrices();



  // =========================
  //  BẬT/TẮT EDIT
  // =========================
  const handleEditToggle = () => {
    if (isEditing) {
      if (!window.confirm("Thông tin chưa lưu, bạn có chắc muốn hủy?")) return;

      setEditingData({});
      setIsEditing(false);
      return;
    }

    // bật chế độ chỉnh sửa
    setEditingData(JSON.parse(JSON.stringify(localBooking)));
    setSelectedMenuId("");
    setSelectedDishes([]);
    setSelectedServiceIds(localBooking.services.map((s) => s.id));

    setIsEditing(true);
  };



  // =========================
  //  LƯU THAY ĐỔI
  // =========================
  const handleSaveChanges = () => {
    const { customer, tableCount, menu, services } = editingData;

    if (!customer.fullName || !customer.phone || !customer.email) {
      alert("Vui lòng nhập đầy đủ thông tin khách!");
      return;
    }
    if (!/^[0-9]+$/.test(customer.phone)) {
      alert("Số điện thoại chỉ được nhập số!");
      return;
    }
    if (tableCount < 1) {
      alert("Số lượng bàn phải > 0");
      return;
    }

    if (localBooking.status === 1) {
      editingData.status = 0;
    }

    setLocalBooking({ ...editingData });

    if (onUpdateBooking) {
      onUpdateBooking({ ...editingData });
    }

    sessionStorage.setItem("currentBooking", JSON.stringify(editingData));

    alert("Đã lưu thành công!");
    setIsEditing(false);
  };

  // =========================
  //  RENDER CHÍNH
  // =========================
  return (
    <div className="tab-pane fade show active">
      <Row>
        {/* ================================================
            THÔNG TIN ĐẶT TIỆC
        ================================================= */}
        <Col lg={8}>
          <Card className="mb-3 shadow-sm border-0">
            <Card.Header
              className="bg-transparent d-flex justify-content-between align-items-center"
            >
              <h5 className="mb-0" style={{ color: PRIMARY }}>
                <i className="fas fa-calendar-alt me-2"></i>Thông tin đặt tiệc
              </h5>

              {/* ====== NÚT THEO STATUS ====== */}
              {(localBooking.status === 0 || localBooking.status === 1) && (
                !isEditing ? (
                  <Button
                    size="sm"
                    style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
                    onClick={handleEditToggle}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div>
                    <Button
                      size="sm"
                      className="me-2"
                      style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
                      onClick={handleEditToggle}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      style={{ backgroundColor: SUCCESS, borderColor: SUCCESS }}
                      onClick={handleSaveChanges}
                    >
                      Lưu
                    </Button>
                  </div>
                )
              )}
            </Card.Header>

            <Card.Body>
              <Row>
                <Col md={6}>
                  {isEditing ? (
                    <>
                      <Form.Group className="mb-2">
                        <Form.Label>Tên khách hàng</Form.Label>
                        <Form.Control
                          value={editingData.customer.fullName}
                          onChange={(e) =>
                            setEditingData((prev) => ({
                              ...prev,
                              customer: {
                                ...prev.customer,
                                fullName: e.target.value,
                              },
                            }))
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control
                          type="text"
                          value={editingData.customer.phone}
                          onChange={(e) => {
                            let val = e.target.value;

                            // Chỉ cho nhập số
                            val = val.replace(/\D/g, "");

                            // Giới hạn tối đa 10 chữ số
                            if (val.length > 10) return;

                            setEditingData((prev) => ({
                              ...prev,
                              customer: { ...prev.customer, phone: val },
                            }));
                          }}
                          maxLength={10}
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          value={editingData.customer.email}
                          onChange={(e) =>
                            setEditingData((prev) => ({
                              ...prev,
                              customer: {
                                ...prev.customer,
                                email: e.target.value,
                              },
                            }))
                          }
                        />
                      </Form.Group>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong style={{ color: PRIMARY }}>Khách hàng:</strong> {localBooking.customer.fullName}
                      </p>
                      <p>
                        <strong style={{ color: PRIMARY }}>Số điện thoại:</strong> {localBooking.customer.phone}
                      </p>
                      <p>
                        <strong style={{ color: PRIMARY }}>Email:</strong> {localBooking.customer.email}
                      </p>
                    </>
                  )}
                </Col>

                <Col md={6}>
                  <p>
                    <strong style={{ color: PRIMARY }}>Nhà hàng:</strong> {localBooking.restaurant.name}
                  </p>
                  <p>
                    <strong style={{ color: PRIMARY }}>Địa chỉ:</strong> {localBooking.restaurant.address}
                  </p>
                  <p>
                    <strong style={{ color: PRIMARY }}>Loại sự kiện:</strong> {localBooking.eventType}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ================================================
              THÔNG TIN SẢNH + BÀN
          ================================================= */}
          <Card className="mb-3 shadow-sm border-0">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0" style={{ color: PRIMARY }}>
                <i className="fas fa-chair me-2"></i>Thông tin sảnh & bàn
              </h5>
            </Card.Header>

            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong style={{ color: PRIMARY }}>Tên sảnh:</strong> {localBooking.hall.name}</p>
                  <p><strong style={{ color: PRIMARY }}>Sức chứa:</strong> {localBooking.hall.capacity} khách</p>
                  <p><strong style={{ color: PRIMARY }}>Giá thuê:</strong> {formatCurrency(localBooking.hall.price)}</p>
                </Col>

                <Col md={6}>
                  <Form.Group
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Form.Label style={{ whiteSpace: "nowrap", margin: 0 }}>
                      <strong style={{ color: PRIMARY }}>Số bàn:</strong>
                    </Form.Label>

                    {isEditing ? (
                      <Form.Control
                        type="number"
                        min="1"
                        style={{ width: "90px" }}
                        value={editingData.tableCount}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            tableCount: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{localBooking.tableCount} bàn</p>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ================================================
              MENU + DỊCH VỤ
          ================================================= */}
          <Card className="shadow-sm border-0">
            <Card.Header
              className="bg-transparent d-flex justify-content-between align-items-center"
            >
              <h5 className="mb-0" style={{ color: PRIMARY }}>
                <i className="fas fa-utensils me-2"></i>Menu & Dịch vụ
              </h5>

              {isEditing && (
                <div>
                  <Button
                    size="sm"
                    className="me-2"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #D81C45",
                      color: "#D81C45",
                    }}
                    onClick={() => {
                      setSelectedDishes([]);
                      setSelectedMenuId("");
                      setShowMenuModal(true);
                    }}
                  >
                    Chọn Menu
                  </Button>

                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #D81C45",
                      color: "#D81C45",
                    }}
                    onClick={() => setShowServiceModal(true)}
                  >
                    Chọn Dịch vụ
                  </Button>
                </div>
              )}
            </Card.Header>

            {/* ==== HIỂN THỊ MENU ==== */}
            <Card.Body>
              <h6 className="fw-bold" style={{ color: PRIMARY }}>Menu đã chọn:</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>{displayMenu?.name || 'Chưa chọn menu'}</span>
                <span style={{ fontWeight: 500, color: SUCCESS }}>
                  {formatCurrency(displayMenu?.price || 0)}
                </span>
              </div>

              {displayMenu && displayMenu.categories && displayMenu.categories.map((cat, i) => (
                <div key={i} className="ms-3 mb-2">
                  <strong className="text-uppercase" style={{ color: PRIMARY }}>
                    {cat.name}:
                  </strong>
                  <ul>
                    {cat.dishes && cat.dishes.map((d, idx) => (
                      <li key={d?.id || idx}>{d?.name || 'Unknown dish'}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <hr />

              {/* ==== HIỂN THỊ DỊCH VỤ ==== */}
              <h6 className="fw-bold" style={{ color: PRIMARY }}>Dịch vụ bổ sung:</h6>

              {displayServices && displayServices.map((s, index) => (
                <div
                  key={s?.id || index}
                  className="d-flex justify-content-between border-bottom small py-1"
                >
                  <span>{s?.name || 'Unknown service'}</span>
                  <span>{formatCurrency(s?.price || 0)}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* ================================================
            TÓM TẮT THANH TOÁN
        ================================================= */}
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0" style={{ color: PRIMARY }}>
                <i className="fas fa-receipt me-2"></i>Tóm tắt thanh toán
              </h5>
            </Card.Header>

            <Card.Body>

              {/* ====== Tổng từng phần ====== */}
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #eee",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  marginBottom: "12px",
                }}
              >
                <div className="d-flex justify-content-between mb-1">
                  <span>Sảnh</span>
                  <span>{formatCurrency(prices.hallPrice)}</span>
                </div>

                <div className="d-flex justify-content-between mb-1">
                  <span>Menu ({(isEditing ? editingData : localBooking).tableCount} bàn)</span>
                  <span>{formatCurrency(prices.menuPrice)}</span>
                </div>

                <div className="d-flex justify-content-between mb-1">
                  <span>Dịch vụ</span>
                  <span>{formatCurrency(prices.servicesTotal)}</span>
                </div>

                <hr className="my-2" />

                <div className="d-flex justify-content-between fw-bold">
                  <span>Tổng giá gốc</span>
                  <span>{formatCurrency(prices.originalPrice)}</span>
                </div>
              </div>

              {/* ====== Giảm giá, VAT ====== */}
              <Row className="mb-2">
                <Col>
                  {prices.discountPercent ? `Giảm giá (${prices.discountPercent}%)` : 'Giảm giá'}:
                </Col>
                <Col className="text-end text-danger">
                  -{formatCurrency(prices.discount)}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col>VAT (10%):</Col>
                <Col className="text-end">{formatCurrency(prices.VAT)}</Col>
              </Row>

              <hr />

              {/* ====== Tổng cuối ====== */}
              <Row className="fw-bold mb-2">
                <Col>Tổng cộng:</Col>
                <Col className="text-end">{formatCurrency(prices.total)}</Col>
              </Row>
              {/* ====== NÚT XÁC NHẬN & HỦY BOOKING ====== */}
              {localBooking.status === 1 && !isEditing && (
                <div className="mt-3">

                  {/* Nút Xác nhận */}
                  <Button
                    className="w-100 mb-2"
                    style={{
                      backgroundColor: PRIMARY,
                      borderColor: PRIMARY,
                      padding: "10px 0",
                      fontWeight: "600",
                      borderRadius: "8px"
                    }}
                    onClick={() => {
                      if (!window.confirm("Bạn xác nhận muốn đặt tiệc này chứ?")) return;

                      const updated = { ...localBooking, status: 3 };
                      setLocalBooking(updated);

                      sessionStorage.setItem("currentBooking", JSON.stringify(updated));

                      alert("Bạn đã xác nhận booking!");
                    }}
                  >
                    Xác nhận đặt tiệc
                  </Button>

                  {/* Nút Hủy */}
                  <Button
                    className="w-100"
                    style={{
                      backgroundColor: "white",
                      color: PRIMARY,
                      border: `2px solid ${PRIMARY}`,
                      padding: "10px 0",
                      fontWeight: "600",
                      borderRadius: "8px"
                    }}
                    onClick={() => {
                      if (!window.confirm("Bạn có chắc muốn hủy booking?")) return;

                      const updated = { ...localBooking, status: 6 };

                      setLocalBooking(updated);
                      sessionStorage.setItem("currentBooking", JSON.stringify(updated));

                      if (onUpdateBooking) onUpdateBooking(updated);

                      alert("Bạn đã hủy booking.");
                    }}
                  >
                    Hủy đặt tiệc
                  </Button>
                </div>
              )}

            </Card.Body>
          </Card>

        </Col>
      </Row>

      {/* ================================================
          MODAL MENU
      ================================================= */}
      <Modal show={showMenuModal} onHide={() => setShowMenuModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: PRIMARY }}>Chọn menu</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Select
            style={{ borderColor: PRIMARY }}
            value={selectedMenuId}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              setSelectedMenuId(id);
              setTempMenu((menus || []).find((m) => (m.menuID || m.id) === id));
              setSelectedDishes([]);
            }}
          >
            <option value="">-- Chọn --</option>
            {(menus || []).map((m) => (
              <option value={m.menuID || m.id} key={m.menuID || m.id}>
                {m.name} ({formatCurrency(Number(m.price) || 0)})
              </option>
            ))}
          </Form.Select>

          {tempMenu && (
            <>
              <h6 className="mt-3" style={{ color: PRIMARY }}>
                Món trong {tempMenu.name}:
              </h6>

              {tempMenu.categories && tempMenu.categories.map((cat, ci) => (
                <Card key={ci} className="mb-2">
                  <Card.Header style={{ color: PRIMARY }}>{cat.name}</Card.Header>
                  <Card.Body>
                    {cat.dishes && cat.dishes.map((dish, idx) => {
                      const selectedInCat = cat.dishes.filter((d) =>
                        selectedDishes.includes(d.name)
                      ).length;
                      const isSelected = selectedDishes.includes(dish.name);
                      const isFull =
                        selectedInCat >= (cat.requiredQuantity || cat.category?.requiredQuantity || 1);

                      return (
                        <div
                          key={dish?.id || idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor:
                              isFull && !isSelected ? "not-allowed" : "pointer",
                            opacity: isFull && !isSelected ? 0.4 : 1,
                          }}
                          onClick={() => {
                            if (isFull && !isSelected) return;

                            setSelectedDishes((prev) =>
                              isSelected
                                ? prev.filter((d) => d !== dish.name)
                                : [...prev, dish.name]
                            );
                          }}
                        >
                          {!isFull || isSelected ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              style={{
                                width: "18px",
                                height: "18px",
                                accentColor: PRIMARY,
                                margin: 0,
                              }}
                            />
                          ) : (
                            <div style={{ width: "18px" }}></div>
                          )}

                          <span>{dish?.name || 'Unknown dish'}</span>
                        </div>
                      );
                    })}
                  </Card.Body>
                </Card>
              ))}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
            onClick={() => {
              if (!tempMenu) return;

              const invalid = tempMenu.categories.filter((cat) => {
                const count = cat.dishes.filter((d) =>
                  selectedDishes.includes(d.name)
                ).length;

                const required = cat.requiredQuantity || cat.category?.requiredQuantity || 0;
                return count !== required;
              });

              if (invalid.length > 0) {
                alert("Số món đã chọn không đúng yêu cầu!");
                return;
              }

              const newMenu = {
                ...tempMenu,
                categories: tempMenu.categories.map((cat) => ({
                  ...cat,
                  dishes: cat.dishes.filter((d) =>
                    selectedDishes.includes(d.name)
                  ),
                })),
              };

              setEditingData((prev) => ({
                ...prev,
                menu: newMenu,
              }));

              setShowMenuModal(false);
            }}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>


      {/* ================================================
          MODAL DỊCH VỤ
      ================================================= */}
      <Modal
        show={showServiceModal}
        onHide={() => setShowServiceModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: PRIMARY }}>Chọn dịch vụ</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {availableServices.map((s, index) => (
            <div
              key={s?.id || index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedServiceIds((prev) =>
                  prev.includes(s.id)
                    ? prev.filter((x) => x !== s.id)
                    : [...prev, s.id]
                );
              }}
            >
              <input
                type="checkbox"
                checked={selectedServiceIds.includes(s.id)}
                readOnly
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: PRIMARY,
                }}
              />
              <span>
                {s?.name || 'Unknown'} ({formatCurrency(s?.price || 0)})
              </span>
            </div>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
            Hủy
          </Button>

          <Button
            style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
            onClick={() => {
              const chosen = availableServices.filter((s) =>
                selectedServiceIds.includes(s.id)
              );

              setEditingData((prev) => ({
                ...prev,
                services: chosen,
              }));

              setShowServiceModal(false);
            }}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
