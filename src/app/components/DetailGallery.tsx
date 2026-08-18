"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Lightbox from "./Lightbox";

export type DetailGalleryImage = {
  src: string;
  width: number;
  height: number;
  label: string;
  /** Rich SEO/accessibility text for the <img alt>. */
  alt: string;
};

// How much closer the magnifier shows the image, relative to its displayed size.
const ZOOM_FACTOR = 2.5;
const LENS_SIZE = 540;

export default function DetailGallery({
  images,
  title,
}: {
  images: DetailGalleryImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loupeActive, setLoupeActive] = useState(false);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const zoomAreaRef = useRef<HTMLDivElement>(null);
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

  function updateLens(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const rect = zoomAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setLens({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function toggleLoupe(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setLoupeActive((active) => {
      const next = !active;
      if (next && !lens) {
        const rect = zoomAreaRef.current?.getBoundingClientRect();
        if (rect) setLens({ x: rect.width / 2, y: rect.height / 2 });
      }
      if (!next) setLens(null);
      return next;
    });
  }

  return (
    <div className="detail-gallery">
      <div
        ref={zoomAreaRef}
        className="detail-gallery__zoom-area"
        onPointerMove={updateLens}
        onPointerLeave={() => setLens(null)}
      >
        <button
          type="button"
          className="print-card__mat"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View ${title} — ${current.label} in full screen`}
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

        <button
          type="button"
          className={`detail-gallery__zoom-hint${
            loupeActive ? " detail-gallery__zoom-hint--active" : ""
          }`}
          onClick={toggleLoupe}
          aria-pressed={loupeActive}
          aria-label={loupeActive ? "Hide magnifier" : "Show magnifier"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        {loupeActive && lens && zoomAreaRef.current && (
          <div
            className="detail-gallery__lens"
            aria-hidden="true"
            style={{
              left: lens.x,
              top: lens.y,
              backgroundImage: `url(${current.src})`,
              backgroundSize: `${zoomAreaRef.current.clientWidth * ZOOM_FACTOR}px ${
                zoomAreaRef.current.clientHeight * ZOOM_FACTOR
              }px`,
              backgroundPosition: `${-(lens.x * ZOOM_FACTOR - LENS_SIZE / 2)}px ${-(
                lens.y * ZOOM_FACTOR -
                LENS_SIZE / 2
              )}px`,
            }}
          />
        )}
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
            {index + 1}/{images.length}
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
