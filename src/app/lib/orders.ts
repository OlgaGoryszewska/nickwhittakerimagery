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
  postcode: string;
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
      postcode: customer.postcode,
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
      paper: item.paper,
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

export type MarkOrderPaidResult = { ok: true } | { ok: false; error: string };

// Called only from the Stripe webhook once `checkout.session.completed`
// actually fires — this is the sole source of truth for "did the customer
// pay," never the client-side redirect back to the success page.
export async function markOrderPaid(orderId: string, stripePaymentIntentId: string): Promise<MarkOrderPaidResult> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: "paid", stripe_payment_intent_id: stripePaymentIntentId })
    .eq("id", orderId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export type OrderEmailItem = {
  title: string;
  size: string;
  paper: string;
  framing: string;
  frame_color: string | null;
  qty: number;
  line_total: number;
};

export type OrderWithItems = {
  id: string;
  email: string;
  name: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  order_items: OrderEmailItem[];
};

// Reads back what was recorded at checkout time (never trusts anything from
// the webhook payload beyond the order id) so the confirmation email always
// reflects what's actually in the database.
export async function getOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, email, name, subtotal, shipping, tax, total, order_items(title, size, paper, framing, frame_color, qty, line_total)")
    .eq("id", orderId)
    .single()
    .returns<OrderWithItems>();

  if (error || !data) return null;
  return data;
}
