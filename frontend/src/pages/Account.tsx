import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, LogOut } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { gbp } from "@/lib/products";
import { HeartDoodle, SectionOverline } from "@/components/Decor";
import { Reveal } from "@/components/Reveal";
import { itemCustomisationLabel } from "@/lib/orders";
import type { PlacedOrder } from "@/lib/orders";

interface AccountOrder {
  order: PlacedOrder;
  display_status: string;
  minutes_elapsed: number;
}

interface AccountGift {
  id: string;
  product_name: string;
  weekly_amount: number;
  recipient_name: string;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  received: "Received",
  preparing: "Preparing",
  ready: "Ready for pickup",
  collected: "Collected",
};

export default function Account() {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const passedUser = (location.state as { user?: unknown } | null)?.user;

  const ordersQuery = useQuery({
    queryKey: ["account-orders"],
    queryFn: () => apiGet<{ orders: AccountOrder[]; gifts: AccountGift[] }>("/auth/orders"),
    enabled: !!user,
    retry: false,
  });

  useEffect(() => {
    if (user === false && !passedUser) {
      // stay on page — the sign-in prompt below handles it
    }
  }, [user, passedUser]);

  if (!user) {
    return (
      <div data-testid="account-signin" className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center md:py-32">
        <HeartDoodle className="h-9 w-9 animate-float-slow text-blushdeep" />
        <p className="mt-4 font-script text-3xl text-blushdeep">your mornings, all in one place ♡</p>
        <h1 className="mt-2 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">My Mornings</h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-espresso/60">
          Sign in to see your orders, track your weekly gifts and check out faster next time.
        </p>
        <button
          data-testid="google-signin-button"
          onClick={login}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-espresso px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-cream transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path fill="#FFF8F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.2c1.9-1.8 3-4.4 3-7.5Z" />
            <path fill="#FFF8F4" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3.1v2.6A10 10 0 0 0 12 22Z" opacity=".85" />
            <path fill="#FFF8F4" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z" opacity=".7" />
            <path fill="#FFF8F4" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6c.8-2.4 3-4.2 5.6-4.2Z" opacity=".9" />
          </svg>
          Continue with Google
        </button>
      </div>
    );
  }

  const orders = ordersQuery.data?.orders ?? [];
  const gifts = ordersQuery.data?.gifts ?? [];

  const signOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div data-testid="account-page" className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
      <Reveal className="flex flex-wrap items-center justify-between gap-6 border-b border-espresso/10 pb-8">
        <div className="flex items-center gap-5">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="h-16 w-16 rounded-full border-2 border-blush object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush font-heading text-2xl text-espresso">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-script text-2xl text-blushdeep">good to see you ♡</p>
            <h1 data-testid="account-name" className="font-heading text-2xl uppercase tracking-editorial text-espresso md:text-3xl">{user.name}</h1>
            <p data-testid="account-email" className="mt-1 text-xs text-espresso/50">{user.email}</p>
          </div>
        </div>
        <button
          data-testid="sign-out-button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-full border border-espresso/15 px-5 py-3 text-[10px] uppercase tracking-micro text-espresso/70 transition-colors hover:bg-rosemist"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
          Sign Out
        </button>
      </Reveal>

      {gifts.length > 0 && (
        <Reveal delay={0.1} className="mt-12">
          <SectionOverline>Weekly Gifts</SectionOverline>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {gifts.map((g) => (
              <div key={g.id} data-testid={`account-gift-${g.id.slice(0, 6)}`} className="border border-espresso/10 bg-cream p-6">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-lg text-espresso">{g.product_name}</p>
                  <span className={`rounded-full px-3 py-1 text-[9px] uppercase tracking-micro ${g.status === "active" ? "bg-blush text-espresso" : "border border-espresso/20 text-espresso/50"}`}>
                    {g.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-espresso/55">for {g.recipient_name} · {gbp(g.weekly_amount / 100)}/week</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal delay={0.15} className="mt-12">
        <SectionOverline>Your Orders</SectionOverline>
        {ordersQuery.isLoading && <p className="mt-8 font-script text-2xl text-espresso/50">Gathering your mornings…</p>}
        {!ordersQuery.isLoading && orders.length === 0 && (
          <div className="mt-8 text-center">
            <p className="font-script text-3xl text-espresso/60">No orders yet ♡</p>
            <Link to="/menu" className="mt-5 inline-flex items-center gap-2 rounded-full bg-blush px-7 py-3.5 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep">
              Browse the Menu
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        )}
        <div className="mt-6 space-y-4">
          {orders.map((view) => {
            const o = view.order;
            return (
              <motion.div
                key={o.id}
                layout
                data-testid={`account-order-${o.order_number}`}
                className="flex flex-wrap items-center justify-between gap-4 border border-espresso/10 bg-cream p-5"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-heading text-lg tracking-editorial text-espresso">{o.order_number}</p>
                    <span className={`rounded-full px-3 py-1 text-[9px] uppercase tracking-micro ${view.display_status === "ready" ? "bg-blush text-espresso" : "border border-espresso/20 text-espresso/55"}`}>
                      {STATUS_LABELS[view.display_status] ?? view.display_status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-espresso/55">
                    {o.items.map((i) => `${i.quantity}× ${i.name}${itemCustomisationLabel(i) ? ` (${itemCustomisationLabel(i)})` : ""}`).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-heading text-lg text-espresso">{gbp(o.total)}</span>
                  <Link
                    to={`/track?number=${o.order_number}`}
                    data-testid={`account-track-${o.order_number}`}
                    className="rounded-full border border-espresso/20 px-4 py-2 text-[10px] uppercase tracking-micro text-espresso transition-colors hover:bg-rosemist"
                  >
                    Track
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
