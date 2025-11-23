import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Form, Button, Row, Col } from "react-bootstrap";

export default function SystemSettings() {
  const [settings, setSettings] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/dashboard/system-settings").then((res) => {
      setSettings(res.data);
    });
  }, []);

  const handleSave = async (id, newValue) => {
    setSaving(true);

    try {
      await axios.put(`/api/dashboard/system-settings/${id}`, {
        settingValue: newValue,
      });

      setSettings((prev) =>
        prev.map((s) => (s.settingID === id ? { ...s, settingValue: newValue } : s))
      );
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu cài đặt");
    }

    setSaving(false);
  };

  if (!settings.length)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#6b7280",
          fontSize: "1rem",
        }}
      >
        ⏳ Đang tải cài đặt hệ thống...
      </div>
    );

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontWeight: 700,
            color: "#111827",
            fontSize: "1.75rem",
            marginBottom: "8px",
          }}
        >
          Cài đặt hệ thống
        </h2>
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.9375rem",
            marginBottom: 0,
          }}
        >
          Quản lý các cài đặt và cấu hình của hệ thống
        </p>
      </div>

      {settings.map((setting) => (
        <Card
          key={setting.settingID}
          className="mb-3"
          style={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            transition: "box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
          }}
        >
          <Card.Body style={{ padding: "24px" }}>
            <h5
              style={{
                fontWeight: 600,
                marginBottom: "12px",
                color: "#111827",
                fontSize: "1.125rem",
              }}
            >
              {setting.settingName}
            </h5>

            <Row className="align-items-center">
              <Col md={8}>
                <Form.Control
                  type="text"
                  defaultValue={setting.settingValue}
                  onChange={(e) => {
                    setting.settingValue = e.target.value;
                  }}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    padding: "10px 14px",
                    fontSize: "0.9375rem",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <small
                  style={{
                    color: "#6b7280",
                    fontSize: "0.8125rem",
                    marginTop: "6px",
                    display: "block",
                  }}
                >
                  {setting.description}
                </small>
              </Col>
              <Col md={4} className="text-end">
                <Button
                  variant="primary"
                  disabled={saving}
                  onClick={() => handleSave(setting.settingID, setting.settingValue)}
                  style={{
                    background: saving ? "#9ca3af" : "#8b5cf6",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: saving
                      ? "none"
                      : "0 2px 4px rgba(139, 92, 246, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.target.style.background = "#7c3aed";
                      e.target.style.boxShadow = "0 4px 8px rgba(139, 92, 246, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.target.style.background = "#8b5cf6";
                      e.target.style.boxShadow = "0 2px 4px rgba(139, 92, 246, 0.2)";
                    }
                  }}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
