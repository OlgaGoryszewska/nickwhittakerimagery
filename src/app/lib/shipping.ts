export type ShippingRate = { region: string; price: string };

export const NZ_STANDARD_RATES: ShippingRate[] = [
  { region: "Auckland", price: "Free*" },
  { region: "North Island", price: "$5.99" },
  { region: "South Island", price: "$8.99" },
];

export const NZ_OVERSIZED_RATES: ShippingRate[] = [
  { region: "Auckland", price: "$50.00" },
  { region: "North Island", price: "$140.00" },
  { region: "South Island", price: "$240.00" },
  { region: "Rural", price: "$240.00" },
];

export type DeliveryTime = { item: string; time: string };

export const DELIVERY_TIMES: DeliveryTime[] = [
  { item: "Unframed Art Prints", time: "1–3 days" },
  { item: "Simple Framed Art Prints", time: "2–5 days" },
  { item: "A0 & Oversized Art Prints", time: "7–10 days" },
  { item: "Bespoke Framed Art Prints", time: "7–10 days" },
  { item: "Paintings", time: "1–3 days" },
];

export type InternationalRate = { destination: string; price: string; time: string };

export const INTERNATIONAL_RATES: InternationalRate[] = [
  { destination: "Australia", price: "$59", time: "7–10 days" },
  { destination: "Everywhere Else", price: "$89", time: "14–28 days" },
];

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}

export type ShippingEstimateOption = { value: string; label: string; price: number };

// Estimator options for the cart's shipping calculator — standard-sized prints only
// (the catalogue's largest purchasable size is A0, below the "oversized" threshold).
export const SHIPPING_ESTIMATE_OPTIONS: ShippingEstimateOption[] = [
  ...NZ_STANDARD_RATES.map((rate) => ({
    value: rate.region.toLowerCase().replace(/\s+/g, "-"),
    label: `${rate.region}, New Zealand`,
    price: parsePrice(rate.price),
  })),
  ...INTERNATIONAL_RATES.map((rate) => ({
    value: rate.destination.toLowerCase().replace(/\s+/g, "-"),
    label: rate.destination,
    price: parsePrice(rate.price),
  })),
];
