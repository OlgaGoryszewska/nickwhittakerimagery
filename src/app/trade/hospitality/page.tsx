import type { Metadata } from "next";
import Link from "next/link";
import TradePricingBlock from "@/app/components/TradePricingBlock";

export const metadata: Metadata = {
  title: "Artwork Supplier for Hotels & Hospitality — Nick Whittaker Imagery",
  description:
    "Fine-art ocean and water photography for hotel and hospitality projects — no minimum order, phased rollouts, provenance documentation, consolidated shipping.",
  alternates: { canonical: "/trade/hospitality" },
};

export default function HospitalityTradePage() {
  return (
    <section className="tight">
      <div className="wrap">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/trade">Trade</Link>
          <span>/</span>
          <span>Hospitality &amp; Hotels</span>
        </nav>

        <div className="section-head">
          <h2>For Hospitality &amp; Hotels</h2>
          <p>
            Hospitality art programmes rarely happen all at once. We support phased rollouts
            with no minimum order, provenance and condition documentation for every piece, and
            consolidated invoicing across a multi-room or multi-property programme.
          </p>
        </div>

        <ul className="trade-benefits">
          <li>
            <strong>No minimum order</strong>
            Start with a pilot floor or a single room and scale from there — no minimum order
            size to qualify for trade pricing.
          </li>
          <li>
            <strong>Phased rollouts, on schedule</strong>
            Order in stages across a renovation or multi-property programme, at the same trade
            rate throughout.
          </li>
          <li>
            <strong>Provenance &amp; condition documentation</strong>
            Every piece comes with authentication and care guidance suitable for facilities and
            procurement records.
          </li>
          <li>
            <strong>Consolidated shipping and invoicing</strong>
            One invoice and one shipment schedule across a multi-room or multi-site order.
          </li>
        </ul>

        <div className="trade-links">
          <Link href="/gallery" className="btn-link">
            Browse the full catalogue
          </Link>
          <Link href="/framing-information" className="btn-link">
            Framing options
          </Link>
        </div>

        <TradePricingBlock ctaSubject="Hospitality & Hotels Trade Enquiry" />
      </div>
    </section>
  );
}
