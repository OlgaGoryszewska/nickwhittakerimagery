// Types and constants shared between server-only catalog code (categories.ts,
// which touches the filesystem) and client components (e.g. the gallery
// filter bar). Keep this file free of `fs`/`path`/etc. imports so it's safe
// to bundle for the browser.

export type Photo = {
  src: string;
  width: number;
  height: number;
  title: string;
  location: string;
  edition?: string;
  tags: string[];
  categorySlug: string;
  categoryLabel: string;
};

export type Category = {
  slug: string;
  label: string;
  description: string;
  photos: Photo[];
};

export const TAGS: { slug: string; label: string }[] = [
  { slug: "most-popular", label: "Most Popular" },
  { slug: "limited-edition", label: "Limited Edition" },
  { slug: "sunset", label: "Sunsets" },
  { slug: "sunrise", label: "Sunrise" },
  { slug: "wave", label: "Wave" },
  { slug: "abstract", label: "Abstract" },
  { slug: "fine-art", label: "Fine Art" },
  { slug: "mystery", label: "Mystery" },
  { slug: "moody", label: "Moody" },
  { slug: "positive-vibe", label: "Positive Vibe" },
];

export const SIZE_OPTIONS: { size: string; dimensions: string; price: string }[] = [
  { size: "A3", dimensions: "29.7 × 42 cm", price: "$150 NZD" },
  { size: "A2", dimensions: "42 × 59.4 cm", price: "$250 NZD" },
  { size: "A1", dimensions: "59.4 × 84.1 cm", price: "$395 NZD" },
  { size: "A0", dimensions: "84.1 × 118.9 cm", price: "$595 NZD" },
];
