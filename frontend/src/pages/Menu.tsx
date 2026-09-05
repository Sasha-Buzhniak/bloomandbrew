import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { HeartDoodle } from "@/components/Decor";
import ProductCard from "@/components/ProductCard";
import CustomizeDialog from "@/components/CustomizeDialog";
import { PRODUCTS, IMAGES } from "@/lib/products";
import type { Product, Category } from "@/lib/products";

const FILTERS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "coffee", label: "Coffee" },
  { key: "flowers", label: "Flowers" },
  { key: "combo", label: "Coffee + Flowers" },
  { key: "seasonal", label: "Seasonal" },
];

export default function Menu() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<Product | null>(null);
  const visible = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div data-testid="menu-page">
      {/* HERO */}
      <section className="relative flex h-[46vh] min-h-[340px] items-center justify-center overflow-hidden">
        <img src={IMAGES.street} alt="A London flower stall overflowing with pink blooms in the morning light" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-espresso/55" />
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <motion.h1
            data-testid="menu-heading"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl uppercase tracking-editorial text-cream md:text-6xl"
          >
            Coffee <span className="font-script normal-case tracking-normal text-blush">×</span> Flowers
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col items-center">
            <HeartDoodle className="mt-4 h-6 w-6 text-blush" />
            <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-cream/80">Same coffee. More love.</p>
          </motion.div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <Reveal className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              data-testid={`menu-filter-${f.key}`}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-5 py-2 text-[10px] uppercase tracking-micro transition-all duration-300 ${
                filter === f.key ? "border-espresso bg-espresso text-cream" : "border-espresso/20 text-espresso/60 hover:border-espresso/50 hover:text-espresso"
              }`}
            >
              {f.label}
            </button>
          ))}
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 xl:grid-cols-5">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onCustomize={setSelected} />
          ))}
        </div>
      </section>

      <Marquee items={["London", "Flowers", "Coffee", "Brighter Mornings", "Est. 2024"]} />

      {selected && (
        <CustomizeDialog key={selected.id} product={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
      )}
    </div>
  );
}
