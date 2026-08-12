import type { CartItem } from "@/app/components/CartContext";
import { lineTotal, type OrderTotals } from "@/app/lib/pricing";
import { createAdminClient } from "@/app/lib/supabase/admin";

// Writes one order + its line items via the service-role client, which
// bypasses RLS — this is the only place allowed to write to these tables
// (see supabase/migrations/0001_orders.sql: no insert policy exists for the
// anon/authenticated roles). Only ever call this from a Server Action /
// Route Handler that has already recomputed `totals` via
// calculateOrderTotals(); never pass through a client-sent total.

export type OrderCustomer = {
  name: string;
  email: string;
  address: string;
};

export type CreateOrderParams = {
  items: CartItem[];
  customer: OrderCustomer;
  shippingRegion: string;
  totals: OrderTotals;
  userId?: string | null;
  stripePaymentIntentId?: string | null;
};

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; error: string };

export async function createOrder({
  items,
  customer,
  shippingRegion,
  totals,
  userId,
  stripePaymentIntentId,
}: CreateOrderParams): Promise<CreateOrderResult> {
  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId ?? null,
      email: customer.email,
      name: customer.name,
      address: customer.address,
      shipping_region: shippingRegion,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      stripe_payment_intent_id: stripePaymentIntentId ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "Failed to create order" };
  }

  // Per-line prices are recomputed from the catalogue (same logic
  // calculateOrderTotals used for the subtotal), not read from the client's
  // cart item — a tampered priceValue in localStorage should never end up
  // recorded as what was actually charged.
  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      photo_slug: item.photoSlug,
      title: item.title,
      size: item.size,
      framing: item.framing,
      frame_color: item.frameColor ?? null,
      qty: item.qty,
      unit_price: item.qty > 0 ? lineTotal(item) / item.qty : 0,
      line_total: lineTotal(item),
    }))
  );

  if (itemsError) {
    // The order row still exists for manual reconciliation via the Supabase
    // dashboard even if the items insert failed.
    return { ok: false, error: itemsError.message };
  }

  return { ok: true, orderId: order.id };
}
