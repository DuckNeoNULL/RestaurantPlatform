import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ListGroup,
  Accordion,
  Form,
  Badge,
} from "react-bootstrap";

const MenuSelectorModal = ({ menus = [], loadMenuDetails, loadDishCategoriesByRestaurant, restaurantId, onSelect }) => {
  const [show, setShow] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedDishes, setSelectedDishes] = useState({});
  const [menuDetails, setMenuDetails] = useState(null);
  const [loadingMenuDetails, setLoadingMenuDetails] = useState(false);
  const primaryColor = "#E11D48";
  // Load menu details when menu is selected
  useEffect(() => {
    // console.log('Selected Menu changed:', selectedMenu);
    if (selectedMenu?.id) {
      
      setLoadingMenuDetails(true);
      Promise.all([
        loadMenuDetails(selectedMenu.id),
        loadDishCategoriesByRestaurant(restaurantId)
      ])
        .then(([menuData, categories]) => {
          // Filter active categories
          const activeCategories = (categories || []).filter(cat => cat.status === 1);
          // Group dishes by categoryID (keep names + map name->dishID)
          const dishesByCategory = {};
          (menuData.dishes || []).forEach(dish => {
            if (!dishesByCategory[dish.categoryID]) {
              dishesByCategory[dish.categoryID] = { names: [], map: {} };
            }
            dishesByCategory[dish.categoryID].names.push(dish.name);
            dishesByCategory[dish.categoryID].map[dish.name] = dish.dishID;
          });
          
          // Assign dishes to categories
          const categoriesWithDishes = activeCategories.map(cat => ({
            ...cat,
            limit: cat.requiredQuantity || 0,
            dishes: dishesByCategory[cat.categoryID]?.names || [], // array of dish names (UI unchanged)
            dishMap: dishesByCategory[cat.categoryID]?.map || {}    // name -> dishID
          }));
          
          // Merge into menuData
          const menuWithCategories = {
            ...menuData,
            categories: categoriesWithDishes
          };
          setMenuDetails(menuWithCategories);
          setLoadingMenuDetails(false);
        })
        .catch((error) => {
          console.error('Error loading menu details or categories:', error);
          setMenuDetails(null);
          setLoadingMenuDetails(false);
        });
    } else {
      setMenuDetails(null);
      setLoadingMenuDetails(false);
    }
  }, [selectedMenu?.id, loadMenuDetails, loadDishCategoriesByRestaurant, restaurantId]);

  // Reset selected dishes when menu changes
  useEffect(() => {
    setSelectedDishes({});
  }, [selectedMenu]);

  // Khi chọn menu
  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
    setSelectedDishes({});
  };

  // Khi chọn món trong category
  const handleDishToggle = (categoryName, dish, limit) => {
    setSelectedDishes((prev) => {
      const current = prev[categoryName] || [];
      const isSelected = current.includes(dish);
      let updated;
      if (isSelected) {
        updated = current.filter((d) => d !== dish);
      } else {
        if (current.length >= limit) return prev; // không vượt quá giới hạn
        updated = [...current, dish];
      }
      return { ...prev, [categoryName]: updated };
    });
  };

  // Kiểm tra tất cả category đã đủ món chưa
  const allCategoriesSelected = () => {
    if (!menuDetails?.categories) return false;
    return menuDetails.categories.every((cat) => {
      const current = selectedDishes[cat.name] || [];
      return current.length === cat.limit;
    });
  };

  // Hoàn tất chọn
  const handleConfirm = () => {
    // Derive dishIDs from selected dish names using dishMap
    const dishIDSet = new Set();
    const dishesPreview = {};
    Object.entries(selectedDishes).forEach(([catName, dishNames]) => {
      // Find matching category
      const categoryObj = (menuDetails?.categories || []).find(c => c.name === catName);
      const map = categoryObj?.dishMap || {};
      dishesPreview[catName] = dishNames; // already names
      dishNames.forEach(name => {
        const id = map[name];
        if (id != null) dishIDSet.add(id);
      });
    });
    const dishIDs = Array.from(dishIDSet);
    onSelect({
      menu: menuDetails || selectedMenu,
      dishes: dishesPreview,
      dishIDs,
    });
    setShow(false);
  };

  return (
    <>
      <Button
        variant="outline-danger"
        onClick={() => setShow(true)}
      >
        {selectedMenu ? selectedMenu.name : "Chọn thực đơn"}
      </Button>

      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMenu ? "Chọn món ăn" : "Chọn thực đơn"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Nếu chưa chọn menu → hiển thị danh sách menu */}
          {!selectedMenu && (
            <ListGroup>
              {(menus || []).map((menu) => (
                <ListGroup.Item
                  key={menu.id}
                  action
                  onClick={() => handleMenuSelect(menu)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{menu.name}</strong>
                    <div className="text-muted small">{menu.description}</div>
                  </div>
                  <span style={{ color: primaryColor, fontWeight: "500" }}>
                    {menu.price}₫/ bàn
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {/* Nếu đã chọn menu → hiển thị danh sách món */}
          {selectedMenu && (
            <>
              <h5 className="mb-3" style={{ color: primaryColor }}>
                {selectedMenu?.name}
              </h5>

              {loadingMenuDetails ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <div className="mt-2 text-muted">Đang tải dữ liệu menu...</div>
                </div>
              ) : (
                <Accordion>
                  {(menuDetails?.categories || []).map((cat, idx) => (
                    <Accordion.Item eventKey={idx.toString()} key={cat.name}>
                      <Accordion.Header>
                        {cat.name}{" "}
                        <Badge
                          bg="light"
                          text="dark"
                          className="ms-2"
                          style={{
                            border: `1px solid ${primaryColor}`,
                            fontSize: "12px",
                          }}
                        >
                          Số lượng phải chọn: {cat.limit}
                        </Badge>
                      </Accordion.Header>
                      <Accordion.Body>
                        {(cat.dishes || []).map((dish) => {
                          const current = selectedDishes[cat.name] || [];
                          const isChecked = current.includes(dish);
                          const disabled =
                            !isChecked && current.length == cat.limit;
                          return (
                            <Form.Check
                              key={dish}
                              type="checkbox"
                              id={`${cat.name}-${dish}`}
                              label={dish}
                              checked={isChecked}
                              disabled={disabled}
                              onChange={() =>
                                handleDishToggle(cat.name, dish, cat.limit)
                              }
                              className="mb-2"
                            />
                          );
                        })}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {selectedMenu && (
            <Button
              variant="secondary"
              onClick={() => setSelectedMenu(null)}
              style={{ border: "none" }}
            >
              ← Quay lại danh sách menu
            </Button>
          )}
          <Button
            variant="danger"
            style={{
              backgroundColor: primaryColor,
              border: "none",
            }}
            disabled={!selectedMenu || !allCategoriesSelected()}
            onClick={handleConfirm}
          >
            Xác nhận lựa chọn
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MenuSelectorModal;