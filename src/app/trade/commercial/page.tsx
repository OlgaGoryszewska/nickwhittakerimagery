import type { Metadata } from "next";
import Link from "next/link";
import TradePricingBlock from "@/app/components/TradePricingBlock";
import Reveal from "@/app/components/Reveal";
import { BASE_URL, breadcrumbJsonLd } from "@/app/lib/seo";

const TITLE = "Large-Format Prints for Commercial & Corporate Spaces — Nick Whittaker Imagery";
const DESCRIPTION =
  "Large-format fine-art ocean photography for offices, restaurants and retail fit-outs — sizes up to 118.9cm, framed to order, on a single consolidated invoice.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/trade/commercial" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/trade/commercial`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-emerald-storm-break.jpg`],
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", url: BASE_URL },
  { name: "Trade", url: `${BASE_URL}/trade` },
  { name: "Commercial & Corporate", url: `${BASE_URL}/trade/commercial` },
]);

export default function CommercialTradePage() {
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
          <span>Commercial &amp; Corporate</span>
        </nav>

        <Reveal className="section-head">
          <h1>For Commercial &amp; Corporate</h1>
          <p>
            From a single boardroom to a multi-floor fit-out, order fine-art prints at
            commercial scale — consistent sizing and framing across every space, on one invoice
            for the whole project.
          </p>
        </Reveal>

        <Reveal>
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
        </Reveal>

        <Reveal className="trade-links">
          <Link href="/gallery" className="btn-link">
            Browse the full catalogue
          </Link>
          <Link href="/framing-information" className="btn-link">
            Framing options
          </Link>
        </Reveal>

        <TradePricingBlock ctaSubject="Commercial & Corporate Trade Enquiry" />
      </div>
    </section>
  );
}
