// Exhibitions and print showings. Single source of truth for both the
// homepage "Upcoming Events" card and the full /events page, so the two
// can't drift out of sync. Array-based so more events can be added later
// without changing the page structure.

export type EventItem = {
  slug: string;
  title: string;
  eyebrow: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  image: string;
  imageAlt: string;
};

export const EVENTS: EventItem[] = [
  {
    slug: "ocean-and-water-paris",
    title: "Ocean & Water — Paris",
    eyebrow: "Upcoming Exhibition",
    dateRange: "23–26 November",
    startDate: "2026-11-23",
    endDate: "2026-11-26",
    location: "Paris, France",
    description:
      "A four-day gallery exhibition of fine-art ocean and water photography, showing a curated selection of prints in central Paris.",
    image: "/Fine%20Art/nick-whittaker-ocean-photography-fisherman-light-trail.jpg",
    imageAlt: "Ocean & Water exhibition, Paris",
  },
];
