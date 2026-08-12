import { NO_FRAME } from "../framing.ts";

// Deterministic (photo, size, framing, colour) -> Shopify key scheme, shared
// by the sync script (Phase B) and cart resolution (Phase D) so both sides
// always agree on identity without a lookup round-trip.

const FRAMING_CODES: Record<string, string> = {
  [NO_FRAME]: "UNFRAMED",
  "Simple Framing": "SIMPLE",
  "Mat Framing": "MAT",
};

const COLOR_CODES: Record<string, string> = {
  Black: "BLACK",
  White: "WHITE",
  "Natural Oak": "OAK",
};

// Sentinel colour value for unframed variants — every Shopify variant needs
// a value for all 3 options (Size/Framing/Colour), even though colour is
// meaningless without a frame. Safe here because the site never renders
// Shopify's own variant picker; PhotoPurchasePanel always drives selection
// and maps it through variantKey().
const NO_COLOR_CODE = "NA";
export const NO_COLOR_LABEL = "N/A";

function framingCode(framing: string): string {
  const code = FRAMING_CODES[framing];
  if (!code) throw new Error(`Unknown framing style: "${framing}"`);
  return code;
}

function colorCode(framing: string, frameColor?: string): string {
  if (framing === NO_FRAME) return NO_COLOR_CODE;
  if (!frameColor) throw new Error(`Framed variant ("${framing}") requires a frame colour`);
  const code = COLOR_CODES[frameColor];
  if (!code) throw new Error(`Unknown frame colour: "${frameColor}"`);
  return code;
}

export function variantKey(size: string, framing: string, frameColor?: string): string {
  return `${size}__${framingCode(framing)}__${colorCode(framing, frameColor)}`;
}

export function variantSku(photoSlug: string, size: string, framing: string, frameColor?: string): string {
  return `NWI-${photoSlug}-${size}-${framingCode(framing)}-${colorCode(framing, frameColor)}`;
}
