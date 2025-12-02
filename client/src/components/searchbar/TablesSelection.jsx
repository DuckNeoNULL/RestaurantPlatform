import React from "react";
import { Form } from "react-bootstrap";
import { useSearchForm } from "../../hooks/useSearchForm";

export default function TablesSelection() {
  const { state, setField } = useSearchForm();

  const handleChange = (e) => {
    const val = e.target.value.trim();

    // Nếu người dùng xóa input -> reset thành chuỗi rỗng
    if (val === "") {
      setField("tables", "");
      return;
    }

    // Nếu là số hợp lệ -> set kiểu số
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setField("tables", num);
    }
  };

  return (
    <Form.Group controlId="tablesInput">
      <Form.Label className="fw-semibold mb-1">Số bàn</Form.Label>
      <Form.Control
        type="number"
        min="1"
        placeholder="Số bàn"
        value={state.tables ?? ""}
        onChange={handleChange}
        onWheel={(e) => e.target.blur()} // tránh scroll đổi số
      />
    </Form.Group>
  );
}
