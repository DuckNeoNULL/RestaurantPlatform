import { useState, useEffect } from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import NotificationDropdown from "./NotificationMenu";
import ProfileMenu from "./ProfileMenu";
import useAuth from "../../hooks/useAuth";
import "../../styles/HeaderStyles.css";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // treat only the landing page path ('/') as transparent area
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(y > 120);
    };

    // set initial state in case page is already scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const transparent = isLanding && !isScrolled;

  const notifications = [
    {
      id: 1,
      type: "chat",
      title: "Tin nhắn mới",
      preview: "Nhà hàng Golden: Chúng tôi đã nhận được yêu cầu...",
      time: "2 phút trước",
      unread: true,
    },
    {
      id: 2,
      type: "promo",
      title: "Khuyến mãi tháng 10",
      preview: "Giảm 15% cho tiệc cưới đặt trước 30 ngày.",
      time: "1 giờ trước",
      unread: true,
    },
    {
      id: 3,
      type: "chat",
      title: "Trao đổi",
      preview: "Nhà hàng Silver hỏi thêm thông tin về số bàn.",
      time: "Hôm qua",
      unread: false,
    },
  ];

  return (
    <Navbar
      expand="md"
      fixed="top"
      className={`py-2 transition-all ${transparent ? "bg-transparent" : "bg-white shadow-sm"}`}
      style={{
        zIndex: 999,
        transition: "all 0.3s ease",
        borderBottom: !transparent ? "1px solid #f3f3f3" : "none",
      }}
    >
      <Container fluid style={{ padding: "0 50px", maxWidth: "1200px" }}>
        {/* Logo */}
        <Navbar.Brand
          href="/"
          className={`fw-bold fs-3 brand-name ${transparent ? "text-white" : "text-dark"}`}
          style={{ letterSpacing: "0.5px", color: transparent ? undefined : "#e11d48" }}
        >
          LifEvent
        </Navbar.Brand>

        <Nav className="ms-auto d-flex align-items-center gap-3">
          {user ? (
            <>
              <NotificationDropdown dark={!transparent} notifications={notifications} />
              <ProfileMenu dark={!transparent} user={user} onLogout={logout} />
            </>
          ) : (
            <>
              <Button
                as={Link}
                to="/signup/partner"
                variant="link"
                className={`fw-medium px-3 text-decoration-none header-link ${transparent ? "text-white" : "text-dark"}`}
              >
                Bạn Muốn Hợp Tác?
              </Button>

              <Button
                as={Link}
                to="/signup/customer"
                variant={transparent ? "outline-light" : "outline-secondary"}
                className="fw-medium px-3 rounded header-link-btn"
              >
                Đăng Ký
              </Button>

              <Button
                as={Link}
                to="/login"
                variant="danger"
                className="px-3 rounded fw-medium shadow-sm text-white header-cta"
                style={{
                  backgroundColor: "#e11d48",
                  borderColor: "#e11d48",
                }}
              >
                Đăng Nhập
              </Button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}