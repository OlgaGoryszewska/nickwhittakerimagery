"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TAGS, type Photo } from "@/app/lib/catalog";
import PrintGrid from "@/app/components/PrintGrid";

export default function GalleryBrowser({
  photos,
  initialTag,
  limit,
}: {
  photos: Photo[];
  initialTag?: string;
  limit?: number;
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

  const visible = limit ? filtered.slice(0, limit) : filtered;
  const moreHref = activeTags.length === 1 ? `/gallery?tag=${activeTags[0]}` : "/gallery";

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

      <PrintGrid photos={visible} />

      {limit && filtered.length > limit && (
        <div className="gallery-more">
          <Link href={moreHref} className="btn btn-outline">
            See More
          </Link>
        </div>
      )}
    </>
  );
}
