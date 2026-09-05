import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { gbp } from "@/lib/products";
import { HeartDoodle } from "@/components/Decor";
import type { PaymentStatus, TrackResponse } from "@/lib/orders";

type Phase = "confirming" | "paid" | "timeout" | "missing";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const orderNumber = params.get("order");
  const { clearCart } = useCart();
  const [phase, setPhase] = useState<Phase>(sessionId ? "confirming" : "missing");
  const [track, setTrack] = useState<TrackResponse | null>(null);
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const status = await apiGet<PaymentStatus>(`/payments/status/${sessionId}`);
        if (status.payment_status === "paid") {
          if (!cleared.current) {
            cleared.current = true;
            clearCart();
          }
          if (orderNumber) {
            const t = await apiGet<TrackResponse>(`/orders/track/${orderNumber}`).catch(() => null);
            if (t) setTrack(t);
          }
          setPhase("paid");
          return;
        }
      } catch {
        // keep polling — Stripe can take a moment
      }
      if (attempts >= 20) {
        setPhase("timeout");
        return;
      }
      window.setTimeout(poll, 2000);
    };
    void poll();
  }, [sessionId, orderNumber, clearCart]);

  return (
    <div data-testid="order-success-page" className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center md:py-32">
      {phase === "confirming" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <HeartDoodle className="h-10 w-10 animate-float-slow text-blushdeep" />
          <h1 className="mt-6 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">Confirming your payment…</h1>
          <p className="mt-4 text-sm text-espresso/60">One moment — we're just checking with the card fairies.</p>
        </motion.div>
      )}

      {phase === "paid" && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full border border-espresso/10 bg-cream p-10">
          <HeartDoodle className="mx-auto h-10 w-10 animate-float-slow text-blushdeep" />
          <h1 data-testid="payment-success-heading" className="mt-5 font-heading text-3xl uppercase tracking-editorial text-espresso">Payment Received</h1>
          <p className="mt-3 font-script text-3xl text-blushdeep">See you by the bridge ♡</p>
          {orderNumber && (
            <p data-testid="payment-order-number" className="mt-6 inline-block rounded-full bg-blush px-8 py-3 font-heading text-xl tracking-editorial text-espresso">
              {orderNumber}
            </p>
          )}
          {track && (
            <dl className="mx-auto mt-6 max-w-xs space-y-2 border-t border-espresso/10 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-espresso/60">Total paid</dt>
                <dd data-testid="payment-total" className="font-medium text-espresso">{gbp(track.order.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-espresso/60">Status</dt>
                <dd className="capitalize text-espresso">{track.display_status}</dd>
              </div>
            </dl>
          )}
          <p className="mt-5 text-xs leading-relaxed text-espresso/50">
            A receipt is on its way to your inbox. Show your order number at the counter.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {orderNumber && (
              <Link
                to={`/track?number=${orderNumber}`}
                data-testid="track-order-link"
                className="inline-flex items-center gap-2 rounded-full bg-blush px-7 py-3.5 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep"
              >
                Track Your Order
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            )}
            <Link to="/menu" data-testid="back-to-menu-link" className="rounded-full border border-espresso/20 px-7 py-3.5 text-[11px] uppercase tracking-micro text-espresso transition-colors hover:bg-rosemist">
              Back to Menu
            </Link>
          </div>
        </motion.div>
      )}

      {phase === "timeout" && (
        <div className="flex flex-col items-center">
          <h1 className="font-heading text-3xl uppercase tracking-editorial text-espresso">Almost there…</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-espresso/60">
            Your payment is still being confirmed. If you completed checkout, your order is safe — track it in a moment with your order number{orderNumber ? ` (${orderNumber})` : ""}.
          </p>
          {orderNumber && (
            <Link to={`/track?number=${orderNumber}`} data-testid="track-order-link" className="mt-7 inline-block rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep">
              Track Order
            </Link>
          )}
        </div>
      )}

      {phase === "missing" && (
        <div className="flex flex-col items-center">
          <h1 className="font-heading text-3xl uppercase tracking-editorial text-espresso">Nothing to confirm</h1>
          <p className="mt-4 text-sm text-espresso/60">This page needs a payment session. Fancy a coffee instead?</p>
          <Link to="/menu" className="mt-7 inline-block rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep">
            View Menu
          </Link>
        </div>
      )}
    </div>
  );
}
