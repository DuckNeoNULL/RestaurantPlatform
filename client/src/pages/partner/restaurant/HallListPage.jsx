import React, { useEffect, useMemo, useState } from "react";
import CrudSection from "../../../layouts/CrudSection";
import HallProfile from "./HallDetailPage";
import HallCreate from "./HallCreatePage";
import { useParams } from "react-router-dom";
import { useHall } from "../../../hooks/useHall";

export default function HallListPage({ readOnly = false }) {
  const [activeHall, setActiveHall] = useState(null);
  const [creating, setCreating] = useState(false);
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);

  const { list, status, loadByRestaurant, updateStatus } = useHall();

  useEffect(() => {
    if (restaurantID) {
      loadByRestaurant(restaurantID).catch((e) => {
        // eslint-disable-next-line no-console
        console.warn("Load halls failed:", e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantID]);

  const formatPrice = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString("vi-VN") + " ₫";
  };

  const rows = useMemo(
    () =>
      (list || []).map((h) => ({
        id: h.hallID,
        name: h.name,
        minTable: h.minTable,
        maxTable: h.maxTable,
        area: h.area,
        price: formatPrice(h.price),
        status: h.status ? "active" : "inactive",
      })),
    [list]
  );

  const columns = [
    { key: "name", label: "Tên sảnh" },
    { key: "minTable", label: "Số bàn tối thiểu" },
    { key: "maxTable", label: "Số bàn tối đa" },
    { key: "area", label: "Diện tích (m²)" },
    { key: "price", label: "Giá thuê" },
    { key: "status", label: "Trạng thái" },
  ];

  const filters = [
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Ngừng hoạt động" },
  ];

  const handleToggleStatus = (id, activate) => {
    if (readOnly) return;
    updateStatus({ id, status: !!activate }).catch((e) => {
      // eslint-disable-next-line no-console
      console.warn("Toggle hall status failed:", e);
    });
  };

  return (
    <>
      {creating ? (
        readOnly ? (
          <div className="alert alert-secondary text-center mt-3">
            Chế độ chỉ xem: không thể tạo mới sảnh.
          </div>
        ) : (
          <HallCreate onBack={() => setCreating(false)} />
        )
      ) : activeHall ? (
        <HallProfile
          hall={activeHall}
          onBack={() => setActiveHall(null)}
          onUpdated={(updated) => setActiveHall(updated)}
          readOnly={readOnly}
        />
      ) : (
        <CrudSection
          title="Sảnh tiệc"
          columns={columns}
          data={rows}
          filters={filters}
          onToggleStatus={handleToggleStatus}
          onRowClick={(row) => {
            // find full object from store list
            const found = (list || []).find((h) => h.hallID === row.id);
            setActiveHall(found || row);
          }}
          onCreate={() => !readOnly && setCreating(true)}
          readOnly={readOnly}
        />
      )}
    </>
  );
}
