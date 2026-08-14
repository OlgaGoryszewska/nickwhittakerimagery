"use server";

import type { CartItem } from "@/app/components/CartContext";
import { sendOrderConfirmationEmail } from "@/app/lib/email";
import { createOrder, type OrderCustomer } from "@/app/lib/orders";
import { calculateOrderTotals } from "@/app/lib/pricing";
import { createClient } from "@/app/lib/supabase/server";

export type SubmitOrderRequestResult = { ok: true; orderId: string } | { ok: false; error: string };

// Records a "pending" order (no Stripe payment yet — that's Phase 4) the
// moment a checkout request is submitted, independent of whether payment
// happens online or gets confirmed manually by email. Totals are always
// recomputed here, never trusted from the client.
export async function submitOrderRequest(
  items: CartItem[],
  customer: OrderCustomer,
  shippingRegion: string
): Promise<SubmitOrderRequestResult> {
  if (items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (!customer.name.trim() || !customer.email.trim() || !customer.address.trim()) {
    return { ok: false, error: "Please fill in your name, email, and delivery address." };
  }

  const totals = calculateOrderTotals(items, shippingRegion);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await createOrder({
    items,
    customer,
    shippingRegion,
    totals,
    userId: user?.id ?? null,
  });

  if (!result.ok) {
    console.error("submitOrderRequest failed:", result.error);
    return { ok: false, error: "Couldn't record your order. Please try again or contact us directly." };
  }

  await sendOrderConfirmationEmail({
    to: customer.email,
    orderId: result.orderId,
    customerName: customer.name,
    items,
    totals,
  });

  return { ok: true, orderId: result.orderId };
}
