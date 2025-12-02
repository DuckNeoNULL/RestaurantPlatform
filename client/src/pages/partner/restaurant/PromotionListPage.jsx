import React, { useEffect, useMemo, useState } from "react";
import CrudSection from "../../../layouts/CrudSection";
import PromotionDetailPage from "./PromotionDetailPage";
import PromotionCreatePage from "./PromotionCreatePage.jsx";
import { useParams } from "react-router-dom";
import { usePromotion } from "../../../hooks/usePromotion";

export default function PromotionListPage({ readOnly = false }) {
  const [activePromotion, setActivePromotion] = useState(null);
  const [creating, setCreating] = useState(false);
  const { id: paramId, restaurantID: paramRestaurantID } = useParams();
  const restaurantID = useMemo(() => Number(paramRestaurantID || paramId) || undefined, [paramId, paramRestaurantID]);

  const { list, status, loadByRestaurant, updateOne } = usePromotion();
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (restaurantID) {
      loadByRestaurant(restaurantID).catch((e) => {
        // eslint-disable-next-line no-console
        console.warn("Load promotions failed:", e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantID]);

  const promotions = useMemo(
    () =>
      (list || []).map((p) => {
        const isFree = p.discountType === 1 || p.discountType === "Free";
        const percent = typeof p.discountValue !== "undefined" ? p.discountValue : p.discountPercentage;
        return {
          id: p.promotionID ?? p.id,
          name: p.title || p.name,
          description: p.description,
          minTable: p.minTable ?? "-",
          discount: isFree ? "Miễn phí dịch vụ" : (typeof percent !== "undefined" ? `${percent}%` : "-"),
          date: p.startDate && p.endDate ? `${p.startDate} - ${p.endDate}` : "-",
          status: (typeof p.status !== "undefined" ? (p.status ? "active" : "inactive") : "active"),
        };
      }),
    [list]
  );

  const columns = [
    { key: "name", label: "Tên khuyến mãi" },
    { key: "minTable", label: "Số bàn tối thiểu" },
    { key: "discount", label: "Giảm giá" },
    { key: "date", label: "Thời gian áp dụng" },
    { key: "status", label: "Trạng thái" },
  ];

  const filters = [
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Ngừng hoạt động" },
  ];

  const handleToggleStatus = async (id, activate) => {
    if (readOnly || !restaurantID) return;
    setTogglingId(id);
    try {
      await updateOne({ id, payload: { status: !!activate } });
      // hard refresh list to ensure filters and layout update correctly
      await loadByRestaurant(restaurantID);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Toggle promotion status failed:", e);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      {creating ? (
        readOnly ? (
          <div className="alert alert-secondary text-center mt-3">
            Chế độ chỉ xem: không thể tạo mới khuyến mãi.
          </div>
        ) : (
          <PromotionCreatePage onBack={() => setCreating(false)} />
        )
      ) : activePromotion ? (
        <PromotionDetailPage
          promotion={activePromotion}
          onBack={() => setActivePromotion(null)}
          readOnly={readOnly}
        />
      ) : (
        <CrudSection
          title="Khuyến mãi"
          columns={columns}
          data={promotions}
          filters={filters}
          onRowClick={(row) => {
            // find full object from store list
            const full = (list || []).find((p) => (p.promotionID ?? p.id) === row.id);
            setActivePromotion(full || row);
          }}
          onToggleStatus={handleToggleStatus}
          onCreate={() => !readOnly && setCreating(true)}
          readOnly={readOnly}
        />
      )}
    </>
  );
}
