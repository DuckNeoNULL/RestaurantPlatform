import { useState } from "react"
import { Modal, Button, Form } from "react-bootstrap"

export default function ConfirmModal({ show, onHide, onConfirm }) {
  const [note, setNote] = useState("")

  function handleSubmit() {
    onConfirm(note)
    setNote("")
  }

  function handleClose() {
    setNote("")
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Xác nhận đặt chỗ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Bạn có chắc chắn muốn xác nhận đặt chỗ này? Thao tác sẽ cập nhật trạng thái.</p>
        <Form.Group>
          <Form.Label>Ghi chú (tuỳ chọn)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú thêm khi xác nhận..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          Xác nhận
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
