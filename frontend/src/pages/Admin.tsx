import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { gbp, PRODUCTS } from "@/lib/products";
import { HeartDoodle } from "@/components/Decor";
import type { CatalogProduct, MilkStock } from "@/lib/products";

const CATEGORIES = ["coffee", "flowers", "combo", "seasonal"];
const MILKS = ["whole", "oat", "almond", "soy"];
const IMAGE_CHOICES = PRODUCTS.map((p) => ({ label: p.name, url: p.image }));

const inputClass = "h-10 w-full rounded-full border border-espresso/15 bg-page px-4 text-sm outline-none placeholder:text-espresso/40 focus:border-blushdeep";

export default function Admin() {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "5.80", category: "coffee", image: IMAGE_CHOICES[0].url });

  const isAdmin = !!user && user.is_admin;

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiGet<{ products: CatalogProduct[] }>("/admin/products"),
    enabled: isAdmin,
    retry: false,
  });
  const settingsQuery = useQuery({
    queryKey: ["catalog-settings"],
    queryFn: () => apiGet<{ milk_stock: MilkStock }>("/settings/public"),
    enabled: isAdmin,
    retry: false,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog-settings"] });
  };

  const patchProduct = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) => apiPatch(`/admin/products/${id}`, patch),
    onSuccess: () => { refresh(); setEditing(null); toast.success("Saved ♡"); },
    onError: () => toast.error("Couldn't save — try again."),
  });
  const deleteProduct = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/products/${id}`),
    onSuccess: () => { refresh(); setConfirmDelete(null); toast.success("Product removed."); },
    onError: () => toast.error("Couldn't delete — try again."),
  });
  const createProduct = useMutation({
    mutationFn: () => apiPost("/admin/products", { ...form, price: parseFloat(form.price) || 0 }),
    onSuccess: () => { refresh(); setShowAdd(false); setForm({ name: "", description: "", price: "5.80", category: "coffee", image: IMAGE_CHOICES[0].url }); toast.success("New product is live ♡"); },
    onError: () => toast.error("Couldn't create — check the fields."),
  });
  const patchMilk = useMutation({
    mutationFn: (milk_stock: MilkStock) => apiPatch("/admin/settings", { milk_stock }),
    onSuccess: () => { refresh(); toast.success("Milk stock updated."); },
    onError: () => toast.error("Couldn't update — try again."),
  });

  if (!user) {
    return (
      <div data-testid="admin-signin" className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center md:py-32">
        <HeartDoodle className="h-9 w-9 animate-float-slow text-blushdeep" />
        <h1 className="mt-4 font-heading text-3xl uppercase tracking-editorial text-espresso">The Shop Room</h1>
        <p className="mt-3 text-sm text-espresso/60">Sign in with the owner account to manage the menu.</p>
        <button data-testid="admin-signin-button" onClick={login} className="mt-7 rounded-full bg-espresso px-8 py-4 text-[11px] font-medium uppercase tracking-micro text-cream transition-all duration-300 hover:-translate-y-0.5">
          Continue with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div data-testid="admin-no-access" className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center md:py-32">
        <p className="font-script text-3xl text-blushdeep">the shop room is for the owner ♡</p>
        <p className="mt-3 text-sm text-espresso/60">This account doesn't have admin access.</p>
        <Link to="/account" className="mt-7 rounded-full border border-espresso/20 px-7 py-3 text-[11px] uppercase tracking-micro transition-colors hover:bg-rosemist">Back to My Mornings</Link>
      </div>
    );
  }

  const products = productsQuery.data?.products ?? [];
  const milkStock = settingsQuery.data?.milk_stock ?? { whole: true, oat: true, almond: true, soy: true };

  return (
    <div data-testid="admin-page" className="mx-auto max-w-5xl px-6 py-14 md:px-8 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-espresso/10 pb-6">
        <div>
          <p className="font-script text-3xl text-blushdeep">the shop room ♡</p>
          <h1 className="mt-1 font-heading text-3xl uppercase tracking-editorial text-espresso md:text-4xl">Menu &amp; Stock</h1>
          <p className="mt-2 text-xs uppercase tracking-micro text-espresso/50">{products.length} products · changes go live instantly</p>
        </div>
        <button
          data-testid="admin-add-toggle"
          onClick={() => setShowAdd((s) => !s)}
          className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3 text-[11px] font-medium uppercase tracking-micro text-cream transition-all duration-300 hover:-translate-y-0.5"
        >
          {showAdd ? <X className="h-4 w-4" strokeWidth={1.5} /> : <Plus className="h-4 w-4" strokeWidth={1.5} />}
          {showAdd ? "Close" : "Add a Product"}
        </button>
      </div>

      {/* Milk stock */}
      <div className="mt-8 border border-espresso/10 bg-cream p-6">
        <h2 className="font-heading text-lg uppercase tracking-editorial text-espresso">Milk Fridge</h2>
        <p className="mt-1 text-xs text-espresso/55">Ran out of something? Mark it sold out and customers can't pick it.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MILKS.map((milk) => {
            const available = milkStock[milk] !== false;
            return (
              <button
                key={milk}
                data-testid={`milk-toggle-${milk}`}
                onClick={() => patchMilk.mutate({ ...milkStock, [milk]: !available })}
                disabled={patchMilk.isPending}
                className={`rounded-full px-5 py-2.5 text-[10px] uppercase tracking-micro transition-all duration-300 ${
                  available ? "bg-blush text-espresso hover:bg-blushdeep" : "border border-espresso/20 text-espresso/45 line-through hover:bg-rosemist"
                }`}
              >
                {milk} milk · {available ? "available" : "sold out"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add product */}
      {showAdd && (
        <div data-testid="admin-add-form" className="mt-6 border border-espresso/10 bg-cream p-6">
          <h2 className="font-heading text-lg uppercase tracking-editorial text-espresso">New Product</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input data-testid="add-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className={inputClass} />
            <input data-testid="add-price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (e.g. 5.80)" inputMode="decimal" className={inputClass} />
            <input data-testid="add-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className={`${inputClass} sm:col-span-2`} />
            <select data-testid="add-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${inputClass} appearance-none`}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select data-testid="add-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={`${inputClass} appearance-none`}>
              {IMAGE_CHOICES.map((i) => <option key={i.url} value={i.url}>Photo: {i.label}</option>)}
            </select>
          </div>
          <button
            data-testid="add-submit"
            onClick={() => form.name.trim() ? createProduct.mutate() : toast.error("Give it a name first ♡")}
            disabled={createProduct.isPending}
            className="mt-4 rounded-full bg-blush px-7 py-3 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep disabled:opacity-50"
          >
            {createProduct.isPending ? "Adding…" : "Add to the Menu"}
          </button>
        </div>
      )}

      {/* Product list */}
      <div className="mt-8 space-y-3">
        {products.map((p) => {
          const soldOut = p.in_stock === false;
          return (
            <div key={p.id} data-testid={`admin-product-${p.id}`} className={`border bg-cream p-4 transition-opacity ${soldOut ? "border-espresso/5 opacity-70" : "border-espresso/10"}`}>
              <div className="flex flex-wrap items-center gap-4">
                <img src={p.image} alt={p.name} className={`h-14 w-12 rounded-sm object-cover ${soldOut ? "grayscale-[35%]" : ""}`} />
                <div className="min-w-40 flex-1">
                  <p className="font-heading text-lg text-espresso">{p.num}. {p.name}</p>
                  <p className="text-xs text-espresso/55">{p.description}</p>
                </div>
                <span className="font-heading text-lg text-espresso">{gbp(p.price)}</span>
                <button
                  data-testid={`stock-toggle-${p.id}`}
                  onClick={() => patchProduct.mutate({ id: p.id, patch: { in_stock: soldOut } })}
                  className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-micro transition-all duration-300 ${
                    soldOut ? "border border-espresso/20 text-espresso/50 hover:bg-rosemist" : "bg-blush text-espresso hover:bg-blushdeep"
                  }`}
                >
                  {soldOut ? "Sold Out" : "In Stock"}
                </button>
                <button data-testid={`edit-${p.id}`} onClick={() => setEditing(editing === p.id ? null : p.id)} aria-label={`Edit ${p.name}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/15 text-espresso/60 transition-colors hover:bg-rosemist">
                  <Pencil className="h-4 w-4" strokeWidth={1.5} />
                </button>
                {confirmDelete === p.id ? (
                  <button data-testid={`confirm-delete-${p.id}`} onClick={() => deleteProduct.mutate(p.id)} className="rounded-full bg-destructive px-4 py-2 text-[10px] uppercase tracking-micro text-cream">
                    Really delete?
                  </button>
                ) : (
                  <button data-testid={`delete-${p.id}`} onClick={() => setConfirmDelete(p.id)} aria-label={`Delete ${p.name}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/15 text-espresso/60 transition-colors hover:bg-rosemist hover:text-destructive">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
              {editing === p.id && (
                <EditRow product={p} onSave={(patch) => patchProduct.mutate({ id: p.id, patch })} saving={patchProduct.isPending} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditRow({ product, onSave, saving }: { product: CatalogProduct; onSave: (patch: Record<string, unknown>) => void; saving: boolean }) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-espresso/10 pt-4">
      <input data-testid={`edit-name-${product.id}`} value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} max-w-52`} />
      <input data-testid={`edit-description-${product.id}`} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-w-52 flex-1`} />
      <input data-testid={`edit-price-${product.id}`} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={`${inputClass} max-w-28`} />
      <button
        data-testid={`edit-save-${product.id}`}
        onClick={() => onSave({ name, description, price: parseFloat(price) || product.price })}
        disabled={saving}
        className="rounded-full bg-espresso px-5 py-2.5 text-[10px] uppercase tracking-micro text-cream transition-all hover:-translate-y-0.5 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
