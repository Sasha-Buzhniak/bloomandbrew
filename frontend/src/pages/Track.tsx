import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Coffee, CupSoda, Flower2, Search } from "lucide-react";
import { apiGet, ApiError } from "@/lib/api";
import { gbp } from "@/lib/products";
import { HeartDoodle } from "@/components/Decor";
import { Reveal } from "@/components/Reveal";
import { itemCustomisationLabel } from "@/lib/orders";
import type { TrackResponse } from "@/lib/orders";

const STEPS = [
  { key: "received", label: "Order Received", icon: Flower2 },
  { key: "preparing", label: "Preparing", icon: Coffee },
  { key: "ready", label: "Ready for Pickup", icon: CupSoda },
] as const;

function stepIndex(status: TrackResponse["display_status"]): number {
  if (status === "received") return 0;
  if (status === "preparing") return 1;
  if (status === "ready") return 2;
  return -1;
}

export default function Track() {
  const [params] = useSearchParams();
  const [number, setNumber] = useState(params.get("number") ?? "");
  const [result, setResult] = useState<TrackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (value?: string) => {
    const num = (value ?? number).trim().toUpperCase();
    if (!num) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<TrackResponse>(`/orders/track/${encodeURIComponent(num)}`);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError && err.body && typeof err.body === "object" && "detail" in err.body ? String((err.body as { detail: unknown }).detail) : "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (params.get("number") && !result && !error && !loading) {
    void lookup(params.get("number")!);
  }

  const currentStep = result ? stepIndex(result.display_status) : -1;

  return (
    <div data-testid="track-page" className="mx-auto max-w-2xl px-6 py-20 md:py-28">
      <Reveal className="flex flex-col items-center text-center">
        <p className="font-script text-3xl text-blushdeep">How's it coming along? ♡</p>
        <h1 data-testid="track-heading" className="mt-3 font-heading text-4xl uppercase tracking-editorial text-espresso md:text-5xl">
          Track Your Order
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-espresso/60">
          Enter the order number from your receipt — it looks like BB-ABC123.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <div className="flex gap-2">
          <input
            data-testid="track-number-input"
            value={number}
            onChange={(e) => setNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && void lookup()}
            placeholder="BB-ABC123"
            className="h-13 flex-1 rounded-full border border-espresso/15 bg-cream px-6 py-3.5 font-heading text-lg tracking-editorial text-espresso outline-none placeholder:text-espresso/30 focus:border-blushdeep"
          />
          <button
            data-testid="track-lookup-button"
            onClick={() => void lookup()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-blush px-7 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep disabled:opacity-50"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
            {loading ? "Looking…" : "Look Up"}
          </button>
        </div>
        {error && (
          <p data-testid="track-error" className="mt-4 text-center font-script text-2xl text-blushdeep">{error}</p>
        )}
      </Reveal>

      {result && (
        <motion.div
          data-testid="track-result"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 border border-espresso/10 bg-cream p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-espresso/10 pb-5">
            <div>
              <p className="font-heading text-2xl tracking-editorial text-espresso" data-testid="track-order-number">{result.order.order_number}</p>
              <p className="mt-1 text-xs uppercase tracking-micro text-espresso/50">for {result.order.customer.name}</p>
            </div>
            <span className={`rounded-full px-4 py-1.5 text-[10px] uppercase tracking-micro ${result.order.payment_status === "paid" ? "bg-blush text-espresso" : "border border-espresso/20 text-espresso/60"}`} data-testid="track-payment-badge">
              {result.order.payment_status === "paid" ? "Paid online ♡" : "Pay at counter"}
            </span>
          </div>

          {result.display_status === "awaiting_payment" ? (
            <p data-testid="track-awaiting-payment" className="py-8 text-center text-sm text-espresso/60">
              This order is still awaiting payment — complete checkout to send it to our baristas.
            </p>
          ) : (
            <div className="flex items-start justify-between py-10">
              {STEPS.map((step, i) => {
                const active = i <= currentStep;
                return (
                  <div key={step.key} className="relative flex flex-1 flex-col items-center text-center">
                    {i > 0 && (
                      <span className={`absolute left-[-50%] right-[50%] top-6 h-px ${i <= currentStep ? "bg-blushdeep" : "bg-espresso/15"}`} aria-hidden="true" />
                    )}
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.15 * i, duration: 0.5 }}
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${active ? "bg-blush text-espresso" : "bg-rosemist/60 text-espresso/35"}`}
                    >
                      <step.icon className="h-5 w-5" strokeWidth={1.4} />
                    </motion.span>
                    <span data-testid={`track-step-${step.key}`} className={`mt-3 text-[10px] uppercase tracking-micro ${active ? "text-espresso" : "text-espresso/40"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {result.display_status === "ready" && (
            <p className="pb-4 text-center font-script text-2xl text-blushdeep">It's ready — come and get it while it's warm! ♡</p>
          )}

          <ul className="space-y-3 border-t border-espresso/10 pt-5">
            {result.order.items.map((item, idx) => (
              <li key={idx} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className="text-espresso">{item.quantity}× {item.name}</p>
                  {itemCustomisationLabel(item) && (
                    <p className="text-[11px] text-espresso/50">{itemCustomisationLabel(item)}</p>
                  )}
                  {item.customisation.gift_note && (
                    <p className="font-script text-lg leading-tight text-blushdeep">“{item.customisation.gift_note}”</p>
                  )}
                </div>
                <span className="shrink-0 text-espresso/70">{gbp(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-espresso/10 pt-4 text-sm">
            <div className="flex justify-between text-espresso/70">
              <dt>Subtotal</dt><dd>{gbp(result.order.subtotal)}</dd>
            </div>
            {result.order.discount > 0 && (
              <div className="flex justify-between text-blushdeep">
                <dt>Discount{result.order.promo_code ? ` (${result.order.promo_code})` : ""}</dt><dd>−{gbp(result.order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between font-heading text-lg text-espresso">
              <dt>Total</dt><dd data-testid="track-total">{gbp(result.order.total)}</dd>
            </div>
          </dl>
          <p className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-micro text-espresso/40">
            <HeartDoodle className="h-3 w-3 text-blushdeep" /> Pickup at Tower Bridge, SE1 2UP
          </p>
        </motion.div>
      )}
    </div>
  );
}
