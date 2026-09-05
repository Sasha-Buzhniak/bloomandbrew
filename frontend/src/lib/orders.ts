export interface PlacedOrderItem {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  customisation: {
    coffee?: string | null;
    milk?: string | null;
    flowers?: string | null;
    flower_branch: boolean;
    gift_card: boolean;
    gift_note?: string | null;
  };
}

export interface PlacedOrder {
  id: string;
  order_number: string;
  items: PlacedOrderItem[];
  customer: { name: string; email: string; pickup_time: string };
  promo_code?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

export interface TrackResponse {
  order: PlacedOrder;
  display_status: "awaiting_payment" | "received" | "preparing" | "ready";
  minutes_elapsed: number;
}

export interface PaymentStatus {
  session_id: string;
  status: string;
  payment_status: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
  order_number: string;
}

export function itemCustomisationLabel(item: PlacedOrderItem): string {
  const c = item.customisation;
  return [c.coffee, c.milk && `${c.milk} milk`, c.flowers && `${c.flowers} flowers`, c.flower_branch && "Flower branch", c.gift_card && "Gift card"]
    .filter(Boolean)
    .join(" · ");
}
