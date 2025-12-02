import React, { useState } from "react";
import { Star, Gift, Building, BookOpen, Settings, TableOfContents } from "lucide-react";

export default function NavBar() {
  const navItems = [
    { href: "#overview", label: "Tổng quan", icon: <TableOfContents size={16} className="me-1" /> },
    { href: "#promotions", label: "Ưu đãi", icon: <Gift size={16} className="me-1" /> },
    { href: "#halls", label: "Sảnh tiệc", icon: <Building size={16} className="me-1" /> },
    { href: "#menus", label: "Thực đơn", icon: <BookOpen size={16} className="me-1" /> },
    { href: "#services", label: "Dịch vụ", icon: <Settings size={16} className="me-1" /> },
    { href: "#reviews", label: "Đánh giá", icon: <Star size={16} className="me-1" /> },
  ];

  const themeColor = "#E11d48"; // màu chủ đề
  const inactiveColor = "#ddd";
  const [activeIndex, setActiveIndex] = useState(0);

  // tạo background linear-gradient cho underline
  const gradient = navItems
    .map((_, index) =>
      index === activeIndex ? themeColor : inactiveColor
    )
    .join(" ");

  // mỗi đoạn chiếm % ngang bằng nhau
  const segmentWidth = 100 / navItems.length;

  const bgStyle = {
    height: 3,
    background: `linear-gradient(to right, ${navItems
      .map((_, i) =>
        i === activeIndex
          ? `${themeColor} ${i * segmentWidth}% ${(i + 1) * segmentWidth}%`
          : `${inactiveColor} ${i * segmentWidth}% ${(i + 1) * segmentWidth}%`
      )
      .join(", ")})`,
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
  };

  return (
    <nav className="mt-5 position-relative">
      <ul
        className="nav justify-content-center position-relative"
        style={{ marginBottom: 0 }}
      >
        {navItems.map((item, index) => (
          <li key={item.href} className="nav-item flex-fill text-center">
            <a
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                setActiveIndex(index);
              }}
              style={{
                color: index === activeIndex ? themeColor : "#6c757d",
                fontWeight: 500,
                gap: 4,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem 0",
                textDecoration: "none"
              }}
            >
              {item.icon}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {/* underline liền 1 line, active khác màu */}
      <div style={bgStyle} />
    </nav>
  );
}
