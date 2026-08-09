"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/app/components/CartContext";

function formatNzd(value: number): string {
  return `$${value.toFixed(0)} NZD`;
}

function orderRequestHref(items: CartItem[], totalPrice: number): string {
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
    `Subtotal: ${formatNzd(totalPrice)}`,
    "",
    "Name:",
    "Delivery address:",
  ].join("\n");

  return `mailto:nickjwhittaker@gmail.com?subject=${encodeURIComponent("Print Order Request")}&body=${encodeURIComponent(body)}`;
}

export default function CartPage() {
  const { items, removeItem, setQty, totalCount, totalPrice } = useCart();

  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head">
          <h1>Cart</h1>
          <p>
            {totalCount > 0
              ? `${totalCount} print${totalCount === 1 ? "" : "s"} ready for checkout.`
              : "Your cart is currently empty."}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>You haven&rsquo;t added any prints yet.</p>
            <Link href="/gallery" className="btn btn-outline">
              Browse the Gallery
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
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
            </ul>

            <div className="cart-summary">
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>{formatNzd(totalPrice)}</span>
              </div>
              <p className="cart-summary__note">
                We&rsquo;ll confirm framing, shipping and payment details by email.
              </p>
              <a href={orderRequestHref(items, totalPrice)} className="btn btn-primary cart-summary__cta">
                Request to Order
              </a>
              <Link href="/gallery" className="btn-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
