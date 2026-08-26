// "Shop by Room" grouping — which photos have a room-mockup for a given room,
// derived from the same mockups already used for the print-card carousels
// (see PrintCard.tsx). No new photography or tagging required: eligibility
// is just "does this photo have a mockup whose label mentions this room."
import type { Photo } from "./catalog";
import type { PhotoMockup } from "./categories";

export type RoomSlug = "living-room" | "bedroom";

export type Room = {
  slug: RoomSlug;
  label: string;
  /** Lowercase substring matched against a mockup's label, e.g. "Modern Living Room". */
  match: string;
  /** Preferred print (by title) for the home page teaser hero, if it has a mockup for this room. */
  heroTitle?: string;
};

export const ROOMS: Room[] = [
  { slug: "living-room", label: "Living Room", match: "living room", heroTitle: "Scatter" },
  { slug: "bedroom", label: "Bedroom", match: "bedroom", heroTitle: "Sorbet" },
];

export type RoomGroup = {
  room: Room;
  /** Every photo with at least one mockup for this room, in catalog order. */
  photos: Photo[];
  /** Teaser image for this room — prefers a most-popular print so the home page hook is a strong photo. */
  hero: { photo: Photo; mockup: PhotoMockup };
};

export function groupPhotosByRoom(
  photos: Photo[],
  mockupsBySrc: Record<string, PhotoMockup[]>
): RoomGroup[] {
  const groups: RoomGroup[] = [];

  for (const room of ROOMS) {
    const eligible: { photo: Photo; roomMockup: PhotoMockup }[] = [];
    for (const photo of photos) {
      const roomMockup = (mockupsBySrc[photo.src] ?? []).find((m) =>
        m.label.toLowerCase().includes(room.match)
      );
      if (roomMockup) eligible.push({ photo, roomMockup });
    }

    if (eligible.length === 0) continue;

    const heroEntry =
      (room.heroTitle && eligible.find((e) => e.photo.title === room.heroTitle)) ||
      eligible.find((e) => e.photo.tags.includes("most-popular")) ||
      eligible[0];
    groups.push({
      room,
      photos: eligible.map((e) => e.photo),
      hero: { photo: heroEntry.photo, mockup: heroEntry.roomMockup },
    });
  }

  return groups;
}
