"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerUp(e: React.PointerEvent) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) {
      onNavigate((index + 1) % images.length);
    } else {
      onNavigate((index - 1 + images.length) % images.length);
    }
  }

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

  return createPortal(
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

      <div
        className="lightbox__stage"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <Image
          key={image.key}
          src={image.src}
          alt={image.alt ?? image.title}
          width={image.width}
          height={image.height}
          sizes="90vw"
          priority
          draggable={false}
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
    </div>,
    document.body
  );
}
