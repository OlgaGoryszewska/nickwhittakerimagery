import type { Metadata } from "next";
import Link from "next/link";
import TradePricingBlock from "@/app/components/TradePricingBlock";

export const metadata: Metadata = {
  title: "Trade Program for Interior Designers — Nick Whittaker Imagery",
  description:
    "Trade pricing on fine-art ocean and water photography prints for interior designers and decorators — framing handled, fast turnaround, a dedicated contact.",
  alternates: { canonical: "/trade/interior-design" },
};

export default function InteriorDesignTradePage() {
  return (
    <section className="tight">
      <div className="wrap">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/trade">Trade</Link>
          <span>/</span>
          <span>Interior Designers</span>
        </nav>

        <div className="section-head">
          <h2>For Interior Designers</h2>
          <p>
            Specify original ocean and water photography for your clients at trade pricing —
            order across projects, have framing and mounting handled for you, and work with a
            dedicated contact instead of a general enquiries inbox.
          </p>
        </div>

        <ul className="trade-benefits">
          <li>
            <strong>Original work, not stock</strong>
            Every print is a genuine Nick Whittaker photograph, shot at Whangamata — nothing a
            client will find on a stock site.
          </li>
          <li>
            <strong>Framing handled for you</strong>
            Simple or Mat framing, chosen at the point of order — no separate framer to brief or
            chase.
          </li>
          <li>
            <strong>A size for every wall</strong>
            A3 through A0 (up to 84.1 × 118.9cm) on every print in the catalogue.
          </li>
          <li>
            <strong>See it before it&rsquo;s ordered</strong>
            Room mockups on most prints show the piece framed and hung, so a client can sign off
            before anything is printed.
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

        <TradePricingBlock ctaSubject="Interior Design Trade Enquiry" />
      </div>
    </section>
  );
}
