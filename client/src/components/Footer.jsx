import { Container, Row, Col } from "react-bootstrap"
import { useState } from "react"
import "../styles/FooterStyles.css"

export default function Footer() {
  const [brandHover, setBrandHover] = useState(false)
  const [linkHover, setLinkHover] = useState({})

  const handleLinkHover = (linkId, isHovered) => {
    setLinkHover((prev) => ({
      ...prev,
      [linkId]: isHovered,
    }))
  }

  return (
    <footer className="bg-footer text-white py-5">
      <Container fluid style={{ padding: "0 50px", maxWidth: "1200px", margin: "0 auto" }}>
        <Row className="g-5 align-items-center mb-5">
          <Col lg={4} md={6} sm={12} className="d-flex flex-column justify-content-center">
            <h2
              className="fs-1 fw-bold m-0 ls-1 footer-brand"
              onMouseEnter={() => setBrandHover(true)}
              onMouseLeave={() => setBrandHover(false)}
              style={{ transform: brandHover ? "translateX(5px)" : "translateX(0)" }}
            >
              LifEvent
            </h2>
          </Col>

          <Col lg={4} md={6} sm={12} className="d-flex flex-column justify-content-center ps-3">
            <h4 className="fs-6 fw-bold mb-3 text-uppercase ls-2">LIÊN HỆ</h4>
            <div className="d-flex flex-column gap-2">
              <a
                href="#"
                className="text-white text-decoration-none footer-link"
                onMouseEnter={() => handleLinkHover("email", true)}
                onMouseLeave={() => handleLinkHover("email", false)}
                style={{
                  opacity: linkHover["email"] ? 0.7 : 1,
                  textDecoration: linkHover["email"] ? "underline" : "none",
                }}
              >
                insert email here
              </a>
              <div className="footer-divider"></div>
              <p className="m-0 small">Đại học FPT Đà Nẵng</p>
            </div>
          </Col>

          <Col lg={4} md={6} sm={12} className="d-flex flex-column justify-content-center ps-3">
            <ul className="list-unstyled d-flex flex-column gap-2 fw-bold">
              <li>
                <a
                  href="#"
                  className="text-white text-decoration-none footer-link"
                  onMouseEnter={() => handleLinkHover("about", true)}
                  onMouseLeave={() => handleLinkHover("about", false)}
                  style={{
                    opacity: linkHover["about"] ? 0.7 : 1,
                    textDecoration: linkHover["about"] ? "underline" : "none",
                  }}
                >
                  VỀ CHÚNG TÔI
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white text-decoration-none footer-link"
                  onMouseEnter={() => handleLinkHover("programs", true)}
                  onMouseLeave={() => handleLinkHover("programs", false)}
                  style={{
                    opacity: linkHover["programs"] ? 0.7 : 1,
                    textDecoration: linkHover["programs"] ? "underline" : "none",
                  }}
                >
                  CHƯƠNG TRÌNH HIỆN TẠI
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white text-decoration-none footer-link"
                  onMouseEnter={() => handleLinkHover("house", true)}
                  onMouseLeave={() => handleLinkHover("house", false)}
                  style={{
                    opacity: linkHover["house"] ? 0.7 : 1,
                    textDecoration: linkHover["house"] ? "underline" : "none",
                  }}
                >
                  THEO DÕI
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white text-decoration-none footer-link"
                  onMouseEnter={() => handleLinkHover("looking", true)}
                  onMouseLeave={() => handleLinkHover("looking", false)}
                  style={{
                    opacity: linkHover["looking"] ? 0.7 : 1,
                    textDecoration: linkHover["looking"] ? "underline" : "none",
                  }}
                >
                  LOOKING BACK
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>

      <div className="border-top footer-bottom text-center py-4">
        <p className="m-0 small">© 2025 LifEvent. Tất cả các quyền được bảo lưu.</p>
      </div>
    </footer>
  )
}
