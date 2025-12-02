import { ButtonGroup, Button } from "react-bootstrap"

export default function TimePeriodSelector({ value, onChange }) {
  const periods = [
    { key: "week", label: "Tuần" },
    { key: "month", label: "Tháng" },
    { key: "quarter", label: "Quý" },
    { key: "year", label: "Năm" },
  ]

  return (
    <ButtonGroup>
      {periods.map((period) => (
        <Button
          key={period.key}
          variant={value === period.key ? "primary" : "outline-secondary"}
          onClick={() => onChange(period.key)}
          style={{
            fontSize: "0.875rem",
            backgroundColor: value === period.key ? "#8b5cf6" : "transparent",
            borderColor: "#d1d5db",
            color: value === period.key ? "white" : "#6b7280",
          }}
        >
          {period.label}
        </Button>
      ))}
    </ButtonGroup>
  )
}
