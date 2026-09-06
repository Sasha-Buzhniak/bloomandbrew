import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { apiPost } from "@/lib/api";
import { gbp, IMAGES, useCatalog } from "@/lib/products";
import { Reveal } from "@/components/Reveal";
import { HeartDoodle } from "@/components/Decor";
import type { CheckoutSessionResponse } from "@/lib/orders";

const FLOWER_COLOURS = ["Pink", "White", "Mixed", "Seasonal"];
const COFFEES = ["Latte", "Cappuccino", "Americano", "Matcha", "Iced Latte"];
const MILKS = ["Whole", "Oat", "Almond", "Soy"];
const GIFT_IDS = ["lovely-latte", "flowers-cup", "the-perfect-pair"];

function Pills({ options, value, onChange, testid }: { options: string[]; value: string; onChange: (v: string) => void; testid: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          data-testid={`${testid}-${o.toLowerCase().replace(/\s+/g, "-")}`}
          onClick={() => onChange(o)}
          className={`rounded-full border px-4 py-1.5 text-xs transition-all duration-300 ${
            value === o ? "border-espresso bg-espresso text-cream" : "border-espresso/20 text-espresso/70 hover:border-espresso/50"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

const inputClass = "h-11 w-full rounded-full border border-espresso/15 bg-cream px-5 text-sm outline-none placeholder:text-espresso/40 focus:border-blushdeep";

export default function Gift() {
  const [params] = useSearchParams();
  const { products } = useCatalog();
  const plans = GIFT_IDS.flatMap((id) => {
    const p = products.find((x) => x.id === id);
    return p && p.in_stock !== false ? [p] : [];
  });
  const [productId, setProductId] = useState("the-perfect-pair");
  const [flowerColour, setFlowerColour] = useState("Pink");
  const [coffee, setCoffee] = useState("Latte");
  const [milk, setMilk] = useState("Oat");
  const [recipientName, setRecipientName] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [note, setNote] = useState("");
  const [gifterName, setGifterName] = useState("");
  const [gifterEmail, setGifterEmail] = useState("");

  const selected = plans.find((p) => p.id === productId) ?? plans[0];
  const hasCoffee = productId !== "flowers-cup";

  useEffect(() => {
    if (params.get("cancelled")) toast.error("No worries — the flowers will wait ♡");
  }, [params]);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<CheckoutSessionResponse>("/gift-subscriptions/checkout", {
        product_id: productId,
        flower_colour: flowerColour,
        coffee: hasCoffee ? coffee : null,
        milk: hasCoffee ? milk : null,
        recipient_name: recipientName,
        address_line1: address1,
        city,
        postcode,
        gift_note: note || null,
        gifter_name: gifterName,
        gifter_email: gifterEmail,
        origin_url: window.location.origin,
      }),
    onSuccess: (d) => {
      window.location.href = d.checkout_url;
    },
    onError: () => toast.error("We couldn't start checkout — please check the details and try again."),
  });

  const submit = () => {
    if (!recipientName.trim() || !address1.trim() || !city.trim() || !postcode.trim()) {
      return toast.error("Tell us where the blooms should go — recipient and address are needed.");
    }
    if (!gifterName.trim() || !gifterEmail.trim()) {
      return toast.error("We need your name and email for the receipt.");
    }
    mutation.mutate();
  };

  return (
    <div data-testid="gift-page">
      <section className="relative flex min-h-[52vh] items-center overflow-hidden">
        <img src={IMAGES.gift} alt="Hands gifting a small cup of fresh flowers" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 md:px-8">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="font-script text-3xl text-[#F7D8D6]">
            happiness, on repeat ♡
          </motion.p>
          <motion.h1
            data-testid="gift-heading"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 max-w-2xl font-heading text-4xl uppercase leading-tight tracking-editorial text-cream md:text-6xl"
          >
            Gift a Week<br />of Mornings
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-5 max-w-md text-sm leading-relaxed text-cream/85 md:text-base">
            A little coffee and a hand-tied posy, delivered every week to someone who deserves brighter mornings. Their name on the cup, your words on the card.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            <Reveal>
              <p className="text-[10px] uppercase tracking-micro text-espresso/50">Step 01 — The weekly treat</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    data-testid={`gift-plan-${p.id}`}
                    onClick={() => setProductId(p.id)}
                    className={`group border bg-cream p-3 text-left transition-all duration-300 hover:-translate-y-1 ${
                      productId === p.id ? "border-espresso shadow-[0_14px_30px_rgba(44,36,34,0.1)]" : "border-espresso/10"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <img src={p.image} alt={p.alt} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <p className="mt-3 font-heading text-base text-espresso">{p.name}</p>
                    <p className="mt-0.5 text-xs text-espresso/55">{gbp(p.price)} / week</p>
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <p className="text-[10px] uppercase tracking-micro text-espresso/50">Step 02 — The flowers</p>
              <div className="mt-3">
                <Pills options={FLOWER_COLOURS} value={flowerColour} onChange={setFlowerColour} testid="gift-flowers" />
              </div>
            </Reveal>

            {hasCoffee && (
              <Reveal delay={0.15} className="mt-10">
                <p className="text-[10px] uppercase tracking-micro text-espresso/50">Step 03 — Their coffee</p>
                <div className="mt-3">
                  <Pills options={COFFEES} value={coffee} onChange={setCoffee} testid="gift-coffee" />
                </div>
                <p className="mt-5 text-[10px] uppercase tracking-micro text-espresso/50">Milk</p>
                <div className="mt-3">
                  <Pills options={MILKS} value={milk} onChange={setMilk} testid="gift-milk" />
                </div>
              </Reveal>
            )}

            <Reveal delay={0.2} className="mt-10">
              <div className="border border-espresso/10 bg-sand/60 p-6">
                <HeartDoodle className="h-5 w-5 text-blushdeep" />
                <p className="mt-3 text-sm leading-relaxed text-espresso/65">
                  Every week our baristas hand-make the order, tie the posy fresh that morning, and handwrite your note on the card. Pause or cancel anytime with one email to hello@bloomandbrew.london.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div data-testid="gift-details-panel" className="border border-espresso/10 bg-cream p-7 lg:sticky lg:top-28">
              <h2 className="font-heading text-xl uppercase tracking-editorial text-espresso">Delivery Details</h2>

              <div className="mt-5 space-y-3">
                <p className="text-[10px] uppercase tracking-micro text-espresso/50">The lucky person</p>
                <input data-testid="gift-recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient's name" className={inputClass} />
                <input data-testid="gift-address" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Street address" className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input data-testid="gift-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputClass} />
                  <input data-testid="gift-postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="Postcode" className={inputClass} />
                </div>
                <textarea
                  data-testid="gift-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Your handwritten note, every week…"
                  rows={2}
                  maxLength={120}
                  className="w-full resize-none rounded-2xl border border-espresso/15 bg-cream px-5 py-3 font-script text-xl text-espresso outline-none placeholder:text-espresso/35 focus:border-blushdeep"
                />
                <p className="pt-2 text-[10px] uppercase tracking-micro text-espresso/50">From you</p>
                <input data-testid="gift-gifter-name" value={gifterName} onChange={(e) => setGifterName(e.target.value)} placeholder="Your name" className={inputClass} />
                <input data-testid="gift-gifter-email" type="email" value={gifterEmail} onChange={(e) => setGifterEmail(e.target.value)} placeholder="Your email for the receipt" className={inputClass} />
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-espresso/10 pt-4">
                <span className="text-sm text-espresso/60">{selected?.name ?? "—"}, weekly</span>
                <span data-testid="gift-weekly-price" className="font-heading text-2xl text-espresso">{gbp(selected?.price ?? 0)}<span className="text-sm text-espresso/50">/wk</span></span>
              </div>
              <button
                data-testid="gift-start-button"
                onClick={submit}
                disabled={mutation.isPending}
                className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-espresso py-4 text-[11px] font-medium uppercase tracking-micro text-cream transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              >
                {mutation.isPending ? "Opening secure checkout…" : "Start the Weekly Gift"}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <p className="mt-3 text-center text-[10px] uppercase tracking-micro text-espresso/40">Renews weekly · Card secured by Stripe · Cancel anytime</p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
