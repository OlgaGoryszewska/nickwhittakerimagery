"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { Photo } from "@/app/lib/catalog";

export default function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const photo = photos[index];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + photos.length) % photos.length);
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
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
          onNavigate((index - 1 + photos.length) % photos.length);
        }}
      >
        ‹
      </button>

      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <Image
          key={`${photo.categorySlug}-${photo.src}`}
          src={photo.src}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          sizes="90vw"
          priority
          className="lightbox__image"
        />
        <div className="lightbox__caption">
          <div className="lightbox__caption-title">{photo.title}</div>
          <div className="lightbox__caption-location">{photo.location}</div>
        </div>
      </div>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index + 1) % photos.length);
        }}
      >
        ›
      </button>
    </div>
  );
}
