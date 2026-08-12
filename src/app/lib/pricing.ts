import type { CartItem } from "@/app/components/CartContext";
import { parsePrice, SIZE_OPTIONS } from "./catalog";
import { NO_FRAME, PURCHASABLE_FRAMING_STYLES } from "./framing";
import { SHIPPING_ESTIMATE_OPTIONS } from "./shipping";

// Authoritative, server-side order pricing — recomputes every line from the
// catalogue rather than trusting a client-sent priceValue, so the price
// shown, the price charged, and the price recorded in the order can never
// drift apart.

const GST_RATE = 0.15;

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

// Exported so callers that need to record authoritative per-line prices
// (e.g. lib/orders.ts) don't have to trust a client-sent priceValue either.
export function lineTotal(item: CartItem): number {
  const sizeOption = SIZE_OPTIONS.find((s) => s.size === item.size);
  const base = sizeOption ? parsePrice(sizeOption.price) : 0;

  let framingValue = 0;
  if (item.framing !== NO_FRAME) {
    const framingStyle = PURCHASABLE_FRAMING_STYLES.find((f) => f.name === item.framing);
    const framingPrice = framingStyle?.pricing.find((p) => p.size === item.size)?.price;
    framingValue = framingPrice ? parsePrice(framingPrice) : 0;
  }

  return (base + framingValue) * item.qty;
}

export type OrderTotals = {
  subtotal: number;
  shipping: number;
  /**
   * GST already included within subtotal + shipping for NZ domestic orders
   * (prices are GST-inclusive, per NZ retail convention) — informational,
   * for order records/reporting, NOT added on top of the total. 0 for
   * international orders: NZ exports are zero-rated, and the customer pays
   * the same displayed price either way.
   */
  tax: number;
  total: number;
};

export function calculateOrderTotals(items: CartItem[], shippingRegionValue: string): OrderTotals {
  const subtotal = roundCents(items.reduce((sum, item) => sum + lineTotal(item), 0));

  const shippingOption = SHIPPING_ESTIMATE_OPTIONS.find((option) => option.value === shippingRegionValue);
  const shipping = shippingOption?.price ?? 0;
  const domestic = shippingOption?.domestic ?? false;

  const total = roundCents(subtotal + shipping);
  const tax = domestic ? roundCents(total - total / (1 + GST_RATE)) : 0;

  return { subtotal, shipping, tax, total };
}
