"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SIZE_OPTIONS, type Photo } from "@/app/lib/catalog";
import { cartItemId, parsePrice, useCart } from "./CartContext";
import Lightbox from "./Lightbox";

export default function PrintGrid({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [addedSrc, setAddedSrc] = useState<string | null>(null);
  const { addItem } = useCart();

  function handleAddToCart(photo: Photo) {
    const size = SIZE_OPTIONS[0];
    addItem({
      id: cartItemId(photo.src, size.size, "No Frame"),
      photoSrc: photo.src,
      title: photo.title,
      location: photo.location,
      categorySlug: photo.categorySlug,
      photoSlug: photo.slug,
      size: size.size,
      dimensions: size.dimensions,
      framing: "No Frame",
      price: size.price,
      priceValue: parsePrice(size.price),
    });
    setAddedSrc(photo.src);
    window.setTimeout(() => {
      setAddedSrc((current) => (current === photo.src ? null : current));
    }, 1200);
  }

  return (
    <>
      <div className="print-grid">
        {photos.map((photo, index) => (
          <div key={`${photo.categorySlug}-${photo.src}`} className="print-card">
            <button
              type="button"
              className="print-card__mat"
              onClick={() => setLightboxIndex(index)}
              aria-label={`View ${photo.title} larger`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              />
            </button>
            <div className="print-card__info">
              <h3>
                <Link href={`/${photo.categorySlug}/${photo.slug}`}>{photo.title}</Link>
              </h3>
              <p className="print-card__location">{photo.location}</p>

              <div className="print-card__price-row">
                <span className="print-card__price">From {SIZE_OPTIONS[0].price}</span>
                <button
                  type="button"
                  className="print-card__cart-btn"
                  aria-label={`Add ${photo.title} (${SIZE_OPTIONS[0].size}) to cart`}
                  onClick={() => handleAddToCart(photo)}
                >
                  {addedSrc === photo.src ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M5 12.5 10 17 19 7" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <path d="M4 8h16l-1.4 11.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 8Z" />
                      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
                      <line x1="9" y1="12" x2="9" y2="16" />
                      <line x1="15" y1="12" x2="15" y2="16" />
                    </svg>
                  )}
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
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={photos.map((photo) => ({
            key: `${photo.categorySlug}-${photo.src}`,
            src: photo.src,
            width: photo.width,
            height: photo.height,
            title: photo.title,
            alt: photo.alt,
            caption: photo.location,
          }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
