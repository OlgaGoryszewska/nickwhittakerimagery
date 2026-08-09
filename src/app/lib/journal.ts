// Journal / long-tail SEO content. Each post also lives as its own route
// under src/app/journal/[slug]/page.tsx — this list only drives the index
// page and cross-links, so add an entry here whenever a new post is added.

export type JournalPost = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  segment: string;
  segmentHref: string;
  readTime: string;
};

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "choosing-art-for-a-hotel-rollout",
    title: "Choosing Art for a Hotel Rollout",
    dek: "What actually matters when you're sourcing photography for twelve floors instead of one wall.",
    date: "2026-08-09",
    segment: "Hospitality & Hotels",
    segmentHref: "/trade/hospitality",
    readTime: "6 min read",
  },
  {
    slug: "staging-a-listing-with-ocean-photography",
    title: "Staging a Listing with Ocean Photography",
    dek: "Why the right print does more for a listing than another throw pillow — and how to order it fast.",
    date: "2026-08-09",
    segment: "Real Estate & Staging",
    segmentHref: "/trade/real-estate",
    readTime: "5 min read",
  },
];
