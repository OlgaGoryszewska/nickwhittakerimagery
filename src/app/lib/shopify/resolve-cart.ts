import type { CartItem } from "@/app/components/CartContext";
import { getShopifyVariantId } from "./variant-map";

export type ResolvedCartLine = {
  item: CartItem;
  shopifyVariantId: string | null;
};

// Lines that resolve to null (stale mapping, photo removed since the last
// sync) are surfaced by the caller as "temporarily unavailable" rather than
// silently dropped or sent to Shopify as-is.
export function resolveCartItems(items: CartItem[]): ResolvedCartLine[] {
  return items.map((item) => ({
    item,
    shopifyVariantId: getShopifyVariantId(item.photoSlug, item.size, item.framing, item.frameColor),
  }));
}
