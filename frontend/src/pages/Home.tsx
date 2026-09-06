import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Coffee, Flower2, Heart, MapPin, Camera, Gift, CupSoda, Percent } from "lucide-react";
import { Reveal, RevealImage } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { HeartDoodle, SectionOverline } from "@/components/Decor";
import ProductCard from "@/components/ProductCard";
import { IMAGES, PRODUCTS, INSTAGRAM_URL, useCatalog } from "@/lib/products";

const HERO_LINES = ["GOOD COFFEE", "BRIGHTER", "MORNINGS"];

const FEATURES = [
  { icon: Coffee, title: "Specialty Coffee", text: "Great coffee, brighter days" },
  { icon: Flower2, title: "Fresh Flowers", text: "Handpicked blooms for every moment" },
  { icon: Heart, title: "Perfect Together", text: "Coffee + flowers = happiness" },
  { icon: MapPin, title: "Pop-Up Experience", text: "Find us around London for a little extra love" },
];

const CATEGORIES = [
  { title: "Coffee", text: "Classic favourites with a floral touch", image: PRODUCTS[6].image, alt: PRODUCTS[6].alt },
  { title: "Flowers", text: "Seasonal blooms in a cup", image: PRODUCTS[3].image, alt: PRODUCTS[3].alt },
  { title: "Coffee + Flowers", text: "The perfect pair", image: PRODUCTS[5].image, alt: PRODUCTS[5].alt },
  { title: "Seasonal Specials", text: "New flavours, fresh blooms", image: PRODUCTS[9].image, alt: PRODUCTS[9].alt },
];

const STEPS = [
  { icon: CupSoda, title: "Choose", text: "Your favourite coffee, flowers, or both." },
  { icon: Heart, title: "Enjoy", text: "A little beauty for your day." },
  { icon: Camera, title: "Share", text: "Post on Instagram & tag us." },
  { icon: Percent, title: "Get 5% Off", text: "Receive 5% off your next order." },
];

const FEATURED_IDS = ["lovely-latte", "flowers-cup", "the-perfect-pair"];

