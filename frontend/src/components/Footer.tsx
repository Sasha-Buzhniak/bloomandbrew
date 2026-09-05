import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { HeartDoodle } from "@/components/Decor";
import { INSTAGRAM_URL, TIKTOK_URL, PINTEREST_URL } from "@/lib/products";

const SOCIALS = [
  { label: "Instagram", url: INSTAGRAM_URL, testid: "social-instagram" },
  { label: "TikTok", url: TIKTOK_URL, testid: "social-tiktok" },
  { label: "Pinterest", url: PINTEREST_URL, testid: "social-pinterest" },
];

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="border-t border-espresso/10 bg-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3 md:px-8 md:py-20">
        <div>
          <p className="font-heading text-2xl uppercase leading-relaxed tracking-editorial text-espresso">
            Good People<br />Good Coffee<br />Beautiful Days
          </p>
          <HeartDoodle className="mt-4 h-5 w-5 text-blushdeep" />
        </div>
        <div className="flex flex-col items-start md:items-center">
          <span className="font-script text-4xl text-espresso">Bloom &amp; Brew</span>
          <span className="mt-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.3em] text-espresso/60">
            Coffee <HeartDoodle className="h-2.5 w-2.5 text-blushdeep" /> Flowers <HeartDoodle className="h-2.5 w-2.5 text-blushdeep" /> A Happier You
          </span>
          <div className="mt-6 flex items-center gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                data-testid={s.testid}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-full border border-espresso/15 px-4 py-2 text-[10px] uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blush"
              >
                {s.label}
                <ArrowUpRight className="h-3 w-3 text-espresso/50 transition-colors group-hover:text-espresso" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-micro text-espresso/50">@bloomandbrew</p>
        </div>
        <div className="flex flex-col gap-6 md:items-end">
          <div className="flex flex-col gap-2 text-sm text-espresso/70 md:items-end">
            <Link data-testid="footer-link-track" to="/track" className="transition-colors hover:text-blushdeep">Track Order</Link>
            <Link data-testid="footer-link-privacy" to="/faq" className="transition-colors hover:text-blushdeep">Privacy Policy</Link>
            <Link data-testid="footer-link-terms" to="/faq" className="transition-colors hover:text-blushdeep">Terms &amp; Conditions</Link>
            <a data-testid="footer-link-contact" href="mailto:hello@bloomandbrew.london" className="transition-colors hover:text-blushdeep">Contact</a>
          </div>
          <div className="text-xs text-espresso/50 md:text-right">
            <p className="uppercase tracking-micro">Tower Bridge, London SE1 2UP</p>
            <p className="mt-1">Mon – Fri 8:00 – 14:00 · Sat – Sun 9:00 – 16:00</p>
          </div>
        </div>
      </div>
      <div className="border-t border-espresso/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-[10px] uppercase tracking-micro text-espresso/45 md:flex-row md:px-8">
          <span>© 2026 Bloom &amp; Brew. All rights reserved.</span>
          <span className="flex items-center gap-1.5">Made with love in London <ArrowUpRight className="h-3 w-3" /></span>
        </div>
      </div>
    </footer>
  );
}
