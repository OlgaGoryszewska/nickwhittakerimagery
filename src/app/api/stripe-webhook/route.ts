import type Stripe from "stripe";
import { sendOrderConfirmationEmail } from "@/app/lib/email";
import { getOrderWithItems, markOrderPaid } from "@/app/lib/orders";
import { getStripe } from "@/app/lib/stripe";

// Source of truth for "did the customer actually pay" — the checkout/success
// page is only ever a UX confirmation, never what flips an order to "paid".
// Configure this URL (https://<your-domain>/api/stripe-webhook) as an
// endpoint in the Stripe Dashboard, subscribed to checkout.session.completed,
// and put its signing secret in STRIPE_WEBHOOK_SECRET.
export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("stripe-webhook: STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("stripe-webhook: signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    if (!orderId || !paymentIntentId) {
      console.error("stripe-webhook: checkout.session.completed missing orderId or payment_intent", {
        sessionId: session.id,
      });
      return new Response("Missing order reference", { status: 400 });
    }

    const paidResult = await markOrderPaid(orderId, paymentIntentId);
    if (!paidResult.ok) {
      console.error("stripe-webhook: markOrderPaid failed:", paidResult.error);
      return new Response("Failed to update order", { status: 500 });
    }

    const order = await getOrderWithItems(orderId);
    if (order) {
      await sendOrderConfirmationEmail({
        to: order.email,
        orderId: order.id,
        customerName: order.name,
        items: order.order_items,
        totals: {
          subtotal: order.subtotal,
          shipping: order.shipping,
          tax: order.tax,
          total: order.total,
        },
      });
    }
  }

  return new Response("ok", { status: 200 });
}
