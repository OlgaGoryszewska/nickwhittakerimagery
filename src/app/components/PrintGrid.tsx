"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SIZE_OPTIONS, parsePrice, type Photo } from "@/app/lib/catalog";
import { PAPER_FINISHES } from "@/app/lib/framing";
import { cartItemId, useCart } from "./CartContext";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";
import AddedToCartPanel from "./AddedToCartPanel";
import { recordPhotoView } from "./RecentlyViewed";

function defaultCartId(photo: Photo): string {
  return cartItemId(photo.src, SIZE_OPTIONS[0].size, "No Frame", "", PAPER_FINISHES[0].name);
}

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

export default function PrintGrid({ photos, className }: { photos: Photo[]; className?: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [addedPanelPhoto, setAddedPanelPhoto] = useState<Photo | null>(null);
  const { items, addItem } = useCart();

  function handleAddToCart(photo: Photo) {
    const size = SIZE_OPTIONS[0];
    const paper = PAPER_FINISHES[0].name;
    addItem({
      id: defaultCartId(photo),
      photoSrc: photo.src,
      title: photo.title,
      location: photo.location,
      categorySlug: photo.categorySlug,
      photoSlug: photo.slug,
      size: size.size,
      dimensions: size.dimensions,
      framing: "No Frame",
      paper,
      price: size.price,
      priceValue: parsePrice(size.price),
    });
    setAddedPanelPhoto(photo);
  }

  return (
    <>
      <div className={`print-grid${className ? ` ${className}` : ""}`}>
        {photos.map((photo, index) => {
          const inCart = items.some((i) => i.id === defaultCartId(photo));
          return (
            <Reveal
              key={`${photo.categorySlug}-${photo.src}`}
              className="print-card"
              delay={Math.min(index * 60, 300)}
            >
              <button
                type="button"
                className="print-card__mat"
                onClick={() => {
                  setLightboxIndex(index);
                  recordPhotoView(photo);
                }}
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
                    className={`print-card__cart-btn${inCart ? " is-in-cart" : ""}`}
                    aria-label={
                      inCart
                        ? `${photo.title} (${SIZE_OPTIONS[0].size}) is in your cart — add another`
                        : `Add ${photo.title} (${SIZE_OPTIONS[0].size}) to cart`
                    }
                    onClick={() => handleAddToCart(photo)}
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
            </Reveal>
          );
        })}
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
          onNavigate={(nextIndex) => {
            setLightboxIndex(nextIndex);
            const nextPhoto = photos[nextIndex];
            if (nextPhoto) recordPhotoView(nextPhoto);
          }}
        />
      )}

      {addedPanelPhoto && (
        <AddedToCartPanel
          photo={addedPanelPhoto}
          size={SIZE_OPTIONS[0].size}
          price={SIZE_OPTIONS[0].price}
          fallbackPhotos={photos}
          onClose={() => setAddedPanelPhoto(null)}
        />
      )}
    </>
  );
}
