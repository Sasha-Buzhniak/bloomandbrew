import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, CalendarDays, Clock, CupSoda, Camera, Waves } from "lucide-react";
import { Reveal, RevealImage } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { HeartDoodle, SectionOverline } from "@/components/Decor";
import { IMAGES, DIRECTIONS_URL } from "@/lib/products";

const INFO = [
  { icon: MapPin, title: "Location", lines: ["Tower Bridge", "London, SE1 2UP", "United Kingdom"] },
  { icon: CalendarDays, title: "Dates", lines: ["We're here for a good time,", "not a long time.", "Check our Instagram for", "up-to-date dates!"] },
  { icon: Clock, title: "Opening Hours", lines: ["Mon – Fri 8:00 AM – 2:00 PM", "Sat – Sun 9:00 AM – 4:00 PM", "(Weather permitting)"] },
  { icon: CupSoda, title: "What to Expect", lines: ["Specialty coffee, seasonal", "flowers, good vibes", "and stunning views."] },
];

const HERE_FEATURES = [
  { icon: Camera, title: "Picture Perfect", text: "The perfect spot for your coffee moment." },
  { icon: Waves, title: "River Views", text: "Enjoy your coffee with one of the best views in London." },
  { icon: HeartDoodleIcon, title: "Made with Love", text: "Every coffee + flower combination is made to make you smile." },
];

