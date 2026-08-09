import type { Metadata } from "next";
import Link from "next/link";
import { TRADE_SEGMENTS } from "@/app/lib/trade";
import TradePricingBlock from "@/app/components/TradePricingBlock";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";

const TITLE = "Trade & Commercial Prints — Nick Whittaker Imagery";
const DESCRIPTION =
  "Trade pricing on fine-art ocean and water photography prints for interior designers, real estate stagers, commercial fit-outs and hospitality projects.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/trade" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/trade`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`],
  },
};

export default function TradePage() {
  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Trade &amp; Commercial</h1>
          <p>
            Fine-art ocean and water photography for projects, not just single walls — trade
            pricing, framed to order, and shipped as a programme.
          </p>
        </Reveal>

        <div className="trade-segments">
          {TRADE_SEGMENTS.map((segment, index) => (
            <Reveal key={segment.slug} delay={index * 80}>
              <Link href={segment.href} className="trade-segment">
                <h3>{segment.label}</h3>
                <p>{segment.summary}</p>
                <span className="trade-segment__link">Read more →</span>
              </Link>
            </Reveal>
          ))}
        </div>

        <TradePricingBlock ctaSubject="Trade & Commercial Enquiry" />
      </div>
    </section>
  );
}
