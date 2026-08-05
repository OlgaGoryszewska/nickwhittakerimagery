"use client";

import Image from "next/image";
import { useState } from "react";

export type DetailGalleryImage = {
  src: string;
  width: number;
  height: number;
  label: string;
};

export default function DetailGallery({
  images,
  alt,
}: {
  images: DetailGalleryImage[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div className="detail-gallery">
      <div className="print-card__mat">
        <Image
          key={current.src}
          src={current.src}
          alt={`${alt} — ${current.label}`}
          width={current.width}
          height={current.height}
          sizes="(max-width: 860px) 100vw, 60vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="detail-gallery__nav">
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => setIndex((index - 1 + images.length) % images.length)}
          >
            ‹
          </button>
          <span className="detail-gallery__label">
            {current.label} — {index + 1}/{images.length}
          </span>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setIndex((index + 1) % images.length)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
