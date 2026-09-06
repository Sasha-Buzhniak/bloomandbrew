import { toast } from "sonner";
import { Reveal, RevealImage } from "@/components/Reveal";
import { useCart, EMPTY_CUSTOMISATION } from "@/lib/cart";
import { gbp } from "@/lib/products";
import type { Product } from "@/lib/products";

interface Props {
  product: Product & { in_stock?: boolean };
  index?: number;
  onCustomize?: (product: Product & { in_stock?: boolean }) => void;
}

export default function ProductCard({ product, index = 0, onCustomize }: Props) {
  const { addItem, openCart } = useCart();
  const soldOut = product.in_stock === false;

  const quickAdd = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image, customisation: { ...EMPTY_CUSTOMISATION } });
    toast.success(`${product.name} added to your basket ♡`);
    openCart();
  };

  return (
    <Reveal delay={(index % 5) * 0.08} className="h-full">
      <article data-testid={`product-card-${product.id}`} className="group flex h-full flex-col border-t border-espresso/15 pt-5 transition-transform duration-500 hover:-translate-y-1">
        <div className="flex items-baseline justify-between">
          <span className="font-script text-2xl text-blushdeep">{product.num}</span>
          <span className="text-[9px] uppercase tracking-micro text-espresso/40">{product.category === "combo" ? "Coffee + Flowers" : product.category}</span>
        </div>
        <RevealImage className="mt-3 overflow-hidden rounded-sm">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img src={product.image} alt={product.alt} loading="lazy" className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${soldOut ? "opacity-50 grayscale-[35%]" : ""}`} />
            {soldOut && (
              <span data-testid={`sold-out-badge-${product.id}`} className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                <span className="inline-block -rotate-3 bg-cream/95 px-5 py-2 font-script text-2xl text-espresso shadow-md">sold out, sorry ♡</span>
              </span>
            )}
          </div>
        </RevealImage>
        <h3 className="mt-5 font-heading text-xl text-espresso">{product.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-espresso/60">{product.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-2.5 border-t border-espresso/10 pt-4">
          <span data-testid={`product-price-${product.id}`} className="font-heading text-base text-espresso sm:text-lg">{gbp(product.price)}</span>
          {soldOut ? (
            <span className="rounded-full border border-espresso/15 px-3 py-2 text-[9px] uppercase tracking-micro text-espresso/40 sm:px-4 sm:text-[10px]">
              Sold Out
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {onCustomize && (
                <button
                  data-testid={`product-customize-${product.id}`}
                  onClick={() => onCustomize(product)}
                  className="rounded-full border border-espresso/20 px-3 py-2 text-[9px] uppercase tracking-micro text-espresso transition-all duration-300 hover:border-espresso hover:bg-rosemist/50 sm:px-4 sm:text-[10px]"
                >
                  Customise
                </button>
              )}
              <button
                data-testid={`product-add-${product.id}`}
                onClick={quickAdd}
                className="rounded-full bg-blush px-3.5 py-2 text-[9px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep sm:px-4 sm:text-[10px]"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </article>
    </Reveal>
  );
}
