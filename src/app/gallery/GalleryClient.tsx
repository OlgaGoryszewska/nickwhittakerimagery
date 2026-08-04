"use client";

import { useMemo, useState } from "react";
import { TAGS, type Photo } from "@/app/lib/catalog";
import PrintGrid from "@/app/components/PrintGrid";

export default function GalleryClient({
  photos,
  initialTag,
}: {
  photos: Photo[];
  initialTag?: string;
}) {
  const [activeTags, setActiveTags] = useState<string[]>(
    initialTag && TAGS.some((t) => t.slug === initialTag) ? [initialTag] : []
  );

  function toggleTag(slug: string) {
    setActiveTags((current) =>
      current.includes(slug) ? current.filter((t) => t !== slug) : [...current, slug]
    );
  }

  const filtered = useMemo(() => {
    if (activeTags.length === 0) return photos;
    return photos.filter((photo) => photo.tags.some((tag) => activeTags.includes(tag)));
  }, [photos, activeTags]);

  return (
    <>
      <div className="filter-bar">
        <button
          type="button"
          className={`pill ${activeTags.length === 0 ? "on" : ""}`}
          onClick={() => setActiveTags([])}
        >
          All
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag.slug}
            type="button"
            className={`pill ${activeTags.includes(tag.slug) ? "on" : ""}`}
            onClick={() => toggleTag(tag.slug)}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <p className="note gallery-count">
        {filtered.length} of {photos.length} photos
      </p>

      <PrintGrid photos={filtered} />
    </>
  );
}
