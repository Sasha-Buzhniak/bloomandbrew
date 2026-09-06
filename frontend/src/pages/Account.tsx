import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, Camera, Copy, LogOut, Repeat } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { gbp, useCatalog } from "@/lib/products";
import { HeartDoodle, SectionOverline } from "@/components/Decor";
import { Reveal } from "@/components/Reveal";
import { itemCustomisationLabel } from "@/lib/orders";
import type { PlacedOrder } from "@/lib/orders";

interface LoyaltyStatus {
  total_coffees: number;
  stamps: number;
  stamps_needed: number;
  rewards_available: number;
}

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

  const queryClient = useQueryClient();
  const { addItem, openCart } = useCart();
  const { products: catalogProducts } = useCatalog();
  const { setUser } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditProfile = () => {
    if (!user) return;
    setProfileName(user.name);
    setProfileDob(user.date_of_birth ?? "");
    setAvatarPreview(null);
    setEditingProfile(true);
  };

  const saveProfile = async () => {
    if (!user || !profileName.trim()) {
      toast.error("Your name can't be empty ♡");
      return;
    }
    setSavingProfile(true);
    try {
      if (profileName.trim() !== user.name || profileDob !== (user.date_of_birth ?? "")) {
        const updated = await apiPatch<AuthUser>("/auth/profile", { name: profileName.trim(), date_of_birth: profileDob || null });
        setUser(updated);
      }
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/auth/avatar", { method: "POST", body: fd });
        if (!res.ok) throw new Error("upload failed");
        setUser((await res.json()) as AuthUser);
      }
      toast.success("Profile saved ♡");
      setEditingProfile(false);
      setAvatarPreview(null);
    } catch {
      toast.error("Couldn't save — try again.");
    } finally {
      setSavingProfile(false);
    }
  };
  const [rewardCode, setRewardCode] = useState<string | null>(null);

  const loyaltyQuery = useQuery({
    queryKey: ["loyalty"],
    queryFn: () => apiGet<LoyaltyStatus>("/auth/loyalty"),
    enabled: !!user,
    retry: false,
  });

  const redeemMutation = useMutation({
    mutationFn: () => apiPost<{ code: string; amount: number }>("/auth/loyalty/redeem"),
    onSuccess: (d) => {
      setRewardCode(d.code);
      void queryClient.invalidateQueries({ queryKey: ["loyalty"] });
      toast.success("Your free coffee is ready to claim ♡");
    },
    onError: () => toast.error("No free coffee ready yet — keep blooming!"),
  });

  const reorder = (o: PlacedOrder) => {
    let added = 0;
    for (const item of o.items) {
      const product = catalogProducts.find((p) => p.id === item.product_id);
      if (!product) continue;
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity,
        customisation: {
          coffee: item.customisation.coffee ?? undefined,
          milk: item.customisation.milk ?? undefined,
          flowers: item.customisation.flowers ?? undefined,
          flowerBranch: item.customisation.flower_branch,
          giftCard: item.customisation.gift_card,
          giftNote: item.customisation.gift_note ?? undefined,
        },
      });
      added += 1;
    }
    if (added > 0) {
      toast.success("Added back to your basket ♡");
      openCart();
    }
  };

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
        <div className="flex items-center gap-3">
          {user.is_admin && (
            <Link
              to="/admin"
              data-testid="admin-panel-link"
              className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-3 text-[10px] uppercase tracking-micro text-cream transition-all duration-300 hover:-translate-y-0.5"
            >
              Shop Room
            </Link>
          )}
          <button
            data-testid="sign-out-button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-full border border-espresso/15 px-5 py-3 text-[10px] uppercase tracking-micro text-espresso/70 transition-colors hover:bg-rosemist"
        >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="mt-12">
        <div data-testid="account-settings" className="border border-espresso/10 bg-cream p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-script text-2xl text-blushdeep">make it yours ♡</p>
              <h2 className="mt-1 font-heading text-xl uppercase tracking-editorial text-espresso">Account Settings</h2>
            </div>
            {!editingProfile && (
              <button
                data-testid="edit-profile-button"
                onClick={startEditProfile}
                className="rounded-full border border-espresso/20 px-5 py-2.5 text-[10px] uppercase tracking-micro text-espresso transition-colors hover:bg-rosemist"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editingProfile ? (
            <div className="mt-6 space-y-4 border-t border-espresso/10 pt-6">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  {(avatarPreview ?? user.picture) ? (
                    <img src={avatarPreview ?? user.picture ?? ""} alt="Profile photo preview" className="h-20 w-20 rounded-full border-2 border-blush object-cover" />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blush font-heading text-2xl text-espresso">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <button
                    data-testid="avatar-upload-button"
                    aria-label="Change profile photo"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-espresso text-cream shadow-md transition-transform hover:-translate-y-0.5"
                  >
                    <Camera className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <input
                    ref={fileInputRef}
                    data-testid="avatar-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setAvatarPreview(URL.createObjectURL(f));
                    }}
                  />
                </div>
                <p className="max-w-xs text-xs leading-relaxed text-espresso/55">Tap the camera to change your photo — JPG, PNG or WEBP, up to 5MB.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-micro text-espresso/50">Your name</span>
                  <input
                    data-testid="profile-name-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    maxLength={80}
                    className="h-11 w-full rounded-full border border-espresso/15 bg-page px-5 text-sm outline-none focus:border-blushdeep"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-micro text-espresso/50">Birthday</span>
                  <input
                    data-testid="profile-dob-input"
                    type="date"
                    value={profileDob}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setProfileDob(e.target.value)}
                    className="h-11 w-full rounded-full border border-espresso/15 bg-page px-5 text-sm outline-none focus:border-blushdeep"
                  />
                </label>
              </div>
              <p className="font-script text-xl text-blushdeep">tell us your birthday — we might just remember it ♡</p>
              <div className="flex gap-3">
                <button
                  data-testid="save-profile-button"
                  onClick={() => void saveProfile()}
                  disabled={savingProfile}
                  className="rounded-full bg-espresso px-7 py-3 text-[11px] font-medium uppercase tracking-micro text-cream transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {savingProfile ? "Saving…" : "Save Changes"}
                </button>
                <button
                  data-testid="cancel-profile-button"
                  onClick={() => { setEditingProfile(false); setAvatarPreview(null); }}
                  className="rounded-full border border-espresso/20 px-6 py-3 text-[11px] uppercase tracking-micro transition-colors hover:bg-rosemist"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <dl className="mt-6 grid gap-4 border-t border-espresso/10 pt-6 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[10px] uppercase tracking-micro text-espresso/45">Name</dt>
                <dd data-testid="profile-name-display" className="mt-1 text-espresso">{user.name}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-micro text-espresso/45">Birthday</dt>
                <dd data-testid="profile-dob-display" className="mt-1 text-espresso">
                  {user.date_of_birth
                    ? new Date(`${user.date_of_birth}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
                    : "Not set yet"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-micro text-espresso/45">Email</dt>
                <dd className="mt-1 text-espresso">{user.email}</dd>
              </div>
            </dl>
          )}
        </div>
      </Reveal>

      {loyaltyQuery.data && (
        <Reveal delay={0.05} className="mt-12">
          <div data-testid="loyalty-card" className="border border-espresso/10 bg-cream p-7">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="font-script text-2xl text-blushdeep">loyalty blooms ♡</p>
                <h2 className="mt-1 font-heading text-xl uppercase tracking-editorial text-espresso">Your Stamp Card</h2>
                <p data-testid="loyalty-progress-text" className="mt-2 text-sm text-espresso/60">
                  {loyaltyQuery.data.stamps} of {loyaltyQuery.data.stamps_needed} coffees — your tenth blooms free
                </p>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: loyaltyQuery.data.stamps_needed }).map((_, i) => (
                  <HeartDoodle key={i} className={`h-6 w-6 ${i < loyaltyQuery.data.stamps ? "text-blushdeep" : "text-espresso/15"}`} />
                ))}
              </div>
            </div>
            {rewardCode ? (
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-espresso/10 pt-5">
                <span data-testid="loyalty-reward-code" className="font-heading text-lg tracking-editorial text-espresso">{rewardCode}</span>
                <button
                  data-testid="loyalty-copy-button"
                  onClick={() => { void navigator.clipboard.writeText(rewardCode); toast.success("Copied — pop it in the promo box ♡"); }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-espresso/20 px-4 py-2 text-[10px] uppercase tracking-micro text-espresso transition-colors hover:bg-rosemist"
                >
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Copy
                </button>
                <span className="text-xs text-espresso/50">Worth a free coffee (up to £5.80) — use it as the promo code on your next order.</span>
              </div>
            ) : loyaltyQuery.data.rewards_available > 0 ? (
              <button
                data-testid="loyalty-redeem-button"
                onClick={() => redeemMutation.mutate()}
                disabled={redeemMutation.isPending}
                className="mt-5 rounded-full bg-blush px-6 py-3 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep disabled:opacity-50"
              >
                Redeem Your Free Coffee
              </button>
            ) : null}
          </div>
        </Reveal>
      )}

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
                  <button
                    data-testid={`account-reorder-${o.order_number}`}
                    onClick={() => reorder(o)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-espresso/20 px-4 py-2 text-[10px] uppercase tracking-micro text-espresso transition-colors hover:bg-rosemist"
                  >
                    <Repeat className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Again
                  </button>
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
