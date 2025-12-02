import React, { useState } from "react";
import { Table, Button, InputGroup, Form, Row, Col } from "react-bootstrap";

export default function CrudSection({
  title,
  columns,
  data,
  filters = [],
  onToggleStatus,
  onRowClick,
  onCreate, // ✅ callback khi bấm nút tạo mới
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
    const matchesFilter = filter === "all" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <h4 className="mb-3">{title}</h4>

      <Row className="mb-3">
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder={`Tìm ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col md={3}>
          {filters.length > 0 && (
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              {filters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Form.Select>
          )}
        </Col>

        <Col md={5} className="text-end">
          <Button variant="primary" onClick={onCreate}> {/* ✅ gọi callback */}
            + Tạo mới
          </Button>
        </Col>
      </Row>

      {/* --- Bảng dữ liệu --- */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.key === "name" && onRowClick ? (
                    <span
                      onClick={() => onRowClick(row)}
                      style={{
                        color: "#4043f0ff",
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => (e.target.style.textDecoration = "none")}
                      onMouseLeave={(e) => (e.target.style.textDecoration = "underline")}
                    >
                      {row[col.key]}
                    </span>
                  ) : col.key === "status" ? (
                    <Button
                      variant={row.status === "active" ? "success" : "danger"}
                      className="text-white"
                      size="sm"
                      onClick={() => {
                        const confirmToggle = window.confirm(
                          `Bạn có chắc muốn ${
                            row.status === "active" ? "ngưng hoạt động" : "kích hoạt"
                          } "${row.name}" không?`
                        );
                        if (confirmToggle && onToggleStatus) {
                          onToggleStatus(row.id, row.status === "inactive");
                        }
                      }}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {row.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </Button>
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}