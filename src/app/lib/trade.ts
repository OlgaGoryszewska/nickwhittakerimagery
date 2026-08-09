// Shared trade-program constants, used by /trade and its four segment pages.

export type TradeTier = { band: string; pct: string; note: string };

export const TRADE_TIERS: TradeTier[] = [
  { band: "$0 – $1,500 NZD", pct: "15%", note: "Entry tier — a single room or listing" },
  { band: "$1,500 – $5,000 NZD", pct: "25%", note: "Project tier — a home or small fit-out" },
  { band: "$5,000 NZD +", pct: "35%", note: "Programme tier — hospitality rollouts, corporate" },
];

export const TRADE_VALUE_ADDS: string[] = [
  "No minimum order",
  "Consolidated invoicing",
  "Bespoke framing",
  "Priority lead time",
  "Sample / pilot pieces",
  "Site-specific mockups",
  "Net payment terms",
  "Dedicated contact",
];

export type TradeSegment = {
  slug: string;
  label: string;
  href: string;
  summary: string;
};

export const TRADE_SEGMENTS: TradeSegment[] = [
  {
    slug: "interior-design",
    label: "Interior Designers",
    href: "/trade/interior-design",
    summary: "Order across client projects at a trade rate, with framing and mounting handled for you.",
  },
  {
    slug: "real-estate",
    label: "Real Estate & Staging",
    href: "/trade/real-estate",
    summary: "Neutral, room-ready pieces for listings — reorder the same print in the same size, every time.",
  },
  {
    slug: "commercial",
    label: "Commercial & Corporate",
    href: "/trade/commercial",
    summary: "Large-format prints for offices, restaurants and retail fit-outs, on a single consolidated invoice.",
  },
  {
    slug: "hospitality",
    label: "Hospitality & Hotels",
    href: "/trade/hospitality",
    summary: "No minimum order for phased rollouts, with provenance documentation for multi-room programmes.",
  },
];
