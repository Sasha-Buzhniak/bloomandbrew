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

function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <ReactLenis root options={{ lerp: 0.09 }}>
      <CartProvider>
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
              <Route path="*" element={<Home />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
        <Footer />
        <CartDrawer />
        <Toaster position="bottom-center" />
      </CartProvider>
    </ReactLenis>
  );
}
