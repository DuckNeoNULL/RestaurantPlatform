import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import Button from "react-bootstrap/Button";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="position-fixed bottom-0 end-0 m-4 rounded-circle border-0 shadow-sm"
      style={{
        width: "3rem",
        height: "3rem",
        zIndex: 1040,
        backgroundColor: "#e11d48"
      }}
    >
      <ArrowUp size={20} color="white" />
    </Button>
  );
}