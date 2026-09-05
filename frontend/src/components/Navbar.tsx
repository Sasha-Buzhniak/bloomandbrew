import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { HeartDoodle } from "@/components/Decor";

const LEFT_LINKS = [
  { to: "/", label: "Home", testid: "nav-link-home" },
  { to: "/menu", label: "Menu", testid: "nav-link-menu" },
  { to: "/our-story", label: "Our Story", testid: "nav-link-our-story" },
  { to: "/gallery", label: "Gallery", testid: "nav-link-gallery" },
];
const RIGHT_LINKS = [
  { to: "/find-us", label: "Find Us", testid: "nav-link-find-us" },
  { to: "/faq", label: "FAQ", testid: "nav-link-faq" },
];
const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS, { to: "/track", label: "Track Order", testid: "nav-link-track" }, { to: "/order", label: "Order Now", testid: "nav-link-order" }];

function Logo() {
  return (
    <Link to="/" data-testid="nav-logo" className="group flex flex-col items-center leading-none">
      <span className="font-script text-3xl text-espresso md:text-4xl">Bloom &amp; Brew</span>
      <span className="mt-1 flex items-center gap-1.5 text-[8px] uppercase tracking-[0.3em] text-espresso/60 md:text-[9px]">
        Coffee <HeartDoodle className="h-2.5 w-2.5 text-blushdeep" /> Flowers <HeartDoodle className="h-2.5 w-2.5 text-blushdeep" /> A Happier You
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[11px] uppercase tracking-micro transition-colors duration-300 hover:text-blushdeep ${
      isActive ? "text-espresso underline decoration-blushdeep decoration-1 underline-offset-8" : "text-espresso/70"
    }`;

  return (
    <header
      data-testid="main-navigation"
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        scrolled ? "border-espresso/10 bg-page/90 shadow-[0_8px_30px_rgba(44,36,34,0.06)] backdrop-blur-md" : "border-transparent bg-page"
      }`}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:px-8 md:py-4">
        <div className="flex items-center gap-6 md:gap-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              data-testid="mobile-menu-button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-colors hover:bg-rosemist md:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-cream p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-1 p-8 pt-14">
                {ALL_LINKS.map((l) => (
                  <button
                    key={l.to}
                    data-testid={`mobile-${l.testid}`}
                    onClick={() => { setOpen(false); navigate(l.to); }}
                    className="border-b border-espresso/10 py-4 text-left font-heading text-xl uppercase tracking-editorial text-espresso transition-colors hover:text-blushdeep"
                  >
                    {l.label}
                  </button>
                ))}
                <p className="mt-8 font-script text-2xl text-blushdeep">Same coffee, more love ♡</p>
              </div>
            </SheetContent>
          </Sheet>
          <div className="hidden items-center gap-7 md:flex">
            {LEFT_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} data-testid={l.testid} className={linkClass} end={l.to === "/"}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex justify-start md:justify-center">
          <Logo />
        </div>

        <div className="flex items-center justify-end gap-4 md:gap-7">
          <div className="hidden items-center gap-7 md:flex">
            {RIGHT_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} data-testid={l.testid} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <Link
            to="/order"
            data-testid="order-now-button"
            className="hidden rounded-full bg-blush px-6 py-2.5 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-md md:inline-block"
          >
            Order Now
          </Link>
          <button
            data-testid="cart-button"
            aria-label="Open shopping basket"
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-colors hover:bg-rosemist"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {count > 0 && (
              <span data-testid="cart-count-badge" className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blushdeep text-[10px] font-semibold text-espresso">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
