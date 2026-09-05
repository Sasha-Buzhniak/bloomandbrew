import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface Customisation {
  coffee?: string;
  milk?: string;
  flowers?: string;
  flowerBranch: boolean;
  giftCard: boolean;
  giftNote?: string;
}

export const EMPTY_CUSTOMISATION: Customisation = { flowerBranch: false, giftCard: false };

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customisation: Customisation;
}

interface AddItemInput {
  productId: string;
  name: string;
  price: number;
  image: string;
  customisation: Customisation;
  quantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  promo: string | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: AddItemInput) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  applyPromo: (code: string) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const PROMO_CODES: Record<string, number> = { BLOOM5: 0.05 };

const makeKey = (productId: string, c: Customisation) =>
  [productId, c.coffee ?? "", c.milk ?? "", c.flowers ?? "", c.flowerBranch, c.giftCard, c.giftNote ?? ""].join("|");

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bb-cart") ?? "[]") as CartItem[];
    } catch {
      return [];
    }
  });
  const [promo, setPromo] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("bb-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: AddItemInput) => {
    const key = makeKey(item.productId, item.customisation);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + (item.quantity ?? 1) } : i));
      }
      return [...prev, { ...item, key, quantity: item.quantity ?? 1 }];
    });
  };

  const removeItem = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key));
  const setQuantity = (key: string, qty: number) => {
    if (qty < 1) return removeItem(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i)));
  };
  const applyPromo = (code: string) => {
    const normalised = code.trim().toUpperCase();
    if (PROMO_CODES[normalised]) {
      setPromo(normalised);
      return true;
    }
    return false;
  };
  const clearCart = () => {
    setItems([]);
    setPromo(null);
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promo ? subtotal * (PROMO_CODES[promo] ?? 0) : 0;
  const total = subtotal - discount;

  return (
    <CartContext.Provider
      value={{
        items, count, subtotal, discount, total, promo, isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem, removeItem, setQuantity, applyPromo, clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
