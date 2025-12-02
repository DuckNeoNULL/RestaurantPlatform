import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Gift } from "lucide-react";
const PromotionList = ({ restaurant }) => {
  const activePromotions = restaurant.promotions?.filter(promo => promo.status == 1) || [];
  return (
    <div className="mb-5">
      <h4 className="section-title mb-3" style={{ color: "#f43f5e" }}>Ưu đãi</h4>
      <Row className="g-3">
        {activePromotions.length > 0 ? (
          activePromotions.map((promo) => (
            <Col key={promo.promotionID} xs={12} sm={6} md={4} lg={4}>
              <Card
                className="text-white shadow-sm"
                style={{
                  border: "none",
                  borderRadius: "12px",
                  background: "linear-gradient(90deg, #f43f5e, #f87171)",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
              >
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <Gift size={24} className="me-2" />
                    <h6 className="fw-bold mb-0">{promo.name}</h6>
                  </div>
                  {promo.description && (
                    <p className="mb-2" style={{ fontSize: "0.85rem", lineHeight: "1.2rem" }}>
                      {promo.description}
                    </p>
                  )}
                  <p className="mb-0" style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                    {promo.startDate} → {promo.endDate}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-muted">Chưa có khuyến mãi</p>
        )}
      </Row>
    </div>
  );
};

export default PromotionList;