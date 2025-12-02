import React, { useState } from "react";
import { Button, Modal, ListGroup, Form, InputGroup, Row, Col } from "react-bootstrap";

/**
 * ServiceSelectorModal
 * - props:
 *    services: array of { serviceID?, id?, name, price, unit }
 *    onSelect: function({ services: [{ id, serviceID, name, price, quantity, unit }] })
 *
 * Behavior:
 * - checkbox to pick service
 * - quantity input (default 1, min 1) shown for selected services
 * - on confirm calls onSelect with normalized service objects
 */
const DEFAULT_SERVICES = [
  { serviceID: 1, id: 1, name: "MC", price: 500000, unit: "sự kiện" },
  { serviceID: 2, id: 2, name: "Photographer", price: 1500000, unit: "sự kiện" },
  { serviceID: 3, id: 3, name: "Decoration", price: 1000000, unit: "sự kiện" },
  { serviceID: 4, id: 4, name: "Live Music", price: 1200000, unit: "sự kiện" },
];

export default function ServiceSelectorModal({ services = DEFAULT_SERVICES, onSelect }) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(() =>
    services.map((s) => ({ id: s.id ?? s.serviceID, serviceID: s.serviceID ?? s.id, name: s.name, price: s.price, unit: s.unit, quantity: 1, checked: false }))
  );

  // reopen should refresh list if services prop changes
  React.useEffect(() => {
    setSelected(
      (services || DEFAULT_SERVICES).map((s) => ({
        id: s.id ?? s.serviceID,
        serviceID: s.serviceID ?? s.id,
        name: s.name,
        price: s.price,
        unit: s.unit,
        quantity: 1,
        checked: false,
      }))
    );
  }, [services]);

  const toggleCheck = (idx) => {
    setSelected((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], checked: !next[idx].checked, quantity: Math.max(1, next[idx].quantity || 1) };
      return next;
    });
  };

  const setQty = (idx, q) => {
    const n = Math.max(1, Number(q || 1));
    setSelected((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: n };
      return next;
    });
  };

  const handleConfirm = () => {
    const chosen = selected.filter((s) => s.checked).map((s) => ({
      // keep both id and serviceID for compatibility
      id: s.id,
      serviceID: s.serviceID,
      name: s.name,
      price: s.price,
      quantity: Number(s.quantity) || 1,
      unit: s.unit,
    }));
    onSelect && onSelect({ services: chosen });
    setShow(false);
  };

  return (
    <>
      <Button variant="outline-danger" onClick={() => setShow(true)}>
        Chọn dịch vụ
      </Button>

      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chọn dịch vụ bổ sung</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <ListGroup>
            {selected.map((s, idx) => (
              <ListGroup.Item key={s.id} className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-start gap-3">
                  <Form.Check
                    type="checkbox"
                    checked={s.checked}
                    onChange={() => toggleCheck(idx)}
                    id={`svc-${s.id}`}
                    className="me-2 mt-1"
                  />
                  <div>
                    <div className="fw-semibold">{s.name}</div>
                    <div className="text-muted small">{s.price?.toLocaleString?.() ?? s.price}₫/ {s.unit}</div>
                  </div>
                </div>

                <div style={{ minWidth: 140 }}>
                  <Row className="g-1 align-items-center">
                    <Col xs={5}>
                      <InputGroup size="sm">
                        <InputGroup.Text>SL</InputGroup.Text>
                        <Form.Control
                          type="number"
                          min={1}
                          value={s.quantity}
                          disabled={!s.checked}
                          onChange={(e) => setQty(idx, e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col xs={7} className="text-end">
                      <div className="small text-muted">Tổng</div>
                      <div className="fw-semibold">
                        {(Number(s.price || 0) * Number(s.quantity || 1)).toLocaleString()}₫
                      </div>
                    </Col>
                  </Row>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Áp dụng dịch vụ
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}