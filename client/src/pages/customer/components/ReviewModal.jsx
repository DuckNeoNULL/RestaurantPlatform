import { useState } from "react"
import { Modal, Button, Form } from "react-bootstrap"
import StarRating from "../../../components/RatingStars"
import ImageUploadPreview from "./ImageUploadPreview"

export default function ReviewModal({ show, onHide, onSubmit, booking }) {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  function resetForm() {
    setRating(0)
    setReviewText("")
    setImages([])
    imagePreviews.forEach((u) => URL.revokeObjectURL(u))
    setImagePreviews([])
  }

  function handleSubmit() {
    if (rating === 0) {
      alert("Vui lòng chọn số sao trước khi gửi.")
      return
    }
    const reviewPayload = {
      bookingID: booking.bookingID,
      rating,
      content: reviewText.trim(),
      images,
    }
    onSubmit(reviewPayload)
    resetForm()
  }

  function handleClose() {
    resetForm()
    onHide()
  }

  function handleImagesChange(files, urls) {
    setImages(files)
    setImagePreviews(urls)
  }

  function handleRemoveImage(index) {
    const newImgs = [...images]
    newImgs.splice(index, 1)
    if (images[index]) URL.revokeObjectURL(imagePreviews[index])
    setImages(newImgs)
    const newPrev = [...imagePreviews]
    newPrev.splice(index, 1)
    setImagePreviews(newPrev)
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Đánh giá nhà hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <StarRating rating={rating} onChange={setRating} />

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Nội dung đánh giá</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về chất lượng món ăn, phục vụ, không gian..."
            />
          </Form.Group>

          <ImageUploadPreview
            images={images}
            imagePreviews={imagePreviews}
            onImagesChange={handleImagesChange}
            onRemoveImage={handleRemoveImage}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Gửi đánh giá
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
