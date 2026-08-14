"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/components/CartContext";
import OrderSummary from "@/app/components/OrderSummary";
import Reveal from "@/app/components/Reveal";
import { submitOrderRequest } from "@/app/checkout/actions";
import { calculateOrderTotals } from "@/app/lib/pricing";
import { SHIPPING_ESTIMATE_OPTIONS } from "@/app/lib/shipping";
import type { CartItem } from "@/app/components/CartContext";

function formatNzd(value: number): string {
  return `$${value.toFixed(2).replace(/\.00$/, "")} NZD`;
}

function orderRequestHref(
  items: CartItem[],
  totals: ReturnType<typeof calculateOrderTotals>,
  shippingLabel: string,
  customer: { name: string; email: string; address: string }
): string {
  const lines = items.map((item) => {
    const framing =
      item.framing === "No Frame" ? "No Frame" : `${item.framing}${item.frameColor ? ` — ${item.frameColor}` : ""}`;
    return `- ${item.title} — ${item.size} (${item.dimensions}), ${framing} — Qty ${item.qty} — ${formatNzd(
      item.priceValue * item.qty
    )}`;
  });

  const body = [
    "Hi Nick,",
    "",
    "I'd like to order the following prints:",
    "",
    ...lines,
    "",
    `Subtotal: ${formatNzd(totals.subtotal)}`,
    `Shipping (${shippingLabel}): ${totals.shipping === 0 ? "Free" : formatNzd(totals.shipping)}`,
    ...(totals.tax > 0 ? [`Includes GST: ${formatNzd(totals.tax)}`] : []),
    `Total: ${formatNzd(totals.total)}`,
    "",
    `Name: ${customer.name}`,
    `Email: ${customer.email}`,
    `Delivery address: ${customer.address}`,
  ].join("\n");

  return `mailto:order@nickwhittakerimagery.com?subject=${encodeURIComponent("Print Order Request")}&body=${encodeURIComponent(body)}`;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();

  const [shippingRegion, setShippingRegion] = useState(SHIPPING_ESTIMATE_OPTIONS[0].value);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const mailtoLinkRef = useRef<HTMLAnchorElement>(null);

  const selectedRegion = SHIPPING_ESTIMATE_OPTIONS.find((option) => option.value === shippingRegion);
  const totals = calculateOrderTotals(items, shippingRegion);

  async function handleSubmitOrder() {
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitOrderRequest(items, { name, email, address }, shippingRegion);

    if (!result.ok) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    mailtoLinkRef.current?.click();
    setSubmitting(false);
    // Clear after building the mailto link (which reads `items`) — otherwise
    // the email body would go out empty.
    clearCart();
    setPlacedOrderId(result.orderId);
  }

  if (placedOrderId) {
    return (
      <section className="tight">
        <div className="wrap">
          <Reveal className="section-head">
            <h1>Order received</h1>
            <p className="lede">{`Thanks${name ? `, ${name}` : ""} — we’ve got your order request.`}</p>
          </Reveal>
          <p className="checkout-confirmation__order-nr">
            Order #{placedOrderId.slice(0, 8).toUpperCase()}
          </p>
          <p>
            We&rsquo;ll be in touch at {email} shortly to confirm payment details. Keep your order number handy
            if you need to reach us about it.
          </p>
          <Link href="/gallery" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="tight">
        <div className="wrap">
          <Reveal className="section-head">
            <h1>Checkout</h1>
            <p>Your cart is currently empty.</p>
          </Reveal>
          <Link href="/gallery" className="btn btn-outline">
            Browse the Gallery
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Checkout</h1>
        </Reveal>

        <div className="cart-layout">
          <Reveal className="checkout-main">
            <div className="checkout-section">
              <h2>Order summary</h2>
              <OrderSummary items={items} />
            </div>

            <div className="checkout-section">
              <h2>Delivery details</h2>
              <div className="checkout-form">
                <div className="purchase-field">
                  <label className="purchase-field__label" htmlFor="checkout-name">
                    Full name
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    className="field-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="purchase-field">
                  <label className="purchase-field__label" htmlFor="checkout-email">
                    Email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    className="field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="purchase-field">
                  <label className="purchase-field__label" htmlFor="checkout-address">
                    Delivery address
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    className="field-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="purchase-field">
                  <label className="purchase-field__label" htmlFor="checkout-region">
                    Shipping region
                  </label>
                  <select
                    id="checkout-region"
                    className="field-input"
                    value={shippingRegion}
                    onChange={(e) => setShippingRegion(e.target.value)}
                  >
                    {SHIPPING_ESTIMATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h2>Payment</h2>
              <p className="checkout-payment-placeholder">
                Secure card payment is coming soon. In the meantime, submit your order request below and
                we&rsquo;ll confirm payment details by email.
              </p>
            </div>
          </Reveal>

          <Reveal className="cart-summary" delay={120}>
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>{formatNzd(totals.subtotal)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Shipping</span>
              <span>{totals.shipping === 0 ? "Free" : formatNzd(totals.shipping)}</span>
            </div>
            {totals.tax > 0 && (
              <p className="cart-summary__note">Includes GST: {formatNzd(totals.tax)}</p>
            )}
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>{formatNzd(totals.total)}</span>
            </div>

            {submitError && <p className="cart-summary__note cart-summary__note--error">{submitError}</p>}

            <a
              ref={mailtoLinkRef}
              href={orderRequestHref(items, totals, selectedRegion?.label ?? "", { name, email, address })}
              className="hidden"
              aria-hidden
              tabIndex={-1}
            >
              Email order request
            </a>
            <button
              type="button"
              className="btn btn-primary cart-summary__cta"
              onClick={handleSubmitOrder}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Order Request"}
            </button>
            <Link href="/cart" className="btn-link">
              Back to Cart
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
