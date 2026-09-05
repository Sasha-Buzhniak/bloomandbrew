import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { gbp, PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/products";
import { Marquee } from "@/components/Marquee";
import { HeartDoodle } from "@/components/Decor";
import ProductCard from "@/components/ProductCard";
import CustomizeDialog from "@/components/CustomizeDialog";
import { customisationLabel } from "@/components/CartDrawer";

interface OrderResponse {
  id: string;
  order_number: string;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
}

const PICKUP_TIMES = [
  { value: "asap", label: "As soon as possible (~15 min)" },
  { value: "30min", label: "In about 30 minutes" },
  { value: "1hour", label: "In about 1 hour" },
  { value: "tomorrow", label: "Tomorrow morning" },
];

export default function Order() {
  const { items, subtotal, discount, total, promo, clearCart, openCart } = useCart();
  const [selected, setSelected] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pickup, setPickup] = useState("asap");
  const [confirmed, setConfirmed] = useState<OrderResponse | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<OrderResponse>("/orders", {
        items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          customisation: {
            coffee: i.customisation.coffee ?? null,
            milk: i.customisation.milk ?? null,
            flowers: i.customisation.flowers ?? null,
            flower_branch: i.customisation.flowerBranch,
            gift_card: i.customisation.giftCard,
            gift_note: i.customisation.giftNote ?? null,
          },
        })),
        customer: { name, email, pickup_time: pickup },
        promo_code: promo,
      }),
    onSuccess: (order) => {
      setConfirmed(order);
      clearCart();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? "We couldn't place your order — please check your details and try again." : "Something went wrong");
    },
  });

  const submit = () => {
    if (items.length === 0) return toast.error("Your basket is empty — add something lovely first.");
    if (!name.trim() || !email.trim()) return toast.error("Please add your name and email.");
    mutation.mutate();
  };

  return (
    <div data-testid="order-page">
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-20 text-center md:px-8 md:pt-28">
        <motion.h1
          data-testid="order-heading"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-4xl uppercase tracking-editorial text-espresso md:text-6xl"
        >
          Order Ahead
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-5 font-script text-2xl text-blushdeep md:text-3xl">
          Made with love, ready in about 15 minutes ♡
        </motion.p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_380px]">
          {/* Products */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 xl:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onCustomize={setSelected} />
            ))}
          </div>

          {/* Checkout panel */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {confirmed ? (
              <motion.div
                data-testid="order-confirmation"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="border border-espresso/10 bg-cream p-8 text-center"
              >
                <HeartDoodle className="mx-auto h-8 w-8 animate-float-slow text-blushdeep" />
                <h2 className="mt-4 font-heading text-2xl uppercase tracking-editorial text-espresso">Order Received</h2>
                <p className="mt-3 font-script text-3xl text-blushdeep">See you by the bridge ♡</p>
                <dl className="mt-6 space-y-2 border-t border-espresso/10 pt-5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-espresso/60">Order number</dt>
                    <dd data-testid="order-number" className="font-medium text-espresso">{confirmed.order_number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-espresso/60">Total</dt>
                    <dd data-testid="order-total" className="font-medium text-espresso">{gbp(confirmed.total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-espresso/60">Pickup</dt>
                    <dd className="text-espresso">~15 minutes</dd>
                  </div>
                </dl>
                <p className="mt-5 text-xs leading-relaxed text-espresso/50">
                  Show your order number at the counter — your coffee and flowers will be waiting.
                </p>
                <button
                  data-testid="order-again-button"
                  onClick={() => setConfirmed(null)}
                  className="mt-6 rounded-full border border-espresso/20 px-6 py-3 text-[11px] uppercase tracking-micro transition-colors hover:bg-rosemist"
                >
                  Place Another Order
                </button>
              </motion.div>
            ) : (
              <div data-testid="checkout-panel" className="border border-espresso/10 bg-cream p-7">
                <h2 className="font-heading text-xl uppercase tracking-editorial text-espresso">Your Order</h2>

                {items.length === 0 ? (
                  <div className="mt-5 text-center">
                    <p className="font-script text-2xl text-espresso/60">Your basket is empty ♡</p>
                    <p className="mt-2 text-xs text-espresso/50">Pick a coffee, some flowers — or both.</p>
                  </div>
                ) : (
                  <ul className="mt-5 max-h-56 space-y-3 overflow-y-auto border-b border-espresso/10 pb-4">
                    {items.map((i) => (
                      <li key={i.key} className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="text-espresso">{i.quantity}× {i.name}</p>
                          {customisationLabel(i.customisation) && (
                            <p className="text-[11px] text-espresso/50">{customisationLabel(i.customisation)}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-espresso/70">{gbp(i.price * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-espresso/70">
                    <dt>Subtotal</dt><dd data-testid="checkout-subtotal">{gbp(subtotal)}</dd>
                  </div>
                  {promo && (
                    <div className="flex justify-between text-blushdeep">
                      <dt>Discount ({promo})</dt><dd data-testid="checkout-discount">−{gbp(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-espresso/10 pt-2 font-heading text-lg text-espresso">
                    <dt>Total</dt><dd data-testid="checkout-total">{gbp(total)}</dd>
                  </div>
                </dl>

                <button data-testid="checkout-open-basket" onClick={openCart} className="mt-3 text-[11px] uppercase tracking-micro text-espresso/60 underline underline-offset-4 hover:text-espresso">
                  Edit basket
                </button>

                <div className="mt-6 space-y-3 border-t border-espresso/10 pt-6">
                  <input
                    data-testid="checkout-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 w-full rounded-full border border-espresso/15 bg-page px-5 text-sm outline-none placeholder:text-espresso/40 focus:border-blushdeep"
                  />
                  <input
                    data-testid="checkout-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email for your receipt"
                    className="h-11 w-full rounded-full border border-espresso/15 bg-page px-5 text-sm outline-none placeholder:text-espresso/40 focus:border-blushdeep"
                  />
                  <select
                    data-testid="checkout-pickup-select"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="h-11 w-full appearance-none rounded-full border border-espresso/15 bg-page px-5 text-sm text-espresso outline-none focus:border-blushdeep"
                  >
                    {PICKUP_TIMES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <button
                    data-testid="place-order-button"
                    onClick={submit}
                    disabled={mutation.isPending}
                    className="w-full rounded-full bg-blush py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {mutation.isPending ? "Placing your order…" : `Place Order — ${gbp(total)}`}
                  </button>
                  <p className="text-center text-[10px] uppercase tracking-micro text-espresso/40">Pickup at Tower Bridge · Pay at the counter</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      <Marquee items={["Order Ahead", "Skip the Queue", "Fresh Posies Daily", "Handwritten Notes", "Tower Bridge SE1"]} />

      {selected && (
        <CustomizeDialog key={selected.id} product={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
      )}
    </div>
  );
}
