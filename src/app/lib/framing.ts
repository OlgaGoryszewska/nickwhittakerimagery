// Framing options offered alongside prints. Content and pricing structure
// reference https://endemicworld.com/pages/framing-information — trimmed to
// the sizes we actually sell (A3–A0, see catalog.ts SIZE_OPTIONS).

// Sentinel framing selection meaning "print only, no frame" — shared by the
// purchase panel and order pricing so both agree on one literal instead of
// drifting independently.
export const NO_FRAME = "No Frame";

export type FramingPrice = { size: string; price: string };

export type FramingStyle = {
  name: string;
  description: string;
  turnaround: string;
  pricing: FramingPrice[];
};

export type FrameMoulding = {
  name: string;
  description: string;
  dimensions: string;
};

export const FRAMING_STYLES: FramingStyle[] = [
  {
    name: "Simple Framing",
    description:
      "The print sits straight in against the glass, for a clean, contemporary aesthetic. Our most affordable option, with the fastest turnaround.",
    turnaround: "4–10 days",
    pricing: [
      { size: "A3", price: "$122 NZD" },
      { size: "A2", price: "$183 NZD" },
      { size: "A1", price: "$293 NZD" },
      { size: "A0", price: "$493 NZD" },
    ],
  },
  {
    name: "Mat Framing",
    description:
      "A border around the print separates it from the glass, creating an archival presentation with both classic and contemporary appeal.",
    turnaround: "14–28 days",
    pricing: [
      { size: "A3", price: "$198 NZD" },
      { size: "A2", price: "$288 NZD" },
      { size: "A1", price: "$450 NZD" },
      { size: "A0", price: "$621 NZD" },
    ],
  },
  {
    name: "Setback Framing",
    description:
      "The print is mounted away from the glass, creating space between the two — an archival option that adds visual depth, ideal for photography.",
    turnaround: "14–28 days",
    pricing: [
      { size: "A3", price: "$216 NZD" },
      { size: "A2", price: "$308 NZD" },
      { size: "A1", price: "$480 NZD" },
      { size: "A0", price: "$672 NZD" },
    ],
  },
  {
    name: "Float Framing",
    description:
      "The print is mounted with tape or glue in the middle of the frame for a floating appearance, showcasing its edges.",
    turnaround: "14–28 days",
    pricing: [
      { size: "A3", price: "$216 NZD" },
      { size: "A2", price: "$308 NZD" },
      { size: "A1", price: "$480 NZD" },
      { size: "A0", price: "$672 NZD" },
    ],
  },
  {
    name: "Canvas Framing",
    description:
      "A finishing frame for stretched canvas prints, neatly hiding the canvas edges and staples.",
    turnaround: "21–28 days",
    pricing: [
      { size: "A3", price: "$190 NZD" },
      { size: "A2", price: "$250 NZD" },
      { size: "A1", price: "$340 NZD" },
      { size: "A0", price: "$460 NZD" },
    ],
  },
];

// The two framing styles offered as an add-on when buying a specific print
// (kept separate from the full FRAMING_STYLES list, which also powers the
// general /framing-information reference page).
export const PURCHASABLE_FRAMING_STYLES: FramingStyle[] = FRAMING_STYLES.filter(
  (style) => style.name === "Simple Framing" || style.name === "Mat Framing"
);

export type FrameColor = { name: string; swatch: string };

export const FRAME_COLORS: FrameColor[] = [
  { name: "Black", swatch: "#1a1d1e" },
  { name: "White", swatch: "#fff" },
  { name: "Natural Oak", swatch: "#c9a06c" },
];

export type PaperFinish = { name: string; description: string };

// First entry is the artist's recommended default for these prints — kept
// first in the list intentionally, and pre-selected in the purchase panel.
export const PAPER_FINISHES: PaperFinish[] = [
  {
    name: "Metallic",
    description: "A luminous, pearlescent finish that adds depth and shimmer to water and light — the artist's choice for these prints.",
  },
  {
    name: "Matte",
    description: "A soft, non-reflective finish with rich, true-to-life colour.",
  },
  {
    name: "Gloss",
    description: "A vivid, high-shine finish that deepens contrast and colour saturation.",
  },
];

export const FRAME_MOULDINGS: FrameMoulding[] = [
  {
    name: "Skinny Frames",
    description: "A contemporary, minimal profile. Available up to A1.",
    dimensions: "20mm wide × 20mm high",
  },
  {
    name: "Classic Frames",
    description: "Timeless styling. A0 uses a wider classic profile.",
    dimensions: "30mm wide × 20mm high (A0: 40mm × 20mm)",
  },
  {
    name: "Box Frames",
    description: "A modern profile with added depth. A0 uses a deeper box profile.",
    dimensions: "20mm wide × 30mm high (A0: 20mm × 40mm)",
  },
];