function HeartDoodleIcon({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
  return <HeartDoodle className={className} />;
}

function StylisedMap() {
  return (
    <svg viewBox="0 0 600 460" role="img" aria-label="Stylised map showing Bloom & Brew on the south side of Tower Bridge" className="h-full w-full">
      <rect width="600" height="460" fill="#F9EFEB" />
      {/* streets */}
      <g stroke="#2C2422" strokeOpacity="0.12" strokeWidth="1.5" fill="none">
        <path d="M0 90 H600" /><path d="M0 380 H600" />
        <path d="M90 0 V460" /><path d="M470 0 V460" />
        <path d="M0 180 C120 160 200 190 300 170" />
        <path d="M180 460 C220 380 260 400 330 330" />
        <path d="M520 460 C500 380 540 340 600 320" />
      </g>
      {/* blocks */}
      <g fill="#F3DDD7">
        <rect x="110" y="110" width="70" height="45" rx="3" />
        <rect x="210" y="105" width="50" height="60" rx="3" />
        <rect x="500" y="110" width="60" height="50" rx="3" />
        <rect x="120" y="390" width="80" height="40" rx="3" />
      </g>
      {/* Thames */}
      <path d="M0 250 C120 210 220 300 330 265 C430 235 500 290 600 250 L600 330 C500 365 420 310 320 340 C210 372 120 290 0 325 Z" fill="#C9DCE1" />
      <path d="M0 268 C120 228 220 315 330 283 C430 253 500 305 600 268" stroke="#A9C6CD" strokeWidth="2" fill="none" />
      {/* Tower Bridge */}
      <g>
        <rect x="270" y="228" width="14" height="34" rx="2" fill="#E7B5B2" stroke="#2C2422" strokeOpacity="0.3" />
        <rect x="316" y="222" width="14" height="36" rx="2" fill="#E7B5B2" stroke="#2C2422" strokeOpacity="0.3" />
        <line x1="284" y1="244" x2="316" y2="240" stroke="#2C2422" strokeOpacity="0.4" strokeWidth="2" />
        <text x="360" y="235" fontFamily="Georgia, serif" fontSize="13" fill="#6E5E5A" letterSpacing="2">TOWER BRIDGE</text>
      </g>
      {/* Pin */}
      <g transform="translate(345 320)">
        <circle r="26" fill="#E7B5B2" fillOpacity="0.35" />
        <path d="M0 -16 C9 -16 15 -9 15 -1 C15 9 0 20 0 20 C0 20 -15 9 -15 -1 C-15 -9 -9 -16 0 -16 Z" fill="#DFA4A5" stroke="#2C2422" strokeOpacity="0.35" />
        <path d="M0 6 C-5 3 -7.5 0.6 -7.5 -2.4 C-7.5 -4.9 -6 -6.3 -4.3 -6.3 C-3 -6.3 -1.5 -5.4 -0.7 -4.2 C0.1 -5.4 1.6 -6.3 2.9 -6.3 C4.6 -6.3 6.1 -4.9 6.1 -2.4 C6.1 0.6 4 3 0 6 Z" fill="#FFF8F4" />
        <text x="30" y="4" fontFamily="'Meow Script', cursive" fontSize="26" fill="#2C2422">Bloom &amp; Brew ♡</text>
      </g>
      <text x="40" y="290" fontFamily="Georgia, serif" fontSize="12" fill="#6E5E5A" letterSpacing="3">RIVER THAMES</text>
      <text x="455" y="60" fontFamily="Georgia, serif" fontSize="11" fill="#6E5E5A" letterSpacing="2">LONDON SE1</text>
    </svg>
  );
}

export default function FindUs() {
  return (
    <div data-testid="find-us-page">
      {/* HERO */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <img src={IMAGES.findusHero} alt="The Bloom & Brew pink flower-covered coffee cart by Tower Bridge at golden hour" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 md:px-8">
          <div className="max-w-xl">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-blush">
              Find Us <HeartDoodle className="h-3.5 w-3.5" />
            </motion.p>
            <motion.h1
              data-testid="findus-heading"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 font-heading text-4xl uppercase leading-tight tracking-editorial text-cream md:text-6xl"
            >
              Come Find Us<br />By the River
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/85 md:text-base">
                We're a cosy pop-up on London's most iconic bridge. Great coffee, fresh flowers and beautiful views.
              </p>
              <a
                data-testid="get-directions-button"
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-lg"
              >
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                Get Directions
              </a>
              <p className="mt-6 font-script text-2xl text-cream/90">See you there! ♡</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 border-y border-espresso/10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {INFO.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.1} className={`flex flex-col items-center text-center ${i > 0 ? "lg:border-l lg:border-espresso/10" : ""}`}>
              <card.icon className="h-6 w-6 text-blushdeep" strokeWidth={1.3} aria-hidden="true" />
              <h3 className="mt-4 text-[12px] font-medium uppercase tracking-micro text-espresso">{card.title}</h3>
              {card.lines.map((line) => (
                <p key={line} className="mt-1 text-sm leading-relaxed text-espresso/60">{line}</p>
              ))}
            </Reveal>
          ))}
        </div>
      </section>

      {/* MAP + RIGHT HERE */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-8 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <RevealImage className="overflow-hidden rounded-sm border border-espresso/10 shadow-[0_20px_50px_rgba(44,36,34,0.08)]">
            <div data-testid="stylised-map" className="aspect-[600/460]">
              <StylisedMap />
            </div>
          </RevealImage>
          <div>
            <Reveal>
              <SectionOverline>Right Here ♡</SectionOverline>
              <h2 className="mt-5 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">
                You'll find us on the south side of Tower Bridge
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-espresso/60">With the best view of the river and the city.</p>
            </Reveal>
            <div className="mt-10 space-y-8">
              {HERE_FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.12}>
                  <div className="flex gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rosemist">
                      <f.icon className="h-5 w-5 text-espresso" strokeWidth={1.3} />
                    </span>
                    <div>
                      <h3 className="text-[12px] font-medium uppercase tracking-micro text-espresso">{f.title}</h3>
                      <p className="mt-1 text-sm text-espresso/60">{f.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <figure className="mt-10 inline-block -rotate-2 bg-white p-3 pb-10 shadow-[0_16px_40px_rgba(44,36,34,0.12)] transition-transform duration-500 hover:rotate-0">
                <img src={IMAGES.bridge} alt="A flower-tied coffee cup on a railing before Tower Bridge at sunrise" loading="lazy" className="aspect-[4/3] w-64 object-cover" />
                <figcaption className="mt-2 text-center font-script text-xl text-espresso/70">See you by the bridge! ♡</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee items={["Tower Bridge", "River Thames", "Golden Hour", "Coffee With a View", "Pop-Up London"]} />

      {/* POP BY */}
      <section className="border-t border-espresso/10 bg-sand py-16 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <p className="font-script text-4xl text-espresso">Pop by and say hi! ♡</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-espresso/60">
            We'd love to see you. Whether it's your morning coffee or a little treat for someone special.
          </p>
          <Link
            to="/menu"
            data-testid="findus-view-menu-button"
            className="mt-7 inline-flex items-center gap-3 rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-lg"
          >
            View Menu
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}
