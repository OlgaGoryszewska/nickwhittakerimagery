import type { Metadata } from "next";
import Link from "next/link";
import TradePricingBlock from "@/app/components/TradePricingBlock";

export const metadata: Metadata = {
  title: "Large-Format Prints for Commercial & Corporate Spaces — Nick Whittaker Imagery",
  description:
    "Large-format fine-art ocean photography for offices, restaurants and retail fit-outs — sizes up to 118.9cm, framed to order, on a single consolidated invoice.",
  alternates: { canonical: "/trade/commercial" },
};

export default function CommercialTradePage() {
  return (
    <section className="tight">
      <div className="wrap">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/trade">Trade</Link>
          <span>/</span>
          <span>Commercial &amp; Corporate</span>
        </nav>

        <div className="section-head">
          <h2>For Commercial &amp; Corporate</h2>
          <p>
            From a single boardroom to a multi-floor fit-out, order fine-art prints at
            commercial scale — consistent sizing and framing across every space, on one invoice
            for the whole project.
          </p>
        </div>

        <ul className="trade-benefits">
          <li>
            <strong>Large-format, up to A0</strong>
            84.1 × 118.9cm on every print in the catalogue — enough presence for a lobby, boardroom
            or feature wall.
          </li>
          <li>
            <strong>One invoice for the whole fit-out</strong>
            A single consolidated invoice across every print, size and location in the project.
          </li>
          <li>
            <strong>Consistent across every site</strong>
            Order the same piece, size and framing across multiple offices or locations — no
            variation between sites.
          </li>
          <li>
            <strong>Procurement-friendly</strong>
            Net payment terms available on approved trade accounts.
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

        <TradePricingBlock ctaSubject="Commercial & Corporate Trade Enquiry" />
      </div>
    </section>
  );
}
