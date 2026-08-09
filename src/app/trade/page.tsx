import type { Metadata } from "next";
import Link from "next/link";
import { TRADE_SEGMENTS } from "@/app/lib/trade";
import TradePricingBlock from "@/app/components/TradePricingBlock";

export const metadata: Metadata = {
  title: "Trade & Commercial Prints — Nick Whittaker Imagery",
  description:
    "Trade pricing on fine-art ocean and water photography prints for interior designers, real estate stagers, commercial fit-outs and hospitality projects.",
  alternates: { canonical: "/trade" },
};

export default function TradePage() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head">
          <h2>Trade &amp; Commercial</h2>
          <p>
            Fine-art ocean and water photography for projects, not just single walls — trade
            pricing, framed to order, and shipped as a programme.
          </p>
        </div>

        <div className="trade-segments">
          {TRADE_SEGMENTS.map((segment) => (
            <Link key={segment.slug} href={segment.href} className="trade-segment">
              <h3>{segment.label}</h3>
              <p>{segment.summary}</p>
              <span className="trade-segment__link">Read more →</span>
            </Link>
          ))}
        </div>

        <TradePricingBlock ctaSubject="Trade & Commercial Enquiry" />
      </div>
    </section>
  );
}
