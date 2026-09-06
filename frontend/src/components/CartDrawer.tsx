import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { gbp } from "@/lib/products";
import type { Customisation } from "@/lib/cart";

export function customisationLabel(c: Customisation): string {
  const parts = [c.coffee, c.milk && `${c.milk} milk`, c.flowers && `${c.flowers} flowers`, c.flowerBranch && "Flower branch", c.giftCard && "Gift card"].filter(Boolean);
  return parts.join(" · ");
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotal, discount, total, promo, applyPromo } = useCart();
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const submitPromo = () => {
    if (!code.trim()) return;
    if (applyPromo(code)) toast.success("5% off applied — spread the love ♡");
    else toast.error("That code doesn't bloom. Try BLOOM5.");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? null : closeCart())}>
      <SheetContent data-testid="cart-drawer" side="right" className="flex w-full flex-col bg-cream p-0 sm:max-w-md">
        <div className="border-b border-espresso/10 px-6 py-5">
          <SheetTitle className="font-heading text-xl uppercase tracking-editorial text-espresso">Your Basket</SheetTitle>
          <p className="mt-1 font-script text-xl text-blushdeep">A little coffee, a little love</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div data-testid="cart-empty-state" className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-script text-3xl text-espresso/70">Your basket is empty ♡</p>
              <p className="text-sm text-espresso/50">Something lovely is waiting on the menu.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-espresso/10">
              {items.map((item) => (
                <li key={item.key} data-testid={`cart-item-${item.productId}`} className="flex gap-4 py-4">
                  <img src={item.image} alt={item.name} className="h-20 w-16 rounded-sm object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-heading text-base text-espresso">{item.name}</p>
                      <button data-testid={`cart-remove-${item.productId}`} aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.key)} className="text-espresso/40 transition-colors hover:text-destructive">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    {customisationLabel(item.customisation) && (
                      <p className="mt-0.5 text-xs text-espresso/50">{customisationLabel(item.customisation)}</p>
                    )}
                    {item.customisation.giftNote && (
                      <p className="mt-0.5 font-script text-lg leading-tight text-blushdeep">“{item.customisation.giftNote}”</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 rounded-full border border-espresso/15 px-2 py-1">
                        <button data-testid={`cart-qty-minus-${item.productId}`} aria-label="Decrease quantity" onClick={() => setQuantity(item.key, item.quantity - 1)} className="text-espresso/60 hover:text-espresso">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span data-testid={`cart-qty-${item.productId}`} className="w-4 text-center text-xs font-medium">{item.quantity}</span>
                        <button data-testid={`cart-qty-plus-${item.productId}`} aria-label="Increase quantity" onClick={() => setQuantity(item.key, item.quantity + 1)} className="text-espresso/60 hover:text-espresso">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-espresso">{gbp(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-espresso/10 px-6 py-5">
            <div className="flex gap-2">
              <input
                data-testid="promo-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Promo code (try BLOOM5)"
                className="h-10 flex-1 rounded-full border border-espresso/15 bg-page px-4 text-xs uppercase tracking-wider outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-espresso/40 focus:border-blushdeep"
              />
              <button data-testid="promo-apply-button" onClick={submitPromo} className="rounded-full border border-espresso/20 px-4 text-[11px] uppercase tracking-micro transition-colors hover:bg-rosemist">
                Apply
              </button>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-espresso/70">
                <dt>Subtotal</dt><dd data-testid="cart-subtotal">{gbp(subtotal)}</dd>
              </div>
              {promo && (
                <div className="flex justify-between text-blushdeep">
                  <dt>Discount ({promo})</dt><dd data-testid="cart-discount">−{gbp(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-espresso/10 pt-2 font-heading text-lg text-espresso">
                <dt>Total</dt><dd data-testid="cart-total">{gbp(total)}</dd>
              </div>
            </dl>
            <button
              data-testid="cart-checkout-button"
              onClick={() => { closeCart(); navigate("/order#checkout"); }}
              className="mt-4 w-full rounded-full bg-blush py-3.5 text-[11px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep hover:shadow-md"
            >
              Review &amp; Checkout
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
