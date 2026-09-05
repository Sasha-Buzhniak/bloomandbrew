import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { LogOut, RefreshCw } from "lucide-react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { gbp } from "@/lib/products";
import { HeartDoodle } from "@/components/Decor";
import { itemCustomisationLabel } from "@/lib/orders";
import type { PlacedOrder } from "@/lib/orders";

const TOKEN_KEY = "bb-staff-token";
const STATUSES = [
  { key: "received", label: "Received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "collected", label: "Collected" },
] as const;

interface StaffOrderView {
  order: PlacedOrder;
  display_status: string;
  minutes_elapsed: number;
}

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export default function Barista() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? "");
  const [passcode, setPasscode] = useState("");
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: () => apiPost<{ token: string }>("/staff/login", { passcode }),
    onSuccess: (d) => {
      sessionStorage.setItem(TOKEN_KEY, d.token);
      setToken(d.token);
      toast.success("Welcome back to the counter ♡");
    },
    onError: (e) => {
      toast.error(e instanceof ApiError && e.status === 429 ? "Too many attempts — take a breath and try again shortly." : "That passcode doesn't unlock the counter.");
    },
  });

  const ordersQuery = useQuery({
    queryKey: ["staff-orders"],
    queryFn: () => apiGet<{ orders: StaffOrderView[] }>("/staff/orders", token),
    enabled: !!token,
    refetchInterval: 20000,
    retry: false,
  });

  useEffect(() => {
    if (ordersQuery.error instanceof ApiError && ordersQuery.error.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      setToken("");
    }
  }, [ordersQuery.error, token]);

  const statusMutation = useMutation({
    mutationFn: ({ number, status }: { number: string; status: string }) =>
      apiPost(`/staff/orders/${encodeURIComponent(number)}/status`, { status }, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["staff-orders"] }),
    onError: () => toast.error("Couldn't update the order — try again."),
  });

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
  };

  if (!token) {
    return (
      <div data-testid="barista-login" className="mx-auto flex max-w-md flex-col items-center px-6 py-24 md:py-32">
        <HeartDoodle className="h-8 w-8 text-blushdeep" />
        <p className="mt-4 font-script text-3xl text-blushdeep">staff only ♡</p>
        <h1 className="mt-2 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">The Counter</h1>
        <form
          className="mt-8 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            if (passcode.trim()) login.mutate();
          }}
        >
          <input
            data-testid="barista-passcode-input"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Staff passcode"
            className="h-12 w-full rounded-full border border-espresso/15 bg-cream px-6 text-center text-sm tracking-widest outline-none placeholder:tracking-normal placeholder:text-espresso/40 focus:border-blushdeep"
          />
          <button
            data-testid="barista-login-button"
            type="submit"
            disabled={login.isPending}
            className="mt-3 w-full rounded-full bg-espresso py-4 text-[11px] font-medium uppercase tracking-micro text-cream transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            {login.isPending ? "Checking…" : "Open the Counter"}
          </button>
        </form>
      </div>
    );
  }

  const orders = ordersQuery.data?.orders ?? [];
  const active = orders.filter((o) => o.display_status !== "collected");

  return (
    <div data-testid="barista-dashboard" className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-espresso/10 pb-6">
        <div>
          <p className="font-script text-3xl text-blushdeep">the counter ♡</p>
          <h1 className="mt-1 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">Incoming Orders</h1>
          <p className="mt-2 text-xs uppercase tracking-micro text-espresso/50" data-testid="barista-active-count">
            {active.length} active · {orders.length} today&apos;s view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="barista-refresh-button"
            onClick={() => void ordersQuery.refetch()}
            aria-label="Refresh orders"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-espresso/15 text-espresso transition-colors hover:bg-rosemist"
          >
            <RefreshCw className={`h-4 w-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`} strokeWidth={1.5} />
          </button>
          <button
            data-testid="barista-logout-button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-espresso/15 px-5 py-3 text-[10px] uppercase tracking-micro text-espresso/70 transition-colors hover:bg-rosemist"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            Log Out
          </button>
        </div>
      </div>

      {ordersQuery.isLoading && <p className="py-16 text-center font-script text-3xl text-espresso/50">Brewing the list…</p>}

      {!ordersQuery.isLoading && orders.length === 0 && (
        <div data-testid="barista-empty" className="py-16 text-center">
          <p className="font-script text-3xl text-espresso/60">No orders yet — put the kettle on ♡</p>
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((view) => {
          const o = view.order;
          const collected = view.display_status === "collected";
          return (
            <motion.article
              key={o.id}
              layout
              data-testid={`barista-order-${o.order_number}`}
              className={`flex flex-col border bg-cream p-6 transition-opacity ${collected ? "border-espresso/5 opacity-45" : "border-espresso/10"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-xl tracking-editorial text-espresso">{o.order_number}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-micro text-espresso/50">
                    {timeAgo(o.created_at)} · {o.customer.name}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[9px] uppercase tracking-micro ${o.payment_status === "paid" ? "bg-blush text-espresso" : "border border-espresso/20 text-espresso/60"}`}>
                  {o.payment_status === "paid" ? "Paid" : "Counter"}
                </span>
              </div>

              <ul className="mt-4 flex-1 space-y-2.5 border-t border-espresso/10 pt-4">
                {o.items.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-espresso">{item.quantity}× {item.name}</span>
                      <span className="text-espresso/60">{gbp(item.unit_price * item.quantity)}</span>
                    </div>
                    {itemCustomisationLabel(item) && (
                      <p className="text-[11px] text-espresso/50">{itemCustomisationLabel(item)}</p>
                    )}
                    {item.customisation.gift_note && (
                      <p className="font-script text-lg leading-tight text-blushdeep">“{item.customisation.gift_note}”</p>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-espresso/10 pt-3 text-sm">
                <span className="text-espresso/50">Total</span>
                <span className="font-heading text-lg text-espresso">{gbp(o.total)}</span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s.key}
                    data-testid={`barista-status-${o.order_number}-${s.key}`}
                    onClick={() => statusMutation.mutate({ number: o.order_number, status: s.key })}
                    disabled={statusMutation.isPending}
                    className={`rounded-full px-1 py-2 text-[9px] uppercase tracking-wider transition-all duration-300 ${
                      view.display_status === s.key
                        ? "bg-espresso text-cream"
                        : "border border-espresso/15 text-espresso/60 hover:border-espresso/40 hover:text-espresso"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
