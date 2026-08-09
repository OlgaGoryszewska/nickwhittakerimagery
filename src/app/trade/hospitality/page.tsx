import type { Metadata } from "next";
import Link from "next/link";
import TradePricingBlock from "@/app/components/TradePricingBlock";
import Reveal from "@/app/components/Reveal";
import { BASE_URL, breadcrumbJsonLd } from "@/app/lib/seo";

const TITLE = "Artwork Supplier for Hotels & Hospitality — Nick Whittaker Imagery";
const DESCRIPTION =
  "Fine-art ocean and water photography for hotel and hospitality projects — no minimum order, phased rollouts, provenance documentation, consolidated shipping.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/trade/hospitality" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/trade/hospitality`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-misty-teal-barrel.jpg`],
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", url: BASE_URL },
  { name: "Trade", url: `${BASE_URL}/trade` },
  { name: "Hospitality & Hotels", url: `${BASE_URL}/trade/hospitality` },
]);

export default function HospitalityTradePage() {
  return (
    <section className="tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="wrap">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/trade">Trade</Link>
          <span>/</span>
          <span>Hospitality &amp; Hotels</span>
        </nav>

        <Reveal className="section-head">
          <h1>For Hospitality &amp; Hotels</h1>
          <p>
            Hospitality art programmes rarely happen all at once. We support phased rollouts
            with no minimum order, provenance and condition documentation for every piece, and
            consolidated invoicing across a multi-room or multi-property programme.
          </p>
        </Reveal>

        <Reveal>
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
        </Reveal>

        <Reveal className="trade-links">
          <Link href="/gallery" className="btn-link">
            Browse the full catalogue
          </Link>
          <Link href="/framing-information" className="btn-link">
            Framing options
          </Link>
        </Reveal>

        <TradePricingBlock ctaSubject="Hospitality & Hotels Trade Enquiry" />
      </div>
    </section>
  );
}
