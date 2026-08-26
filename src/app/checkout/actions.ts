"use server";

import type Stripe from "stripe";
import type { CartItem } from "@/app/components/CartContext";
import { createOrder, type OrderCustomer } from "@/app/lib/orders";
import { calculateOrderTotals, lineTotal } from "@/app/lib/pricing";
import { BASE_URL } from "@/app/lib/seo";
import { SHIPPING_ESTIMATE_OPTIONS } from "@/app/lib/shipping";
import { createClient } from "@/app/lib/supabase/server";
import { getStripe } from "@/app/lib/stripe";

export type StartCheckoutResult = { ok: true; url: string } | { ok: false; error: string };

// Creates the pending order first (so there's a stable id to key the Stripe
// session/webhook off of), then a Stripe Checkout Session for the exact
// same totals, and hands the customer off to Stripe's hosted payment page.
// Payment is only ever confirmed by the webhook (see api/stripe-webhook) —
// this action never itself marks an order as paid.
export async function startCheckout(
  items: CartItem[],
  customer: OrderCustomer,
  shippingRegion: string
): Promise<StartCheckoutResult> {
  if (items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (!customer.name.trim() || !customer.email.trim() || !customer.address.trim() || !customer.postcode.trim()) {
    return { ok: false, error: "Please fill in your name, email, delivery address, and postcode." };
  }

  const shippingOption = SHIPPING_ESTIMATE_OPTIONS.find((option) => option.value === shippingRegion);
  const totals = calculateOrderTotals(items, shippingRegion);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orderResult = await createOrder({
    items,
    customer,
    shippingRegion,
    totals,
    userId: user?.id ?? null,
  });

  if (!orderResult.ok) {
    console.error("startCheckout: createOrder failed:", orderResult.error);
    return { ok: false, error: "Couldn't record your order. Please try again or contact us directly." };
  }

  // Prices are already GST-inclusive (see lib/pricing.ts) so the Stripe line
  // items just charge the displayed total — no separate tax config needed.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
    const framing =
      item.framing === "No Frame" ? "No Frame" : `${item.framing}${item.frameColor ? ` — ${item.frameColor}` : ""}`;
    return {
      price_data: {
        currency: "nzd",
        product_data: {
          name: `${item.title} — ${item.size}`,
          description: `${item.paper} paper, ${framing}`,
        },
        unit_amount: Math.round((lineTotal(item) / item.qty) * 100),
      },
      quantity: item.qty,
    };
  });

  if (totals.shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "nzd",
        product_data: {
          name: `Shipping — ${shippingOption?.label ?? shippingRegion}`,
        },
        unit_amount: Math.round(totals.shipping * 100),
      },
      quantity: 1,
    });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: customer.email,
      client_reference_id: orderResult.orderId,
      metadata: { orderId: orderResult.orderId },
      success_url: `${BASE_URL}/checkout/success?order=${orderResult.orderId}`,
      cancel_url: `${BASE_URL}/checkout`,
    });

    if (!session.url) {
      return { ok: false, error: "Couldn't start payment. Please try again or contact us directly." };
    }

    return { ok: true, url: session.url };
  } catch (err) {
    console.error("startCheckout: Stripe session creation failed:", err);
    return { ok: false, error: "Couldn't start payment. Please try again or contact us directly." };
  }
}
