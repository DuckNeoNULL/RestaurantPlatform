import React, { useEffect } from "react";
import useBooking from "../../../hooks/useBooking";
import { calculatePrice } from "../../../services/bookingService";
import { Tag } from "lucide-react";
import { Badge } from "react-bootstrap";

/**
 * Hiển thị khuyến mãi đang áp dụng + gợi ý promotion kế cận
 * Cho phép áp dụng promotion gợi ý.
 */
export default function PromotionBadge({ promotions, tables, menu, services, hallFee = 0 }) {
  const { booking, applyPromotion, recalcPrice } = useBooking();
  const [appliedPromotions, setAppliedPromotions] = React.useState([]);
  // Use provided promotions directly
  const suggestions = promotions || [];
  // Auto apply the best promotion when promotions list or inputs change
  useEffect(() => {
    if (!suggestions.length) return;
    const base = {menu: menu, tables:tables, services: Array.isArray(services) ? services : [], hallFee: hallFee };
    let best = suggestions[0];
    let bestDiscount = 0;
    // Only consider promotions with discountType 0 for best discount calculation
   
    // Apply all discountType 1 promotions
    const servicePromotions = suggestions.filter(p => p.discountType === 1);
     const discountPromotions = suggestions.filter(p => p.discountType === 0);
    discountPromotions.forEach((p) => {
      const { discount } = calculatePrice({ ...base, promotion: p });
      // console.log(`Promotion: ${p.title}, Discount: ${discount}`);
      if (discount > bestDiscount) {
        best = p;
        bestDiscount = discount;
      }
    });
    // apply only if better or not set yet
    if (best && (!booking.appliedPromotion || booking.appliedPromotion?.id !== best.id)) {
      applyPromotion(best);      // recalc after apply and return data
    }
    // Update local applied promotions for display
    const allApplied = [best, ...servicePromotions].filter(Boolean);
    setAppliedPromotions(allApplied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions, tables, menu, services, hallFee]);

  return (
    <div className="mt-3">
      <label className="fw-semibold mb-1">Khuyến mãi</label>
      {appliedPromotions.length > 0 ? (
        appliedPromotions.map((promotion, index) => (
          <div key={promotion.id || index} className="d-flex align-items-center justify-content-between p-2 rounded border border-success bg-gradient-to-r mb-2" style={{ background: "linear-gradient(90deg, #d1fae5, #6ee7b7)" }}>
            <div className="d-flex align-items-center gap-2">
              <Tag size={16} className="text-success" />
              <div>
                <strong>{promotion.name}</strong>
                <div className="text-sm text-success">
                  {promotion.description}
                </div>
                <p className="mb-0" style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                  {promotion.startDate} → {promotion.endDate}
                </p>
              </div>
            </div>
            <Badge bg="success" pill>
              Áp dụng
            </Badge>
          </div>
        ))
      ) : (
        <div className="text-muted">Chưa áp dụng khuyến mãi</div>
      )}
    </div>
  );
}