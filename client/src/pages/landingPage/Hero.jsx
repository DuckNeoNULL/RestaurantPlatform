import { Container } from "react-bootstrap"

export default function Hero() {
  return (
    <section
      className="position-relative d-flex align-items-center justify-content-center text-center text-white w-100"
      style={{ height: "380px", margin: 0, padding: 0 }}
    >
      {/* Background */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ zIndex: 0 }}
      >
        <img
          src="https://static.vecteezy.com/system/resources/previews/047/274/684/non_2x/beautiful-indoor-wedding-aisle-with-elegant-floral-decorations-in-soft-pastel-colors-creating-a-romantic-and-enchanting-atmosphere-photo.jpg"
          alt="Wedding venue"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
          }}
        ></div>
      </div>

      {/* Content */}
      <Container fluid style={{ zIndex: 1, position: "relative", maxWidth: "900px" }}>
        <h1 style={{ fontWeight: "700", lineHeight: 1.3 }}>
          Hãy để chúng tôi biến mỗi lễ tiệc thành câu chuyện đáng nhớ.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem" }}>
          Đặt bàn hôm nay, lưu giữ kỷ niệm suốt đời.
        </p>
      </Container>
    </section>
  )
}