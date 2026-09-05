import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Sun, Leaf, Users } from "lucide-react";
import { Reveal, RevealImage } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { HeartDoodle, SectionOverline } from "@/components/Decor";
import { IMAGES } from "@/lib/products";

const VALUES = [
  { icon: Heart, title: "Spread Kindness", text: "A little coffee and a flower can brighten someone's day." },
  { icon: Sun, title: "Celebrate the Everyday", text: "Beauty lives in the small moments." },
  { icon: Leaf, title: "Support Local", text: "Work with local growers and small suppliers." },
  { icon: Users, title: "Build a Community", text: "Good coffee brings people together — and so do flowers." },
];

const CHAPTERS = [
  "Bloom & Brew was born from a love for slow mornings, pretty details, and the belief that small gestures can make a big difference.",
  "We wanted to create a space where people could pause, treat themselves — or someone special — and feel a little happier for just a moment.",
  "What started as a small coffee concept grew into a celebration of coffee lovers, flower lovers and people who believe in brighter days.",
];

export default function OurStory() {
  return (
    <div data-testid="our-story-page">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-20 text-center md:px-8 md:pt-28">
        <motion.h1
          data-testid="story-heading"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-5xl uppercase tracking-editorial text-espresso md:text-7xl"
        >
          Our Story
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-5 font-script text-2xl text-blushdeep md:text-3xl">
          A little coffee. A little flower. A brighter you.
        </motion.p>
        <Reveal className="mx-auto mt-8 max-w-2xl">
          <p className="text-sm leading-relaxed text-espresso/65 md:text-base">
            We started Bloom &amp; Brew with a simple idea — to bring together two of life's simplest joys: great coffee and beautiful flowers.
          </p>
        </Reveal>
      </section>

      {/* HOW IT ALL BEGAN */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr_0.8fr]">
          <RevealImage className="overflow-hidden rounded-sm">
            <img src={IMAGES.story} alt="A barista handing a flower-tied coffee across a wooden counter" className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105" />
          </RevealImage>
          <div>
            <Reveal>
              <SectionOverline>Chapter 01</SectionOverline>
              <h2 className="mt-5 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">How It All Began</h2>
            </Reveal>
            <div className="mt-8 space-y-8">
              {CHAPTERS.map((text, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <div className="flex gap-5">
                    <span className="font-script text-3xl text-blushdeep">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-sm leading-relaxed text-espresso/65 md:text-base">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <p className="mt-8 font-script text-2xl text-blushdeep">Same coffee, more love ♡</p>
            </Reveal>
          </div>
          <div className="hidden flex-col gap-8 lg:flex">
            <Reveal delay={0.15}>
              <figure className="rotate-2 bg-white p-3 pb-10 shadow-[0_16px_40px_rgba(44,36,34,0.12)] transition-transform duration-500 hover:rotate-0">
                <img src={IMAGES.gift} alt="Hands gifting a small cup of fresh flowers" loading="lazy" className="aspect-square w-full object-cover" />
                <figcaption className="mt-2 text-center font-script text-xl text-espresso/70">for someone special ♡</figcaption>
              </figure>
            </Reveal>
            <Reveal delay={0.25}>
              <figure className="-rotate-2 bg-white p-3 pb-10 shadow-[0_16px_40px_rgba(44,36,34,0.12)] transition-transform duration-500 hover:rotate-0">
                <img src={IMAGES.notes} alt="A handwritten note with a pink ribbon and coffee" loading="lazy" className="aspect-square w-full object-cover" />
                <figcaption className="mt-2 text-center font-script text-xl text-espresso/70">little notes, big love</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHAT DRIVES US */}
      <section className="border-y border-espresso/10 bg-sand py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <Reveal className="text-center">
            <SectionOverline>Chapter 02</SectionOverline>
            <h2 className="mt-5 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">What Drives Us</h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1} className="border-t border-espresso/15 pt-6">
                <v.icon className="h-6 w-6 text-blushdeep" strokeWidth={1.3} aria-hidden="true" />
                <h3 className="mt-4 text-[12px] font-medium uppercase tracking-micro text-espresso">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-espresso/60">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center md:px-8 md:py-32">
        <Reveal>
          <HeartDoodle className="mx-auto h-7 w-7 text-blushdeep" />
          <blockquote data-testid="story-quote" className="mt-8 font-heading text-3xl uppercase leading-snug tracking-editorial text-espresso md:text-5xl">
            "We believe a happier world starts with kinder mornings."
          </blockquote>
          <p className="mt-8 font-script text-3xl text-blushdeep">Bloom &amp; Brew ♡</p>
          <Link
            to="/menu"
            data-testid="story-menu-button"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-lg"
          >
            Explore the Menu
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </Reveal>
      </section>

      <Marquee items={["Slow Mornings", "Pretty Details", "Small Gestures", "Brighter Days", "Coffee Lovers", "Flower Lovers"]} />
    </div>
  );
}
