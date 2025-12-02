import React, { useMemo, useState, useEffect } from "react";
import DishDetailPage from "./DishDetailPage";
import DishCreatePage from "./DishCreatePage";
import { useParams } from "react-router-dom";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";

export default function DishListPage({ readOnly = false }) {
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);

  const {
    dishes,
    dishCategories,
    status,
    loadDishesByRestaurant,
    loadDishCategoriesByRestaurant,
    createOneDishCategory,
    updateOneDishCategory,
    updateOneDish,
  } = useAdditionRestaurant();

  const [activeDish, setActiveDish] = useState(null);
  const [creatingDish, setCreatingDish] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  // Categories come from server via hook
  const categories = dishCategories || [];
  // Dedupe categories by categoryID/id to avoid duplicate cards (e.g., after updates)
  const uniqueCategories = useMemo(() => {
    const map = new Map();
    for (const c of categories) {
      const key = String((c && (c.categoryID ?? c.id)) ?? "");
      if (!key) continue;
      map.set(key, c); // last one wins
    }
    return Array.from(map.values());
  }, [categories]);
  // Sort categories: active (1) on top, inactive (0) at bottom
  const sortedCategories = useMemo(() => {
    const arr = Array.isArray(uniqueCategories) ? [...uniqueCategories] : [];
    return arr.sort((a, b) => {
      const sa = Number(a?.status) === 1 ? 1 : 0;
      const sb = Number(b?.status) === 1 ? 1 : 0;
      if (sb !== sa) return sb - sa; // active first
      // secondary stable order by categoryID
      return (a?.categoryID || 0) - (b?.categoryID || 0);
    });
  }, [uniqueCategories]);

  useEffect(() => {
    if (restaurantID) {
      Promise.all([
        loadDishesByRestaurant(restaurantID),
        loadDishCategoriesByRestaurant(restaurantID),
      ]).catch(() => {});
    }
  }, [restaurantID, loadDishesByRestaurant, loadDishCategoriesByRestaurant]);

  const handleAddCategory = async () => {
    if (readOnly) return;
    if (!restaurantID) {
      alert("Thiếu restaurantID trong URL");
      return;
    }
    // Tự tạo tên mặc định và thêm thẳng vào DB, tránh trùng bằng cách thử nhiều lần
    const base = "Loại mới";
    const existingNames = new Set((categories || []).map((c) => (c.name || "").trim().toLowerCase()));
    const genName = (i) => (i <= 1 ? base : `${base} ${i}`);

    let attempt = 1;
    while (attempt <= 20) {
      const candidate = genName(attempt);
      // Nếu trùng trong local, tăng tiếp để tránh gửi request không cần thiết
      if (existingNames.has(candidate.trim().toLowerCase())) {
        attempt += 1;
        continue;
      }
      try {
        const created = await createOneDishCategory({ restaurantID, name: candidate, requiredQuantity: 1, status: 1 });
        if (created?.categoryID) {
          // Không mở tạo món ngay; chỉ thêm card ở dưới cho phép sửa sau
          // Optional: cuộn xuống cuối danh sách
          setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }, 50);
        }
        break; // thành công => thoát vòng lặp
      } catch (err) {
        const msg = (err?.message || err || "").toString().toLowerCase();
        // Nếu là lỗi trùng tên (unique) thì thử tên khác; lỗi khác thì báo và dừng
        if (msg.includes("unique") || msg.includes("trùng") || msg.includes("duplicate") || msg.includes("already")) {
          attempt += 1;
          continue;
        }
        alert(`Tạo loại món thất bại: ${err?.message || err}`);
        break;
      }
    }
  };

  const handleUpdateCategory = async (id, field, value) => {
    if (readOnly) return;
    try {
      await updateOneDishCategory({ id, payload: { [field]: value } });
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`Cập nhật loại món thất bại: ${err?.message || err}`);
    }
  };

  const handleToggleCategoryStatus = async (id, currentStatus) => {
    if (readOnly) return;
    try {
      const cur = Number(currentStatus) === 1 ? 1 : 0;
      await updateOneDishCategory({ id, payload: { status: cur === 1 ? 0 : 1 } });
    } catch (err) {
      alert(`Đổi trạng thái loại món thất bại: ${err?.message || err}`);
    }
  };

  const handleAddDish = (categoryID) => {
    if (readOnly) return;
    setActiveCategory(categoryID);
    setCreatingDish(true);
  };

  const handleToggleDishStatus = async (dish) => {
    if (readOnly || !dish) return;
    const id = dish.dishID ?? dish.id;
    const cur = Number(dish.status) === 1 ? 1 : 0;
    const newStatus = cur === 1 ? 0 : 1;
    try {
      await updateOneDish({ id, payload: { status: newStatus } });
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`Đổi trạng thái thất bại: ${err?.message || err}`);
    }
  };

  const activeCategories = categories.filter((c) => c.status === 1);

  return (
    <>
      {creatingDish ? (
        readOnly ? (
          <div className="alert alert-secondary text-center mt-3">
            Chế độ chỉ xem: không thể thêm món mới.
          </div>
        ) : (
          <DishCreatePage
            categoryID={activeCategory}
            onBack={() => setCreatingDish(false)}
          />
        )
      ) : activeDish ? (
        <DishDetailPage dish={activeDish} onBack={() => setActiveDish(null)} readOnly={readOnly} />
      ) : (
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Danh sách món ăn theo loại</h3>
            {!readOnly && (
              <button
                className="btn btn-primary text-white"
                onClick={handleAddCategory}
              >
                + Thêm loại món
              </button>
            )}
          </div>

          {sortedCategories.map((cat) => {
            const categoryDishes = (dishes || []).filter(
              (d) => (d.categoryID ?? d.categoryId) === cat.categoryID
            );
            // Sort dishes: active first, then by name
            const sortedDishes = categoryDishes.slice().sort((a, b) => {
              const sa = Number(a?.status) === 1 ? 1 : 0;
              const sb = Number(b?.status) === 1 ? 1 : 0;
              if (sb !== sa) return sb - sa;
              return String(a?.name || "").localeCompare(String(b?.name || ""));
            });

            return (
              <div
                key={cat.categoryID}
                className={`border rounded-4 p-3 mb-4 shadow-sm ${
                  cat.status === 0 ? "bg-secondary-subtle" : "bg-light"
                }`}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => handleUpdateCategory(cat.categoryID, "name", e.target.value)}
                        className="form-control fw-bold"
                        style={{ width: "250px" }}
                        disabled={readOnly || cat.status === 0}
                      />
                      <span
                        className={`badge ${Number(cat.status) === 1 ? "bg-success" : "bg-secondary"}`}
                      >
                        {Number(cat.status) === 1 ? "Hoạt động" : "Đã ẩn"}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2 mt-2">
                      <label className="mb-0">Số món yêu cầu:</label>
                      <input
                        type="number"
                        value={cat.requiredQuantity}
                        onChange={(e) => handleUpdateCategory(cat.categoryID, "requiredQuantity", Number(e.target.value))}
                        className="form-control"
                        style={{ width: "80px" }}
                        disabled={readOnly || cat.status === 0}
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    {!readOnly && (
                      <>
                        <button
                          className="btn btn-success text-white"
                          onClick={() => handleAddDish(cat.categoryID)}
                          disabled={cat.status === 0}
                        >
                          + Thêm món
                        </button>
                        <button
                          className={`btn ${Number(cat.status) === 1 ? "btn-outline-danger" : "btn-outline-secondary"}`}
                          onClick={() => handleToggleCategoryStatus(cat.categoryID, cat.status)}
                        >
                          {Number(cat.status) === 1 ? "Ẩn loại" : "Khôi phục"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "40%" }}>Tên món</th>
                      <th style={{ width: "20%" }}>Trạng thái</th>
                      <th style={{ width: "20%" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDishes.length > 0 ? (
                      sortedDishes.map((d) => (
                        <tr key={d.dishID}>
                          <td>{d.name}</td>
                          <td>
                            <span className={`badge ${Number(d.status) === 1 ? "bg-success" : "bg-secondary"}`}>
                              {Number(d.status) === 1 ? "Đang bán" : "Ngừng bán"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setActiveDish(d)}
                              >
                                Xem
                              </button>
                              {!readOnly && (
                                <button
                                  className={`btn btn-sm ${Number(d.status) === 1 ? "btn-outline-danger" : "btn-outline-success"}`}
                                  onClick={() => handleToggleDishStatus(d)}
                                >
                                  {Number(d.status) === 1 ? "Ẩn" : "Hiện"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          Chưa có món nào trong loại này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
