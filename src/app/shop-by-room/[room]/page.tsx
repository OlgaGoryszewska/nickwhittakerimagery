import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPhotos, getPhotoMockups } from "@/app/lib/categories";
import { ROOMS, groupPhotosByRoom, type RoomSlug } from "@/app/lib/rooms";
import PrintGrid from "@/app/components/PrintGrid";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return ROOMS.map((room) => ({ room: room.slug }));
}

async function findRoomGroup(roomSlug: string) {
  const room = ROOMS.find((r) => r.slug === roomSlug);
  if (!room) return null;

  const allPhotos = await getAllPhotos();
  const mockupLists = await Promise.all(allPhotos.map((photo) => getPhotoMockups(photo)));
  const mockupsBySrc = Object.fromEntries(allPhotos.map((photo, i) => [photo.src, mockupLists[i]]));

  const group = groupPhotosByRoom(allPhotos, mockupsBySrc).find((g) => g.room.slug === roomSlug);
  return group ? { group, mockupsBySrc } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ room: RoomSlug }>;
}): Promise<Metadata> {
  const { room: roomSlug } = await params;
  const result = await findRoomGroup(roomSlug);
  if (!result) return {};

  const { group } = result;
  const title = `Shop the ${group.room.label} — Nick Whittaker Imagery`;
  const description = `Fine-art ocean and water photography prints shown styled in a ${group.room.label.toLowerCase()} — ${group.photos.length} prints to choose from.`;

  return {
    title,
    description,
    alternates: { canonical: `/shop-by-room/${group.room.slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/shop-by-room/${group.room.slug}`,
      images: [`${BASE_URL}${group.hero.mockup.src}`],
    },
  };
}

export default async function ShopByRoomPage({
  params,
}: {
  params: Promise<{ room: RoomSlug }>;
}) {
  const { room: roomSlug } = await params;
  const result = await findRoomGroup(roomSlug);
  if (!result) notFound();

  const { group, mockupsBySrc } = result;

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Shop the {group.room.label}</h1>
          <p>
            {group.photos.length} prints shown styled in a {group.room.label.toLowerCase()} — pick the one
            that fits your space.
          </p>
        </Reveal>
        <PrintGrid photos={group.photos} linkToDetail mockupsBySrc={mockupsBySrc} />
      </div>
    </section>
  );
}
