import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade & Commercial Prints — Nick Whittaker Imagery",
  description:
    "Trade pricing on fine-art ocean and water photography prints for interior designers, real estate stagers, commercial fit-outs and hospitality projects.",
  alternates: { canonical: "/trade" },
};

const TIERS = [
  { band: "$0 – $1,500 NZD", pct: "15%", note: "Entry tier — a single room or listing" },
  { band: "$1,500 – $5,000 NZD", pct: "25%", note: "Project tier — a home or small fit-out" },
  { band: "$5,000 NZD +", pct: "35%", note: "Programme tier — hospitality rollouts, corporate" },
];

const VALUE_ADDS = [
  "No minimum order",
  "Consolidated invoicing",
  "Bespoke framing",
  "Priority lead time",
  "Sample / pilot pieces",
  "Site-specific mockups",
  "Net payment terms",
  "Dedicated contact",
];

const SEGMENTS = [
  {
    title: "Interior Designers",
    body: "Order across client projects at a trade rate, with framing and mounting handled for you.",
  },
  {
    title: "Real Estate & Staging",
    body: "Neutral, room-ready pieces for listings — reorder the same print in the same size, every time.",
  },
  {
    title: "Commercial & Corporate",
    body: "Large-format prints for offices, restaurants and retail fit-outs, on a single consolidated invoice.",
  },
  {
    title: "Hospitality & Hotels",
    body: "No minimum order for phased rollouts, with provenance documentation for multi-room programmes.",
  },
];

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
          {SEGMENTS.map((segment) => (
            <div key={segment.title} className="trade-segment">
              <h3>{segment.title}</h3>
              <p>{segment.body}</p>
            </div>
          ))}
        </div>

        <h3 className="trade-subhead">Trade Pricing</h3>
        <div className="trade-tiers">
          {TIERS.map((tier) => (
            <div key={tier.band} className="trade-tier">
              <div className="trade-tier__band">{tier.band}</div>
              <div className="trade-tier__pct">{tier.pct}</div>
              <div className="trade-tier__note">{tier.note}</div>
            </div>
          ))}
        </div>
        <p className="trade-tiers-note">
          Discount applies to total order value across sizes and prints. Tiers are a starting
          point — get in touch for a quote on your project.
        </p>

        <h3 className="trade-subhead">What&rsquo;s included</h3>
        <div className="tag-row trade-value-adds">
          {VALUE_ADDS.map((item) => (
            <span key={item} className="pill">
              {item}
            </span>
          ))}
        </div>

        <div className="trade-cta">
          <a
            href="mailto:nickjwhittaker@gmail.com?subject=Trade%20%26%20Commercial%20Enquiry"
            className="btn btn-primary"
          >
            Enquire about trade pricing
          </a>
        </div>
      </div>
    </section>
  );
}
