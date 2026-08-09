import type { Metadata } from "next";
import { getAllPhotos } from "@/app/lib/categories";
import GalleryBrowser from "@/app/components/GalleryBrowser";

export const metadata: Metadata = {
  title: "Gallery — Nick Whittaker Imagery",
  description:
    "The full catalogue of fine-art ocean and water photography, filterable by mood, light and subject.",
  alternates: { canonical: "/gallery" },
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
        <div className="section-head">
          <h2>Gallery</h2>
          <p>The full catalogue — filter by mood, light or subject to find the print you&apos;re after.</p>
        </div>
        <GalleryBrowser photos={photos} initialTag={tag} />
      </div>
    </section>
  );
}
