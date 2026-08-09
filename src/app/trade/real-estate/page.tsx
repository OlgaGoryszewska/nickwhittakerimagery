import type { Metadata } from "next";
import Link from "next/link";
import TradePricingBlock from "@/app/components/TradePricingBlock";

export const metadata: Metadata = {
  title: "Art for Real Estate Staging — Nick Whittaker Imagery",
  description:
    "Framed ocean and water photography prints for real estate staging and listings — neutral, room-ready pieces, fast turnaround, reorder the same print across every listing.",
  alternates: { canonical: "/trade/real-estate" },
};

export default function RealEstateTradePage() {
  return (
    <section className="tight">
      <div className="wrap">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/trade">Trade</Link>
          <span>/</span>
          <span>Real Estate &amp; Staging</span>
        </nav>

        <div className="section-head">
          <h2>For Real Estate &amp; Staging</h2>
          <p>
            Staged listings sell faster, and the right art is one of the quickest ways to make a
            room feel finished. Order the same print in the same size across every listing you
            stage, with fast turnaround between properties.
          </p>
        </div>

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

        <div className="trade-links">
          <Link href="/gallery" className="btn-link">
            Browse the full catalogue
          </Link>
          <Link href="/framing-information" className="btn-link">
            Framing options
          </Link>
        </div>

        <TradePricingBlock ctaSubject="Real Estate & Staging Trade Enquiry" />
      </div>
    </section>
  );
}
