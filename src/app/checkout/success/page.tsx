"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/components/CartContext";
import Reveal from "@/app/components/Reveal";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const cleared = useRef(false);

  useEffect(() => {
    // Stripe's redirect back here means payment went through — the webhook
    // is what actually marks the order paid server-side, this just clears
    // the local cart now that it's no longer needed.
    if (!cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [clearCart]);

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Payment received</h1>
          <p className="lede">Thanks — your order is confirmed.</p>
        </Reveal>
        {orderId && (
          <p className="checkout-confirmation__order-nr">Order #{orderId.slice(0, 8).toUpperCase()}</p>
        )}
        <p>A confirmation email is on its way. Keep your order number handy if you need to reach us about it.</p>
        <Link href="/gallery" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
