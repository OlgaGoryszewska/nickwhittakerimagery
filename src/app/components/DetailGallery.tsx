"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox";

export type DetailGalleryImage = {
  src: string;
  width: number;
  height: number;
  label: string;
  /** Rich SEO/accessibility text for the <img alt>. */
  alt: string;
};

export default function DetailGallery({
  images,
  title,
}: {
  images: DetailGalleryImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = images[index];

  const lightboxImages = images.map((img, i) => ({
    key: `${i}-${img.src}`,
    src: img.src,
    width: img.width,
    height: img.height,
    title,
    alt: img.alt,
    caption: img.label,
  }));

  return (
    <div className="detail-gallery">
      <button
        type="button"
        className="print-card__mat"
        onClick={() => setLightboxOpen(true)}
        aria-label={`View ${title} — ${current.label} larger`}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          sizes="(max-width: 860px) 100vw, 60vw"
          priority
        />
      </button>

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

      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          index={index}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setIndex}
        />
      )}
    </div>
  );
}
