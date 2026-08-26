"use client";

import { useState } from "react";
import { SIZE_OPTIONS, parsePrice, type Photo } from "@/app/lib/catalog";
import { PAPER_FINISHES } from "@/app/lib/framing";
import type { PhotoMockup } from "@/app/lib/categories";
import { cartItemId, useCart } from "./CartContext";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";
import AddedToCartPanel from "./AddedToCartPanel";
import PrintCard, { type PrintCardImage } from "./PrintCard";
import { recordPhotoView } from "./RecentlyViewed";

function defaultCartId(photo: Photo): string {
  return cartItemId(photo.src, SIZE_OPTIONS[0].size, "No Frame", "", PAPER_FINISHES[0].name);
}

export default function PrintGrid({
  photos,
  className,
  linkToDetail = false,
  mockupsBySrc = {},
  enableCardCarousel = true,
}: {
  photos: Photo[];
  className?: string;
  /** When true, clicking a card's image goes to its detail page instead of opening the lightbox. */
  linkToDetail?: boolean;
  /** Extra images (room mockups) per photo, keyed by `photo.src`, shown as an in-card carousel. */
  mockupsBySrc?: Record<string, PhotoMockup[]>;
  /**
   * Set to false when `photos` renders inside a horizontally-scrolling row
   * (`className="print-grid--scroll"`) — the per-card swipe carousel competes
   * with the row's own horizontal touch-scroll for the same gesture. See the
   * comment on PrintCard's `swipeEnabled` prop for the full explanation.
   */
  enableCardCarousel?: boolean;
}) {
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

  function imagesFor(photo: Photo): PrintCardImage[] {
    const mockups = mockupsBySrc[photo.src] ?? [];
    return [
      { src: photo.src, width: photo.width, height: photo.height, alt: photo.alt },
      ...mockups.map((m) => ({ src: m.src, width: m.width, height: m.height, alt: m.alt })),
    ];
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
              <PrintCard
                photo={photo}
                images={imagesFor(photo)}
                linkToDetail={linkToDetail}
                swipeEnabled={enableCardCarousel}
                inCart={inCart}
                onAddToCart={() => handleAddToCart(photo)}
                onOpenLightbox={() => {
                  setLightboxIndex(index);
                  recordPhotoView(photo);
                }}
              />
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
