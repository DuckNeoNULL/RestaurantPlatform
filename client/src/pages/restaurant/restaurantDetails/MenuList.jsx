import React, { useState } from "react";
import "../../../styles/RestaurantDetailsStyles.css";
const MenuList = ({ restaurant }) => {
  const [hovered, setHovered] = useState(null);
  const menus =restaurant.menus?.filter(menu => menu.status === 1) || [];
  return (
    <div>
      <h4 className="section-title mb-3">Danh sách thực đơn</h4>

      <div className="row g-3">
        {menus.map((menu) => (
          <div key={menu.id} className="col-md-3">
            {/* Card menu với hover overlay */}
            <div
              className="menu-card position-relative rounded overflow-hidden"
              style={{
                cursor: "pointer",
                borderRadius: "12px",
                height: "180px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
              data-bs-toggle="modal"
              data-bs-target={`#menuModal-${menu.id}`}
              onMouseEnter={() => setHovered(menu.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <img
                src={menu.imageURL}
                alt={menu.name}
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />

              {/* Overlay */}
              <div
                className="overlay position-absolute bottom-0 w-100 text-white p-2"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  transform: hovered === menu.id ? "translateY(0)" : "translateY(100%)",
                  transition: "transform 0.28s ease",
                  zIndex: 2,
                  left: 0,
                }}
              >
                <p className="mb-1 fw-bold">{menu.name}</p>
                <p className="mb-0">
                  Giá: <strong>{menu.price?.toLocaleString()} VND / bàn</strong>
                </p>
              </div>
            </div>

            {/* Modal menu (giữ nguyên hoặc có thể bỏ tùy nhu cầu) */}
            <div
              className="modal fade"
              id={`menuModal-${menu.id}`}
              tabIndex="-1"
              aria-labelledby={`menuModalLabel-${menu.id}`}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                  <div
                    className="modal-header"
                  >
                    <h5 className="modal-title" id={`menuModalLabel-${menu.id}`}>
                      {menu.name} – {menu.price?.toLocaleString()} đ
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>

                  <div className="modal-body">
                    {menu.categories?.map((category) => (
                      <div key={category.categoryID} className="mb-4">
                        <h6 style={{ color: "#e80334", fontWeight: "bold" }}>
                          {category.name}
                          {category.requiredQuantity && (
                            <span className="text-muted"> (chọn {category.requiredQuantity})</span>
                          )}
                        </h6>
                        <div className="row g-2 mt-2">
                          {category.dishes?.map((dish) => (
                            <div key={dish.dishID} className="col-md-4">
                              <div className="card h-100 shadow-sm">
                                {dish.imageURL && (
                                  <img
                                    src={dish.imageURL}
                                    alt={dish.name}
                                    className="card-img-top"
                                    style={{ height: "120px", objectFit: "cover" }}
                                  />
                                )}
                                <div className="card-body p-2 text-center">
                                  <p className="mb-0 fw-bold">{dish.name}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuList;