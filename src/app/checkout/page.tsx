"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/components/CartContext";
import OrderSummary from "@/app/components/OrderSummary";
import Reveal from "@/app/components/Reveal";
import { startCheckout } from "@/app/checkout/actions";
import { calculateOrderTotals } from "@/app/lib/pricing";
import { SHIPPING_ESTIMATE_OPTIONS } from "@/app/lib/shipping";

function formatNzd(value: number): string {
  return `$${value.toFixed(2).replace(/\.00$/, "")} NZD`;
}

export default function CheckoutPage() {
  const { items } = useCart();

  const [shippingRegion, setShippingRegion] = useState(SHIPPING_ESTIMATE_OPTIONS[0].value);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totals = calculateOrderTotals(items, shippingRegion);

  async function handlePayNow() {
    setSubmitting(true);
    setSubmitError(null);

    const result = await startCheckout(items, { name, email, address }, shippingRegion);

    if (!result.ok) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    // Cart is cleared on the success page once the customer actually lands
    // back from Stripe — not here, so an abandoned/cancelled payment leaves
    // the cart intact.
    window.location.href = result.url;
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
                You&rsquo;ll be securely redirected to Stripe to complete payment by card.
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

            <button
              type="button"
              className="btn btn-primary cart-summary__cta"
              onClick={handlePayNow}
              disabled={submitting}
            >
              {submitting ? "Redirecting…" : "Proceed to Payment"}
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
