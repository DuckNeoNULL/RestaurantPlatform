import React, { useMemo, useState } from "react";
import useBooking from "../../../hooks/useBooking";

const accent = "#E11D48";

export default function BookingItemsTable() {
  const { booking, summary } = useBooking();
  const guests = summary?.guests ?? 0;
  const services = booking?.services || [];
  const dishes = booking?.dishes || [];
  const menu = booking?.menu;
  const [showDishDetails, setShowDishDetails] = useState(false);

  const menuLineTotal = (menu?.price || 0) * guests;

  // Group selected dishes by menu category and build compact text
  const { totalDishCount, categoryBadges, groupedDishList } = useMemo(() => {
    const selectedNames = new Set((dishes || []).map((d) => d.name));
    const categories = Array.isArray(menu?.categories) ? menu.categories : [];
    const badges = [];
    const groups = [];
    let total = 0;

    categories.forEach((c) => {
      const catDishes = (c.dishes || []).filter(Boolean);
      const selectedInCat = catDishes.filter((name) => selectedNames.has(name));
      if (selectedInCat.length > 0) {
        badges.push({ name: c.name, count: selectedInCat.length });
        groups.push({ name: c.name, items: selectedInCat });
        total += selectedInCat.length;
      }
    });

    // Fallback if no categories are matched but there are dishes
    if (badges.length === 0 && dishes.length > 0) {
      total = dishes.length;
      badges.push({ name: "Món", count: dishes.length });
      groups.push({ name: "Món", items: dishes.map((d) => d.name) });
    }

    return {
      totalDishCount: total,
      categoryBadges: badges,
      groupedDishList: groups,
    };
  }, [dishes, menu]);

  return (
    <div className="mt-3 text-sm">
      <h3 className="fw-semibold mb-2">Chi tiết lựa chọn</h3>
      <div className="table-responsive">
        <table className="table table-sm align-middle border" style={{ fontSize: "0.95rem" }}>
          <thead style={{ backgroundColor: `${accent}10`, borderColor: accent }}>
            <tr>
              <th style={{ color: accent }}>Loại</th>
              <th style={{ color: accent }}>Tên</th>
              <th className="text-end" style={{ color: accent }}>SL/Khách</th>
              <th className="text-end" style={{ color: accent }}>Đơn giá</th>
              <th className="text-end" style={{ color: accent }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {/* Menu row */}
            {menu && (
              <tr>
                <td><span className="badge" style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}55` }}>Menu</span></td>
                <td>{menu?.name}</td>
                <td className="text-end">{guests}</td>
                <td className="text-end">{menu?.price ? `${menu.price.toLocaleString()}₫` : "—"}</td>
                <td className="text-end">{menu?.price ? `${menuLineTotal.toLocaleString()}₫` : "—"}</td>
              </tr>
            )}

            {/* Services */}
            {services.map((s) => (
              <tr key={s.id}>
                <td><span className="badge bg-light" style={{ color: accent, border: `1px solid ${accent}55` }}>Service</span></td>
                <td>{s.name}</td>
                <td className="text-end">1</td>
                <td className="text-end">{(s.price || 0).toLocaleString()}₫</td>
                <td className="text-end">{(s.price || 0).toLocaleString()}₫</td>
              </tr>
            ))}

            {/* Dishes summarized: don't list each item */}
            {totalDishCount > 0 && (
              <>
                <tr>
                  <td>
                    <span className="badge bg-white" style={{ color: accent, border: `1px solid ${accent}55` }}>Dish</span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <span className="text-muted">Tổng món đã chọn:</span>
                      <strong>{totalDishCount} món</strong>
                      {categoryBadges.map((b) => (
                        <span
                          key={b.name}
                          className="badge"
                          style={{ backgroundColor: `${accent}10`, color: accent, border: `1px solid ${accent}40` }}
                        >
                          {b.name}: {b.count}
                        </span>
                      ))}
                      <button
                        type="button"
                        className="btn btn-link p-0 ms-2"
                        onClick={() => setShowDishDetails((v) => !v)}
                      >
                        {showDishDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
                      </button>
                    </div>
                  </td>
                  <td className="text-end">—</td>
                  <td className="text-end">—</td>
                  <td className="text-end">—</td>
                </tr>
                {showDishDetails && (
                  <tr>
                    <td colSpan={5}>
                      <div className="d-flex flex-column gap-2">
                        {groupedDishList.map((g) => (
                          <div key={g.name}>
                            <div className="fw-semibold mb-1">{g.name}</div>
                            <div className="text-muted">{g.items.join(", ")}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="text-end">Tạm tính</td>
              <td className="text-end">{(summary?.subtotal || 0).toLocaleString()}₫</td>
            </tr>
            <tr>
              <td colSpan={4} className="text-end">Giảm giá</td>
              <td className="text-end">-{(summary?.discount || 0).toLocaleString()}₫</td>
            </tr>
            <tr>
              <td colSpan={4} className="text-end">VAT (8%)</td>
              <td className="text-end">{(summary?.vat || 0).toLocaleString()}₫</td>
            </tr>
            <tr>
              <td colSpan={4} className="text-end fw-semibold" style={{ color: accent }}>Tổng cộng</td>
              <td className="text-end fw-bold" style={{ color: accent }}>{(summary?.total || 0).toLocaleString()}₫</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
