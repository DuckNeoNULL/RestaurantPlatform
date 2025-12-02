import Header from "../components/header/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTopButton";

export default function MainLayout({ children }) {
  // - horizontal padding: 0 50px
  // - maxWidth: 1200px (centered)
  return (
    <div className="min-vh-100">
      <Header />
      <main role="main" style={{ paddingTop: 82, paddingBottom: 50 }}>
        {children}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
