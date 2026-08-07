"use client";

import Image from "next/image";
import { useEffect } from "react";

export type LightboxImage = {
  key: string;
  src: string;
  width: number;
  height: number;
  title: string;
  /** Rich SEO/accessibility text for the <img alt>; falls back to `title` if omitted. */
  alt?: string;
  caption?: string;
};

export default function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const image = images[index];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [index, images.length, onClose, onNavigate]);

  if (!image) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.title}
      onClick={onClose}
    >
      <button type="button" className="lightbox__close" aria-label="Close" onClick={onClose}>
        ✕
      </button>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index - 1 + images.length) % images.length);
        }}
      >
        ‹
      </button>

      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <Image
          key={image.key}
          src={image.src}
          alt={image.alt ?? image.title}
          width={image.width}
          height={image.height}
          sizes="90vw"
          priority
          className="lightbox__image"
        />
        <div className="lightbox__caption">
          <div className="lightbox__caption-title">{image.title}</div>
          {image.caption && <div className="lightbox__caption-location">{image.caption}</div>}
        </div>
      </div>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index + 1) % images.length);
        }}
      >
        ›
      </button>
    </div>
  );
}
