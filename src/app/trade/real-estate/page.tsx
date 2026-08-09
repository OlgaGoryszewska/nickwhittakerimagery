import type { Metadata } from "next";
import Link from "next/link";
import TradePricingBlock from "@/app/components/TradePricingBlock";
import Reveal from "@/app/components/Reveal";
import { BASE_URL, breadcrumbJsonLd } from "@/app/lib/seo";

const TITLE = "Art for Real Estate Staging — Nick Whittaker Imagery";
const DESCRIPTION =
  "Framed ocean and water photography prints for real estate staging and listings — neutral, room-ready pieces, fast turnaround, reorder the same print across every listing.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/trade/real-estate" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/trade/real-estate`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-dreamy-sunset-horizon.jpg`],
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", url: BASE_URL },
  { name: "Trade", url: `${BASE_URL}/trade` },
  { name: "Real Estate & Staging", url: `${BASE_URL}/trade/real-estate` },
]);

export default function RealEstateTradePage() {
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
          <span>Real Estate &amp; Staging</span>
        </nav>

        <Reveal className="section-head">
          <h1>For Real Estate &amp; Staging</h1>
          <p>
            Staged listings sell faster, and the right art is one of the quickest ways to make a
            room feel finished. Order the same print in the same size across every listing you
            stage, with fast turnaround between properties.
          </p>
        </Reveal>

        <Reveal>
          <ul className="trade-benefits">
            <li>
              <strong>Neutral, room-ready tones</strong>
              Coastal blues, warm sand and soft sunset light — pieces chosen to suit a broad range
              of interiors, not just one buyer&rsquo;s taste.
            </li>
            <li>
              <strong>See it hung before it ships</strong>
              Room mockups on most prints show the piece already framed and on the wall, so you
              know it works before it arrives on site.
            </li>
            <li>
              <strong>Reorder with confidence</strong>
              Order the same print and size again for your next listing — no guesswork matching a
              piece a second time.
            </li>
            <li>
              <strong>Simple Framing available in 4–10 days</strong>
              The fastest turnaround option, for when a listing is going on the market this week.
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

        <TradePricingBlock ctaSubject="Real Estate & Staging Trade Enquiry" />
      </div>
    </section>
  );
}
