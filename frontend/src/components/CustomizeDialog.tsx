import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCart, EMPTY_CUSTOMISATION } from "@/lib/cart";
import type { Customisation } from "@/lib/cart";
import { gbp } from "@/lib/products";
import type { Product } from "@/lib/products";

const COFFEES = ["Latte", "Cappuccino", "Americano", "Matcha", "Iced Latte"];
const MILKS = ["Whole", "Oat", "Almond", "Soy"];
const FLOWER_COLOURS = ["Pink", "White", "Mixed", "Seasonal"];

function OptionPills({ options, value, onChange, testidPrefix }: { options: string[]; value?: string; onChange: (v: string) => void; testidPrefix: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          data-testid={`${testidPrefix}-${o.toLowerCase().replace(/\s+/g, "-")}`}
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

function Toggle({ label, checked, onChange, testid }: { label: string; checked: boolean; onChange: (v: boolean) => void; testid: string }) {
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-all duration-300 ${
        checked ? "border-espresso bg-rosemist/60" : "border-espresso/15 hover:border-espresso/40"
      }`}
    >
      <span className="text-espresso">{label}</span>
      <span className={`text-[10px] uppercase tracking-micro ${checked ? "text-blushdeep" : "text-espresso/40"}`}>{checked ? "Yes" : "No"}</span>
    </button>
  );
}

interface Props {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomizeDialog({ product, open, onOpenChange }: Props) {
  const { addItem, openCart } = useCart();
  const hasCoffee = product.category !== "flowers";
  const [c, setC] = useState<Customisation>({ ...EMPTY_CUSTOMISATION, coffee: hasCoffee ? "Latte" : undefined, milk: hasCoffee ? "Oat" : undefined, flowers: "Pink" });
  const [qty, setQty] = useState(1);

  const set = (patch: Partial<Customisation>) => setC((prev) => ({ ...prev, ...patch }));

  const submit = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image, customisation: c, quantity: qty });
    toast.success(`${product.name} added to your basket ♡`);
    onOpenChange(false);
    openCart();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="customize-dialog" className="max-h-[90vh] overflow-y-auto bg-cream sm:max-w-lg">
        <div className="flex gap-5">
          <img src={product.image} alt={product.alt} className="h-28 w-24 rounded-sm object-cover" />
          <div>
            <DialogTitle className="font-heading text-2xl text-espresso">{product.name}</DialogTitle>
            <p className="mt-1 text-sm text-espresso/60">{product.description}</p>
            <p className="mt-2 font-heading text-lg text-espresso">{gbp(product.price)}</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {hasCoffee && (
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-micro text-espresso/50">Coffee</p>
              <OptionPills options={COFFEES} value={c.coffee} onChange={(v) => set({ coffee: v })} testidPrefix="customize-coffee" />
            </div>
          )}
          {hasCoffee && (
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-micro text-espresso/50">Milk</p>
              <OptionPills options={MILKS} value={c.milk} onChange={(v) => set({ milk: v })} testidPrefix="customize-milk" />
            </div>
          )}
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-micro text-espresso/50">Flowers</p>
            <OptionPills options={FLOWER_COLOURS} value={c.flowers} onChange={(v) => set({ flowers: v })} testidPrefix="customize-flowers" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Add flower branch" checked={c.flowerBranch} onChange={(v) => set({ flowerBranch: v })} testid="customize-flower-branch" />
            <Toggle label="Handwritten gift card" checked={c.giftCard} onChange={(v) => set({ giftCard: v })} testid="customize-gift-card" />
          </div>
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-micro text-espresso/50">Gift note (optional)</p>
            <textarea
              data-testid="customize-gift-note"
              value={c.giftNote ?? ""}
              onChange={(e) => set({ giftNote: e.target.value })}
              placeholder="A few kind words, we'll handwrite them…"
              rows={2}
              maxLength={120}
              className="w-full resize-none rounded-lg border border-espresso/15 bg-page px-4 py-3 font-script text-xl text-espresso outline-none placeholder:text-espresso/35 focus:border-blushdeep"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 rounded-full border border-espresso/15 px-3 py-2">
              <button data-testid="customize-qty-minus" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-espresso/60 hover:text-espresso">
                <Minus className="h-4 w-4" />
              </button>
              <span data-testid="customize-qty" className="w-5 text-center text-sm font-medium">{qty}</span>
              <button data-testid="customize-qty-plus" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(20, q + 1))} className="text-espresso/60 hover:text-espresso">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              data-testid="customize-add-button"
              onClick={submit}
              className="rounded-full bg-blush px-7 py-3 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-md"
            >
              Add to Basket — {gbp(product.price * qty)}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
