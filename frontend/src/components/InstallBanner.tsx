import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Share, X } from "lucide-react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem("bb-install-dismissed")) return;
    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone = window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    if (standalone) return;
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    if (window.innerWidth < 1024) {
      const timer = window.setTimeout(() => setShow(true), 5000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("bb-install-dismissed", "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && location.pathname !== "/order" && (
        <motion.div
          data-testid="install-banner"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-sm border border-espresso/10 bg-cream p-4 shadow-[0_16px_40px_rgba(44,36,34,0.18)]"
        >
          <div className="flex items-center gap-4">
            <img src="/icons/icon-192.png" alt="Bloom & Brew app icon" className="h-12 w-12 rounded-xl" />
            <div className="flex-1">
              <p className="font-heading text-sm uppercase tracking-editorial text-espresso">Take Us Home</p>
              <p className="mt-0.5 text-xs leading-relaxed text-espresso/60">
                {isIOS ? (
                  <>
                    Tap <Share className="-mt-0.5 inline h-3.5 w-3.5" aria-hidden="true" /> Share, then &quot;Add to Home Screen&quot; ♡
                  </>
                ) : (
                  "Open your browser menu, then “Install app” ♡"
                )}
              </p>
            </div>
            <button
              data-testid="install-dismiss"
              onClick={dismiss}
              aria-label="Dismiss install suggestion"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-espresso/50 transition-colors hover:bg-rosemist hover:text-espresso"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
