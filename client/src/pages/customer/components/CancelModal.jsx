"use client"

import { useState } from "react"
import { Modal, Button, Form } from "react-bootstrap"

export default function CancelModal({ show, onHide, onCancel }) {
  const [reason, setReason] = useState("")

  function handleSubmit() {
    onCancel(reason)
    setReason("")
  }

  function handleClose() {
    setReason("")
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Hủy đặt chỗ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Bạn có chắc chắn muốn hủy đặt chỗ này? Thao tác không thể hoàn tác.</p>
        <Form.Group>
          <Form.Label>Lý do hủy (tuỳ chọn)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do hủy..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="danger" onClick={handleSubmit}>
          Hủy đặt chỗ
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
