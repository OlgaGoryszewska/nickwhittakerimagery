import type { Metadata } from "next";
import { getAllPhotos } from "@/app/lib/categories";
import GalleryBrowser from "@/app/components/GalleryBrowser";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";

const TITLE = "Gallery — Nick Whittaker Imagery";
const DESCRIPTION =
  "The full catalogue of fine-art ocean and water photography, filterable by mood, light and subject.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/gallery`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`],
  },
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const photos = await getAllPhotos();

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Gallery</h1>
          <p>The full catalogue — filter by mood, light or subject to find the print you&apos;re after.</p>
        </Reveal>
        <GalleryBrowser photos={photos} initialTag={tag} />
      </div>
    </section>
  );
}
