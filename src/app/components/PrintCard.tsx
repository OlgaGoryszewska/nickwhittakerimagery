"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { SIZE_OPTIONS, type Photo } from "@/app/lib/catalog";

export type PrintCardImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12.5 10 17 19 7" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 8h16l-1.4 11.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 8Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <line x1="9" y1="12" x2="9" y2="16" />
      <line x1="15" y1="12" x2="15" y2="16" />
    </svg>
  );
}

export default function PrintCard({
  photo,
  images,
  linkToDetail = false,
  swipeEnabled = true,
  inCart,
  onAddToCart,
  onOpenLightbox,
}: {
  photo: Photo;
  images: PrintCardImage[];
  /** When true, clicking the image navigates to the detail page instead of opening the lightbox. */
  linkToDetail?: boolean;
  /**
   * Disable the in-card image swipe/carousel. Needed when this card sits inside a
   * horizontally-scrolling row (e.g. the home page's "Most Popular" strip): the
   * swipe gesture requires `touch-action: pan-y` on the image, which blocks the
   * row's own native horizontal touch-scroll from ever engaging — two competing
   * horizontal gestures on one touch input is a well-known source of janky,
   * broken-feeling scroll on mobile. In a horizontally-scrolling context, the row
   * itself should own horizontal touch gestures, so per-card swipe is turned off
   * and the card just shows its first image.
   */
  swipeEnabled?: boolean;
  inCart: boolean;
  onAddToCart: () => void;
  onOpenLightbox: () => void;
}) {
  const carouselActive = swipeEnabled && images.length > 1;
  const [imageIndex, setImageIndex] = useState(0);
  const current = carouselActive ? (images[imageIndex] ?? images[0]) : images[0];
  const detailHref = `/${photo.categorySlug}/${photo.slug}`;

  // Finger/pointer swipe between images. The swipeable element is also the
  // navigate/open-lightbox trigger, so a swipe has to suppress the
  // subsequent click (see handleClick) or it'd also navigate/open on release.
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);

  function handlePointerDown(e: React.PointerEvent) {
    if (!carouselActive) return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!carouselActive) return;
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

    didSwipe.current = true;
    setImageIndex((i) => (dx < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length));
  }

  /** Returns true (and suppresses the click) if this click was the tail end of a swipe. */
  function handleClick(e: React.MouseEvent): boolean {
    if (didSwipe.current) {
      e.preventDefault();
      didSwipe.current = false;
      return true;
    }
    return false;
  }

  const swipeProps = {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onClick: handleClick,
  };

  return (
    <>
      <div className="print-card__media">
        {linkToDetail ? (
          <Link
            href={detailHref}
            className={`print-card__mat${carouselActive ? " print-card__mat--swipeable" : ""}`}
            aria-label={`View ${photo.title} details`}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            {...swipeProps}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              draggable={false}
            />
          </Link>
        ) : (
          <button
            type="button"
            className={`print-card__mat${carouselActive ? " print-card__mat--swipeable" : ""}`}
            aria-label={`View ${photo.title} larger`}
            onClick={(e) => {
              if (!handleClick(e)) onOpenLightbox();
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              draggable={false}
            />
          </button>
        )}

        {carouselActive && (
          <span className="print-card__media-counter">
            {imageIndex + 1}/{images.length}
          </span>
        )}
      </div>

      <div className="print-card__info">
        <h3>
          <Link href={detailHref}>{photo.title}</Link>
        </h3>
        <p className="print-card__location">{photo.location}</p>

        <div className="print-card__price-row">
          <span className="print-card__price">From {SIZE_OPTIONS[0].price}</span>
          <button
            type="button"
            className={`print-card__cart-btn${inCart ? " is-in-cart" : ""}`}
            aria-label={
              inCart
                ? `${photo.title} (${SIZE_OPTIONS[0].size}) is in your cart — add another`
                : `Add ${photo.title} (${SIZE_OPTIONS[0].size}) to cart`
            }
            onClick={onAddToCart}
          >
            {inCart ? <CheckIcon /> : <CartIcon />}
          </button>
        </div>

        <details className="print-card__sizes-accordion">
          <summary>Sizes &amp; Pricing</summary>
          <ul className="print-card__sizes">
            {SIZE_OPTIONS.map((option) => (
              <li key={option.size}>
                <span className="print-card__size-name">{option.size}</span>
                <span className="print-card__size-dims">{option.dimensions}</span>
                <span className="print-card__size-price">{option.price}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </>
  );
}
