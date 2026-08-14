import { TRADE_TIERS, TRADE_VALUE_ADDS } from "@/app/lib/trade";
import Reveal from "./Reveal";

export default function TradePricingBlock({ ctaSubject }: { ctaSubject: string }) {
  return (
    <>
      <h3 className="trade-subhead">Trade Pricing</h3>
      <div className="trade-tiers">
        {TRADE_TIERS.map((tier, index) => (
          <Reveal key={tier.band} className="trade-tier" delay={index * 90}>
            <div className="trade-tier__band">{tier.band}</div>
            <div className="trade-tier__pct">{tier.pct}</div>
            <div className="trade-tier__note">{tier.note}</div>
          </Reveal>
        ))}
      </div>
      <p className="trade-tiers-note">
        Discount applies to total order value across sizes and prints. Tiers are a starting
        point — get in touch for a quote on your project.
      </p>

      <h3 className="trade-subhead">What&rsquo;s included</h3>
      <div className="tag-row trade-value-adds">
        {TRADE_VALUE_ADDS.map((item) => (
          <span key={item} className="pill">
            {item}
          </span>
        ))}
      </div>

      <Reveal className="trade-cta">
        <div className="trade-cta__row">
          <a
            href={`mailto:order@nickwhittakerimagery.com?subject=${encodeURIComponent(ctaSubject)}`}
            className="btn btn-primary"
          >
            Enquire about trade pricing
          </a>
          <a
            href={`mailto:order@nickwhittakerimagery.com?subject=${encodeURIComponent(
              "Trade Lookbook Request"
            )}&body=${encodeURIComponent(
              "Hi Nick,\n\nCould you send over the trade lookbook?\n\nCompany:\nProject type:\n"
            )}`}
            className="btn btn-outline"
          >
            Request the trade lookbook
          </a>
        </div>
      </Reveal>
    </>
  );
}
