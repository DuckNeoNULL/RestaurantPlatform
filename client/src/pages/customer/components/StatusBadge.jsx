import { Badge } from "react-bootstrap"

const statusConfig = {
  0: { text: "ĐANG CHỜ", variant: "warning" },
  1: { text: "ĐÃ XÁC NHẬN", variant: "success" },
  2: { text: "ĐÃ HỦY", variant: "danger" },
  3: { text: "ĐÃ ĐẶT CỌC", variant: "info" },
  4: { text: "ĐÃ HOÀN THÀNH", variant: "primary" },
}

export default function StatusBadge({ status }) {
  const statusInfo = statusConfig[status] || statusConfig[0]

  return (
    <Badge bg={statusInfo.variant} className="px-3 py-2 fs-6">
      {statusInfo.text}
    </Badge>
  )
}
