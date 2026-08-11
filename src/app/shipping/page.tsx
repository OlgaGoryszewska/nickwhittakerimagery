import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";
import {
  NZ_STANDARD_RATES,
  NZ_OVERSIZED_RATES,
  DELIVERY_TIMES,
  INTERNATIONAL_RATES,
} from "@/app/lib/shipping";

const TITLE = "Shipping — Nick Whittaker Imagery";
const DESCRIPTION =
  "Shipping rates and delivery times for fine-art ocean and water photography prints — New Zealand-wide and international shipping.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/shipping" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/shipping`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`],
  },
};

export default function ShippingPage() {
  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Shipping</h1>
          <p>Every print is packed to order and shipped from New Zealand.</p>
        </Reveal>

        <div className="framing-styles">
          <Reveal className="framing-style-card">
            <h3>NZ Shipping</h3>
            <p className="framing-style-card__desc">
              Flat-rate shipping per order for standard-sized art prints, framed and unframed
              (A4–A0).
            </p>
            <ul className="shipping-rates">
              {NZ_STANDARD_RATES.map((rate) => (
                <li key={rate.region}>
                  <span className="shipping-rates__label">{rate.region}</span>
                  <span className="shipping-rates__value">{rate.price}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="framing-style-card" delay={80}>
            <h3>Oversized Artworks</h3>
            <p className="framing-style-card__desc">
              Super A0, bespoke framed A0 and large paintings greater than 1000mm × 1000mm.
            </p>
            <ul className="shipping-rates">
              {NZ_OVERSIZED_RATES.map((rate) => (
                <li key={rate.region}>
                  <span className="shipping-rates__label">{rate.region}</span>
                  <span className="shipping-rates__value">{rate.price}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="framing-style-card" delay={160}>
            <h3>Delivery Times</h3>
            <p className="framing-style-card__desc">
              From dispatch, by print type.
            </p>
            <ul className="shipping-rates">
              {DELIVERY_TIMES.map((entry) => (
                <li key={entry.item}>
                  <span className="shipping-rates__label">{entry.item}</span>
                  <span className="shipping-rates__value">{entry.time}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="section-head framing-section-head">
          <h2>International Shipping</h2>
          <p>We only ship unframed artworks outside of New Zealand.</p>
        </Reveal>

        <div className="framing-mouldings">
          {INTERNATIONAL_RATES.map((rate, index) => (
            <Reveal key={rate.destination} className="framing-moulding-card" delay={index * 80}>
              <h3>{rate.destination}</h3>
              <p>{rate.price}</p>
              <p className="framing-moulding-card__dims">{rate.time}</p>
            </Reveal>
          ))}
        </div>

        <p className="framing-note">
          *Auckland shipping is free on standard-sized art prints — oversized artworks are
          excluded and shipped at the rates above. Oversize artworks include Super A0, bespoke
          framed A0 and large paintings greater than 1000mm × 1000mm.
        </p>

        <Reveal className="trade-links">
          <Link href="/framing-information" className="btn-link">
            More on framing options &amp; other styles
          </Link>
          <Link href="/contact" className="btn-link">
            Questions about your order?
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
