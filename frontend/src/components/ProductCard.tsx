import { toast } from "sonner";
import { Reveal, RevealImage } from "@/components/Reveal";
import { useCart, EMPTY_CUSTOMISATION } from "@/lib/cart";
import { gbp } from "@/lib/products";
import type { Product } from "@/lib/products";

interface Props {
  product: Product;
  index?: number;
  onCustomize?: (product: Product) => void;
}

export default function ProductCard({ product, index = 0, onCustomize }: Props) {
  const { addItem, openCart } = useCart();

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
          <div className="aspect-[4/5] overflow-hidden">
            <img src={product.image} alt={product.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          </div>
        </RevealImage>
        <h3 className="mt-5 font-heading text-xl text-espresso">{product.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-espresso/60">{product.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-espresso/10 pt-4">
          <span data-testid={`product-price-${product.id}`} className="font-heading text-lg text-espresso">{gbp(product.price)}</span>
          <div className="flex items-center gap-2">
            {onCustomize && (
              <button
                data-testid={`product-customize-${product.id}`}
                onClick={() => onCustomize(product)}
                className="rounded-full border border-espresso/20 px-4 py-2 text-[10px] uppercase tracking-micro text-espresso transition-all duration-300 hover:border-espresso hover:bg-rosemist/50"
              >
                Customise
              </button>
            )}
            <button
              data-testid={`product-add-${product.id}`}
              onClick={quickAdd}
              className="rounded-full bg-blush px-4 py-2 text-[10px] font-medium uppercase tracking-micro text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blushdeep"
            >
              Add
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
