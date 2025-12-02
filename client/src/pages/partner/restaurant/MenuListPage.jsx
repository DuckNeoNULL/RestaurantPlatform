import React, { useEffect, useMemo, useState } from "react";
import CrudSection from "../../../layouts/CrudSection";
import MenuDetailPage from "./MenuDetailPage";
import MenuCreatePage from "./MenuCreatePage";
import { useParams } from "react-router-dom";
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant";

export default function MenuListPage({ readOnly = false }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [creating, setCreating] = useState(false);
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);

  const { menus, loadMenusByRestaurant, updateOneMenu } = useAdditionRestaurant();

  useEffect(() => {
    if (restaurantID) {
      loadMenusByRestaurant(restaurantID).catch(() => {});
    }
  }, [restaurantID, loadMenusByRestaurant]);

  const rows = useMemo(() => {
    return (menus || []).map((m) => ({
      id: m.menuID ?? m.id,
      name: m.name,
      price: (Number(m.price) || 0).toLocaleString("vi-VN") + " ₫",
      status: Number(m.status) === 1 ? "active" : "inactive",
    }));
  }, [menus]);

  const columns = [
    { key: "name", label: "Tên thực đơn" },
    { key: "price", label: "Giá / bàn" },
    { key: "status", label: "Trạng thái" },
  ];

  const filters = [
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Ngừng hoạt động" },
  ];

  const handleToggleStatus = async (id, activate) => {
    if (readOnly) return;
    try {
      await updateOneMenu({ id, payload: { status: activate ? 1 : 0 } });
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(`Đổi trạng thái thực đơn thất bại: ${e?.message || e}`);
    }
  };

  return (
    <>
      {creating ? (
        readOnly ? (
          <div className="alert alert-secondary text-center mt-3">
            Chế độ chỉ xem: không thể tạo mới thực đơn.
          </div>
        ) : (
          <MenuCreatePage onBack={() => setCreating(false)} restaurantID={restaurantID} />
        )
      ) : activeMenu ? (
        <MenuDetailPage menu={activeMenu} onBack={() => setActiveMenu(null)} readOnly={readOnly} />
      ) : (
        <CrudSection
          title="Menu"
          columns={columns}
          data={rows}
          filters={filters}
          onRowClick={(row) => {
            const full = (menus || []).find((m) => (m.menuID ?? m.id) === row.id);
            setActiveMenu(full || row);
          }}
          onToggleStatus={handleToggleStatus}
          onCreate={() => !readOnly && setCreating(true)}
          readOnly={readOnly}
        />
      )}
    </>
  );
}
