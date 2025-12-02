import { Row, Col, Button, Form } from "react-bootstrap"

export default function ImageUploadPreview({ images, imagePreviews, onImagesChange, onRemoveImage }) {
  function handleFileChange(e) {
    const files = Array.from(e.target.files || []).slice(0, 6)
    const urls = files.map((f) => URL.createObjectURL(f))
    onImagesChange(files, urls)
  }

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Hình ảnh (tối đa 6)</Form.Label>
        <Form.Control type="file" accept="image/*" multiple onChange={handleFileChange} />
        <Form.Text className="text-muted">Chỉ chọn ảnh liên quan (jpg, png). Ấn nút × để xóa.</Form.Text>
      </Form.Group>

      {imagePreviews.length > 0 && (
        <Row className="g-2 mb-3">
          {imagePreviews.map((src, i) => (
            <Col xs={4} key={i}>
              <div className="position-relative">
                <img
                  src={src || "/placeholder.svg"}
                  alt={`preview-${i}`}
                  className="img-fluid rounded"
                  style={{ width: "100%", height: "120px", objectFit: "cover" }}
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="position-absolute top-0 end-0 m-1 rounded-circle"
                  style={{ width: "30px", height: "30px", padding: 0 }}
                  onClick={() => onRemoveImage(i)}
                >
                  ×
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}
