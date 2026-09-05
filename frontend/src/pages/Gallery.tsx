import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { HeartDoodle } from "@/components/Decor";
import { IMAGES, PRODUCTS, INSTAGRAM_URL } from "@/lib/products";

type FilterKey = "all" | "coffee" | "flowers" | "people" | "popup" | "london" | "moments";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "coffee", label: "Coffee" },
  { key: "flowers", label: "Flowers" },
  { key: "people", label: "People" },
  { key: "popup", label: "Our Pop-Up" },
  { key: "london", label: "London" },
  { key: "moments", label: "Special Moments" },
];

interface Tile {
  kind: "image" | "text";
  src?: string;
  alt?: string;
  cats: FilterKey[];
  text?: string;
  tall?: boolean;
}

const TILES: Tile[] = [
  { kind: "image", src: PRODUCTS[0].image, alt: PRODUCTS[0].alt, cats: ["coffee"] },
  { kind: "image", src: IMAGES.woman, alt: "A woman enjoying a flower-tied coffee on a London street", cats: ["people"] },
  { kind: "image", src: IMAGES.bridge, alt: "A coffee cup with flowers on a railing before Tower Bridge", cats: ["london", "coffee"] },
  { kind: "text", text: "Life tastes better with flowers ♡", cats: ["all"] },
  { kind: "image", src: PRODUCTS[3].image, alt: PRODUCTS[3].alt, cats: ["flowers"] },
  { kind: "image", src: IMAGES.couple, alt: "A couple sharing coffee and flowers by the Thames", cats: ["people", "london", "moments"] },
  { kind: "image", src: PRODUCTS[4].image, alt: PRODUCTS[4].alt, cats: ["coffee"] },
  { kind: "image", src: IMAGES.findusHero, alt: "The Bloom & Brew flower-covered coffee cart by Tower Bridge", cats: ["popup", "london"] },
  { kind: "image", src: IMAGES.gift, alt: "Gifting a small cup of fresh flowers", cats: ["moments", "people"] },
  { kind: "text", text: "Good people, good coffee, beautiful days", cats: ["all"] },
  { kind: "image", src: IMAGES.street, alt: "A London flower stall in the early morning", cats: ["london", "flowers"] },
  { kind: "image", src: PRODUCTS[9].image, alt: PRODUCTS[9].alt, cats: ["coffee"] },
  { kind: "image", src: IMAGES.notes, alt: "A handwritten note with a pink ribbon", cats: ["moments"] },
  { kind: "image", src: PRODUCTS[5].image, alt: PRODUCTS[5].alt, cats: ["coffee", "flowers", "moments"] },
  { kind: "image", src: IMAGES.story, alt: "Inside the Bloom & Brew pop-up", cats: ["popup", "people"] },
  { kind: "image", src: PRODUCTS[7].image, alt: PRODUCTS[7].alt, cats: ["flowers"] },
];

export default function Gallery() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const visible = TILES.filter((t) => filter === "all" || t.cats.includes(filter));

  return (
    <div data-testid="gallery-page">
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-20 text-center md:px-8 md:pt-28">
        <motion.h1
          data-testid="gallery-heading"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-4xl uppercase tracking-editorial text-espresso md:text-6xl"
        >
          Moments That Bloom
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-espresso/60 md:text-base">
          Real people. Real moments. Coffee, flowers and a little more love in everyday life.
        </motion.p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <Reveal className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              data-testid={`gallery-filter-${f.key}`}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-5 py-2 text-[10px] uppercase tracking-micro transition-all duration-300 ${
                filter === f.key ? "border-espresso bg-espresso text-cream" : "border-espresso/20 text-espresso/60 hover:border-espresso/50 hover:text-espresso"
              }`}
            >
              {f.label}
            </button>
          ))}
        </Reveal>

        <motion.div layout className="mt-12 columns-2 gap-4 md:columns-3">
          <AnimatePresence>
            {visible.map((tile, i) =>
              tile.kind === "text" ? (
                <motion.div
                  key={`text-${i}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 break-inside-avoid border border-espresso/10 bg-cream p-8 text-center"
                >
                  <HeartDoodle className="mx-auto h-5 w-5 text-blushdeep" />
                  <p className="mt-4 font-heading text-lg uppercase leading-relaxed tracking-editorial text-espresso">{tile.text}</p>
                </motion.div>
              ) : (
                <motion.figure
                  key={tile.src}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group mb-4 break-inside-avoid overflow-hidden"
                >
                  <img src={tile.src} alt={tile.alt} loading="lazy" className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                </motion.figure>
              ),
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <section className="border-t border-espresso/10 bg-rosemist/50 py-16 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <h2 className="font-heading text-2xl uppercase tracking-editorial text-espresso md:text-3xl">Share Your Moment</h2>
          <p className="mt-4 text-sm leading-relaxed text-espresso/60">
            Post your Coffee &amp; Flowers on Instagram, tag us and get 5% off your next order!
          </p>
          <a
            data-testid="gallery-instagram-button"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-blush px-7 py-3.5 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-md"
          >
            @bloomandbrew
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </section>
    </div>
  );
}