const POLAROIDS = [
  { image: IMAGES.woman, caption: "morning rituals ♡", rotate: "-rotate-3" },
  { image: IMAGES.notes, caption: "little notes", rotate: "rotate-2" },
  { image: IMAGES.gift, caption: "for you ♡", rotate: "-rotate-2" },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const { products } = useCatalog();
  const featured = FEATURED_IDS.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section ref={heroRef} className="relative flex min-h-[100svh] items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 -bottom-24">
          <img
            src={IMAGES.hero}
            alt="A hand in a pink sweater holding an iced latte with a tiny posy of pink flowers, in front of a London flower stall"
            className="h-full w-full object-cover"
          />
          <div className="hero-scrim absolute inset-0" />
          <div className="hero-scrim-bottom absolute inset-0 md:hidden" />
        </motion.div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-28 md:px-8">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-script text-2xl text-[#F7D8D6] md:text-3xl"
            >
              est. London — with love
            </motion.p>
            <h1 data-testid="hero-heading" className="mt-4 font-heading text-5xl font-medium uppercase leading-[1.08] tracking-editorial text-cream sm:text-6xl lg:text-7xl">
              {HERO_LINES.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-1">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, delay: 0.25 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }}>
              <HeartDoodle className="mt-4 h-6 w-6 text-blush" />
              <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/85 md:text-base">
                A cosy London coffee shop where specialty coffee meets fresh flowers. Because sometimes the smallest gesture can make someone's day.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  to="/order"
                  data-testid="hero-order-button"
                  className="group inline-flex items-center gap-3 rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-lg"
                >
                  Order Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
                </Link>
                <Link to="/our-story" data-testid="hero-story-link" className="text-[11px] uppercase tracking-micro text-cream/80 underline decoration-blush/60 underline-offset-8 transition-colors hover:text-cream">
                  Our Concept
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="absolute bottom-24 right-10 z-10 hidden -rotate-6 font-script text-3xl text-cream/90 lg:block"
        >
          Same coffee, more love ♡
        </motion.p>
      </section>

      <Marquee items={["Good Coffee", "Fresh Flowers", "Brighter Mornings", "Tower Bridge SE1", "Hand-Tied Posies", "Small Things, Big Love"]} />

      {/* FEATURE STRIP */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1} className="flex flex-col items-center text-center">
              <f.icon className="h-7 w-7 text-espresso/70" strokeWidth={1.2} aria-hidden="true" />
              <h3 className="mt-4 text-[12px] font-medium uppercase tracking-micro text-espresso">{f.title}</h3>
              <p className="mt-2 max-w-[220px] text-sm text-espresso/60">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="bg-sand py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="font-script text-4xl text-espresso md:text-5xl">Find Your Perfect Moment <span className="text-blushdeep">♡</span></h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.1}>
                <Link
                  to="/menu"
                  data-testid={`category-card-${c.title.toLowerCase().replace(/[\s+]+/g, "-")}`}
                  className="group block border border-espresso/10 bg-cream p-4 pb-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(44,36,34,0.1)]"
                >
                  <div className="overflow-hidden">
                    <img src={c.image} alt={c.alt} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg uppercase tracking-editorial text-espresso">{c.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-espresso/55">{c.text}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-espresso/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blushdeep" strokeWidth={1.5} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <Reveal className="flex flex-col items-center text-center">
          <SectionOverline>Signature Collection</SectionOverline>
          <h2 data-testid="featured-heading" className="mt-5 max-w-3xl font-heading text-3xl uppercase leading-snug tracking-editorial text-espresso md:text-4xl">
            Coffee for you. Flowers for someone special.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-espresso/60">
            Every cup can carry a tiny hand-tied posy — for a friend, a colleague, a date, or a stranger having a hard morning.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* GIFT SUBSCRIPTION BANNER */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-8 md:pb-28">
        <Reveal>
          <div className="grid items-center overflow-hidden rounded-sm border border-espresso/10 bg-cream md:grid-cols-2">
            <div className="h-64 overflow-hidden md:h-80">
              <img src={IMAGES.gift} alt="Hands gifting a small cup of fresh flowers" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
            <div className="p-8 md:p-12">
              <p className="font-script text-2xl text-blushdeep">new — happiness on repeat ♡</p>
              <h2 className="mt-2 font-heading text-2xl uppercase tracking-editorial text-espresso md:text-3xl">Gift a Week of Mornings</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-espresso/60">
                Send someone a little coffee and a hand-tied posy every single week — with their name on the cup and your words on the card.
              </p>
              <Link
                to="/gift"
                data-testid="home-gift-link"
                className="mt-6 inline-flex items-center gap-3 rounded-full bg-blush px-7 py-3.5 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-md"
              >
                Start a Weekly Gift
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-espresso/10 bg-rosemist/50 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <Reveal className="text-center">
            <h2 className="font-heading text-2xl uppercase tracking-editorial text-espresso md:text-3xl">How It Works</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1} className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush/70">
                  <s.icon className="h-6 w-6 text-espresso" strokeWidth={1.3} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[12px] font-medium uppercase tracking-micro text-espresso">{s.title}</h3>
                <p className="mt-2 max-w-[220px] text-sm text-espresso/60">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SHARE THE LOVE */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto h-[380px] max-w-md md:h-[440px]">
              {POLAROIDS.map((p, i) => (
                <figure
                  key={p.caption}
                  className={`absolute w-[62%] bg-white p-3 pb-10 shadow-[0_16px_40px_rgba(44,36,34,0.14)] transition-transform duration-500 hover:z-20 hover:rotate-0 ${p.rotate}`}
                  style={{ left: `${i * 20}%`, top: `${i * 14}%`, zIndex: i }}
                >
                  <img src={p.image} alt={p.caption} loading="lazy" className="aspect-square w-full object-cover" />
                  <figcaption className="mt-2 text-center font-script text-xl text-espresso/70">{p.caption}</figcaption>
                </figure>
              ))}
              <HeartDoodle className="absolute -left-2 top-2 h-7 w-7 animate-float-slow text-blushdeep" />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <SectionOverline>@bloomandbrew</SectionOverline>
            <h2 data-testid="share-love-heading" className="mt-5 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-5xl">
              Share<br />the Love
            </h2>
            <HeartDoodle className="mt-4 h-6 w-6 text-blushdeep" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-espresso/65 md:text-base">
              Post your Bloom &amp; Brew moment on Instagram, tag us and get 5% off your next order.
            </p>
            <a
              data-testid="tag-instagram-button"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-lg"
            >
              Tag Us on Instagram
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <p className="mt-6 font-script text-2xl text-blushdeep">Same coffee, more love ♡</p>
          </Reveal>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative overflow-hidden">
        <RevealImage>
          <div className="relative h-[52vh] min-h-[380px]">
            <img src={IMAGES.couple} alt="A couple sharing coffee with flowers by the Thames at golden hour" loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-espresso/45" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <Gift className="h-6 w-6 text-blush" strokeWidth={1.3} aria-hidden="true" />
              <p className="mt-4 max-w-2xl font-heading text-2xl uppercase leading-snug tracking-editorial text-cream md:text-4xl">
                More than coffee.<br />A brighter morning.
              </p>
              <Link
                to="/find-us"
                data-testid="home-visit-popup-button"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-lg"
              >
                Visit Our Pop-Up
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </RevealImage>
      </section>
    </div>
  );
}
