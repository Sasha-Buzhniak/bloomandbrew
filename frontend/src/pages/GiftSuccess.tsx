import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { HeartDoodle } from "@/components/Decor";
import type { PaymentStatus } from "@/lib/orders";

type Phase = "confirming" | "active" | "timeout" | "missing";

export default function GiftSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [phase, setPhase] = useState<Phase>(sessionId ? "confirming" : "missing");

  useEffect(() => {
    if (!sessionId) return;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const status = await apiGet<PaymentStatus>(`/payments/status/${sessionId}`);
        if (status.payment_status === "paid" || status.status === "completed") {
          setPhase("active");
          return;
        }
      } catch {
        // keep polling
      }
      if (attempts >= 20) {
        setPhase("timeout");
        return;
      }
      window.setTimeout(poll, 2000);
    };
    void poll();
  }, [sessionId]);

  return (
    <div data-testid="gift-success-page" className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center md:py-32">
      {phase === "confirming" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <HeartDoodle className="h-10 w-10 animate-float-slow text-blushdeep" />
          <h1 className="mt-6 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">Tying the first posy…</h1>
          <p className="mt-4 text-sm text-espresso/60">One moment — we're confirming your subscription.</p>
        </motion.div>
      )}

      {phase === "active" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full border border-espresso/10 bg-cream p-10"
        >
          <HeartDoodle className="mx-auto h-10 w-10 animate-float-slow text-blushdeep" />
          <h1 data-testid="gift-active-heading" className="mt-5 font-heading text-3xl uppercase tracking-editorial text-espresso">It&apos;s Official</h1>
          <p className="mt-3 font-script text-3xl text-blushdeep">someone's mornings just got brighter ♡</p>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-espresso/60">
            Your weekly gift is active. The first coffee and posy will be hand-made and delivered this week, with your note handwritten on the card. A receipt is on its way to your inbox.
          </p>
          <p className="mt-4 text-xs uppercase tracking-micro text-espresso/45">Pause or cancel anytime — just email hello@bloomandbrew.london</p>
          <Link
            to="/"
            data-testid="gift-home-link"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep"
          >
            Back to Bloom &amp; Brew
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </motion.div>
      )}

      {phase === "timeout" && (
        <div className="flex flex-col items-center">
          <h1 className="font-heading text-3xl uppercase tracking-editorial text-espresso">Almost there…</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-espresso/60">
            Your payment is still being confirmed. If you completed checkout, the subscription is on its way — your receipt will confirm it.
          </p>
        </div>
      )}

      {phase === "missing" && (
        <div className="flex flex-col items-center">
          <h1 className="font-heading text-3xl uppercase tracking-editorial text-espresso">Nothing to confirm</h1>
          <Link to="/gift" className="mt-7 inline-block rounded-full bg-blush px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep">
            Start a Weekly Gift
          </Link>
        </div>
      )}
    </div>
  );
}
