import Header from "../components/header/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTopButton";
import ChatWidget from "../components/ChatWidget";

export default function LandingPageLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
        <Header />

      <main className="flex-grow-1">
        {children} 
      </main>

      <Footer />
      <ScrollToTop />
      <ChatWidget />

    </div>
  );
}
