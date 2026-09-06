import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import OurStory from "@/pages/OurStory";
import Gallery from "@/pages/Gallery";
import FindUs from "@/pages/FindUs";
import Faq from "@/pages/Faq";
import Order from "@/pages/Order";
import OrderSuccess from "@/pages/OrderSuccess";
import Track from "@/pages/Track";
import Barista from "@/pages/Barista";
import Gift from "@/pages/Gift";
import GiftSuccess from "@/pages/GiftSuccess";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import AuthCallback from "@/pages/AuthCallback";
import { AuthProvider } from "@/lib/auth";

function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);
  return null;
}

function AppShell() {
  const location = useLocation();
  // Detect the OAuth return synchronously during render (useLocation().hash is reactive;
  // window.location.hash is not) so the session exchange runs before any auth check.
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <>
      <ScrollToTop />
      <div className="grain-overlay" aria-hidden="true" />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/find-us" element={<FindUs />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/order" element={<Order />} />
            <Route path="/order/success" element={<OrderSuccess />} />
            <Route path="/track" element={<Track />} />
            <Route path="/barista" element={<Barista />} />
            <Route path="/gift" element={<Gift />} />
            <Route path="/gift/success" element={<GiftSuccess />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
      <Toaster position="bottom-center" />
    </>
  );
}

export default function App() {
  return (
    <ReactLenis root options={{ lerp: 0.09 }}>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </ReactLenis>
  );
}
