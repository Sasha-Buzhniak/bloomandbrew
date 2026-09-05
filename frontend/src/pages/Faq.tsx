import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { HeartDoodle } from "@/components/Decor";
import { IMAGES } from "@/lib/products";

const FAQS = [
  { q: "Where can I find you?", a: "You'll find our little pink pop-up on the south side of Tower Bridge, London SE1 2UP — right by the river, with one of the best views in the city." },
  { q: "What are your opening hours?", a: "Monday to Friday, 8:00 AM – 2:00 PM, and Saturday to Sunday, 9:00 AM – 4:00 PM. Weather permitting — London skies permitting, always." },
  { q: "Do you offer takeaway?", a: "Yes — everything we make is designed to travel with you. Cups, flower posies and gift combinations all leave the counter ready for the walk, the office or the date." },
  { q: "Can I choose my flowers?", a: "Of course. Pick from pink, white, mixed or the seasonal bunch of the day, and we'll hand-tie your posy while your coffee is being made." },
  { q: "Are the flowers seasonal?", a: "Always. We work with local growers, so the posies change with the seasons — daisies, carnations, tulips, small roses, baby's breath and whatever is blooming beautifully right now." },
  { q: "Do you offer gift options?", a: "Yes — The Perfect Pair pairs any coffee with a little cup of flowers, and you can add a handwritten gift card with your own words to anything on the menu." },
  { q: "How do I get my 5% Instagram discount?", a: "Post your Bloom & Brew moment on Instagram, tag @bloomandbrew, and show us your post at the counter — or use code BLOOM5 when ordering online." },
  { q: "Do you accept card payments?", a: "Yes, we accept all major cards, contactless and mobile payments. No cash needed — just bring your good mood." },
  { q: "Can I pre-order?", a: "Yes — order online and your coffee and flowers will be ready for pickup in about 15 minutes. Perfect for brightening a colleague's morning on your way in." },
  { q: "Do you have vegan or dairy-free options?", a: "Absolutely. Oat, almond and soy milk are all available for every coffee, at no extra charge — and our flowers are always plant-based." },
  { q: "Any other questions?", a: "We'd love to hear from you. Email hello@bloomandbrew.london or come find us by the bridge — we answer best over a fresh latte." },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <Reveal delay={Math.min(index, 5) * 0.05}>
      <div className="border-b border-espresso/10">
        <button
          data-testid={`faq-question-${index}`}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-6 py-6 text-left"
        >
          <span className="font-heading text-lg text-espresso md:text-xl">{q}</span>
          <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.35 }} className="shrink-0 text-blushdeep">
            <Plus className="h-5 w-5" strokeWidth={1.5} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p data-testid={`faq-answer-${index}`} className="max-w-2xl pb-7 text-sm leading-relaxed text-espresso/65">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export default function Faq() {
  return (
    <div data-testid="faq-page">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-20 md:grid-cols-2 md:px-8 md:pt-28">
          <div>
            <motion.h1
              data-testid="faq-heading"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-4xl uppercase tracking-editorial text-espresso md:text-6xl"
            >
              You Ask,<br />We Answer.
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-5 font-script text-2xl text-blushdeep md:text-3xl">
              Good coffee. Brighter days.
            </motion.p>
          </div>
          <Reveal className="hidden md:block">
            <figure className="ml-auto w-72 rotate-2 bg-white p-3 pb-10 shadow-[0_16px_40px_rgba(44,36,34,0.12)] transition-transform duration-500 hover:rotate-0">
              <img src={IMAGES.notes} alt="A blank note card with a pink ribbon and coffee" className="aspect-square w-full object-cover" />
              <figcaption className="mt-2 text-center font-script text-xl text-espresso/70">ask us anything ♡</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 md:px-8">
        <div className="border-t border-espresso/10">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>
      </section>

      <section className="border-t border-espresso/10 bg-rosemist/50 py-16 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
          <HeartDoodle className="h-6 w-6 text-blushdeep" />
          <h2 className="mt-4 font-heading text-2xl uppercase tracking-editorial text-espresso md:text-3xl">Still Need Help?</h2>
          <p className="mt-4 text-sm leading-relaxed text-espresso/60">
            Send us a message and we'll get back to you as soon as possible.
          </p>
          <a
            data-testid="faq-email-button"
            href="mailto:hello@bloomandbrew.london"
            className="mt-7 inline-block rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-lg"
          >
            Email Us
          </a>
        </div>
      </section>
    </div>
  );
}
