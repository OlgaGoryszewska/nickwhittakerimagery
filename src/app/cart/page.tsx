"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/app/components/CartContext";
import Reveal from "@/app/components/Reveal";
import { createCheckout } from "@/app/lib/shopify/checkout";
import { SHIPPING_ESTIMATE_OPTIONS } from "@/app/lib/shipping";

function formatNzd(value: number): string {
  return `$${value.toFixed(2).replace(/\.00$/, "")} NZD`;
}

function orderRequestHref(
  items: CartItem[],
  totalPrice: number,
  extras: {
    discountCode: string;
    shippingCost: number | null;
    shippingLabel: string;
    name: string;
    address: string;
  }
): string {
  const lines = items.map((item) => {
    const framing =
      item.framing === "No Frame" ? "No Frame" : `${item.framing}${item.frameColor ? ` — ${item.frameColor}` : ""}`;
    return `- ${item.title} — ${item.size} (${item.dimensions}), ${framing} — Qty ${item.qty} — ${formatNzd(
      item.priceValue * item.qty
    )}`;
  });

  const total = totalPrice + (extras.shippingCost ?? 0);

  const body = [
    "Hi Nick,",
    "",
    "I'd like to order the following prints:",
    "",
    ...lines,
    "",
    `Subtotal: ${formatNzd(totalPrice)}`,
    ...(extras.shippingCost !== null
      ? [`Shipping (${extras.shippingLabel}): ${extras.shippingCost === 0 ? "Free" : formatNzd(extras.shippingCost)}`]
      : []),
    ...(extras.discountCode ? [`Discount code: ${extras.discountCode}`] : []),
    ...(extras.shippingCost !== null ? [`Total: ${formatNzd(total)}`] : []),
    "",
    `Name: ${extras.name}`,
    `Delivery address: ${extras.address}`,
  ].join("\n");

  return `mailto:nickjwhittaker@gmail.com?subject=${encodeURIComponent("Print Order Request")}&body=${encodeURIComponent(body)}`;
}

export default function CartPage() {
  const { items, removeItem, setQty, totalCount, totalPrice } = useCart();

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState("");

  const [shippingRegion, setShippingRegion] = useState(SHIPPING_ESTIMATE_OPTIONS[0].value);
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(new Set());

  const selectedRegion = SHIPPING_ESTIMATE_OPTIONS.find((option) => option.value === shippingRegion);

  function handleDiscountSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setDiscountApplied(discountCode.trim());
  }

  function handleCalculateShipping(e: React.FormEvent) {
    e.preventDefault();
    setShippingCost(selectedRegion?.price ?? 0);
  }

  async function handleCheckout() {
    setCheckingOut(true);
    setCheckoutError(null);

    const result = await createCheckout(items);

    if (result.ok) {
      window.location.href = result.checkoutUrl;
      return;
    }

    setCheckoutError(result.error);
    setUnavailableIds(new Set(result.unavailableItemIds ?? []));
    setCheckingOut(false);
  }

  const total = totalPrice + (shippingCost ?? 0);

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Cart</h1>
          <p>
            {totalCount > 0
              ? `${totalCount} print${totalCount === 1 ? "" : "s"} ready for checkout.`
              : "Your cart is currently empty."}
          </p>
        </Reveal>

        {items.length === 0 ? (
          <Reveal className="cart-empty">
            <p>You haven&rsquo;t added any prints yet.</p>
            <Link href="/gallery" className="btn btn-outline">
              Browse the Gallery
            </Link>
          </Reveal>
        ) : (
          <div className="cart-layout">
            <Reveal as="ul" className="cart-items">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  {unavailableIds.has(item.id) && (
                    <p className="cart-item__unavailable">
                      Temporarily unavailable — remove this item or{" "}
                      <Link href="/contact">contact us</Link> to order it.
                    </p>
                  )}
                  <Link
                    href={`/${item.categorySlug}/${item.photoSlug}`}
                    className="cart-item__mat"
                    aria-label={`View ${item.title}`}
                  >
                    <Image src={item.photoSrc} alt={item.title} width={160} height={120} />
                  </Link>

                  <div className="cart-item__info">
                    <h3>
                      <Link href={`/${item.categorySlug}/${item.photoSlug}`}>{item.title}</Link>
                    </h3>
                    <p className="print-card__location">{item.location}</p>
                    <p className="cart-item__size">
                      {item.size} — {item.dimensions}
                    </p>
                    <p className="cart-item__framing">
                      {item.framing === "No Frame"
                        ? "No Frame"
                        : `${item.framing}${item.frameColor ? ` — ${item.frameColor}` : ""}`}
                    </p>
                    <p className="cart-item__unit-price">{item.price} each</p>
                  </div>

                  <div className="cart-item__controls">
                    <div className="cart-item__qty" role="group" aria-label={`Quantity for ${item.title}`}>
                      <button
                        type="button"
                        onClick={() => setQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-item__line-total">
                      {formatNzd(item.priceValue * item.qty)}
                    </span>

                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </Reveal>

            <Reveal className="cart-summary" delay={120}>
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>{formatNzd(totalPrice)}</span>
              </div>
              {shippingCost !== null && (
                <div className="cart-summary__row">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : formatNzd(shippingCost)}</span>
                </div>
              )}
              {shippingCost !== null && (
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Total</span>
                  <span>{formatNzd(total)}</span>
                </div>
              )}

              <form className="cart-discount" onSubmit={handleDiscountSubmit}>
                <label htmlFor="discount-code" className="purchase-field__label">
                  Discount code or gift card
                </label>
                <div className="cart-discount__row">
                  <input
                    id="discount-code"
                    type="text"
                    className="field-input"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <button type="submit" className="btn btn-outline">
                    Submit
                  </button>
                </div>
                {discountApplied && (
                  <p className="cart-summary__note">
                    &ldquo;{discountApplied}&rdquo; added — we&rsquo;ll apply it when we confirm your order.
                  </p>
                )}
              </form>

              <form className="cart-shipping" onSubmit={handleCalculateShipping}>
                <p className="purchase-field__label">Shipping</p>
                <p className="cart-shipping__hint">
                  Enter your shipping address to estimate delivery cost.
                </p>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Full name"
                  aria-label="Full name"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                />
                <input
                  type="text"
                  className="field-input"
                  placeholder="Shipping address"
                  aria-label="Shipping address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
                <select
                  className="field-input"
                  aria-label="Shipping region"
                  value={shippingRegion}
                  onChange={(e) => {
                    setShippingRegion(e.target.value);
                    setShippingCost(null);
                  }}
                >
                  {SHIPPING_ESTIMATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-outline cart-shipping__cta">
                  Calculate Shipping
                </button>
              </form>

              {checkoutError && <p className="cart-summary__note cart-summary__note--error">{checkoutError}</p>}

              <button
                type="button"
                className="btn btn-primary cart-summary__cta"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? "Starting checkout…" : "Checkout"}
              </button>

              <a
                href={orderRequestHref(items, totalPrice, {
                  discountCode: discountApplied,
                  shippingCost,
                  shippingLabel: selectedRegion?.label ?? "",
                  name: shippingName,
                  address: shippingAddress,
                })}
                className="btn-link"
              >
                Or email an order request instead
              </a>
              <Link href="/gallery" className="btn-link">
                Continue Shopping
              </Link>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
