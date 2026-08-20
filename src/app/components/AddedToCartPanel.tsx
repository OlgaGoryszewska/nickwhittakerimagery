"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { SIZE_OPTIONS, parsePrice, type Photo } from "@/app/lib/catalog";
import { PAPER_FINISHES } from "@/app/lib/framing";
import { cartItemId, useCart } from "./CartContext";
import { useRecentlyViewed } from "./RecentlyViewed";

const MAX_RECOMMENDATIONS = 10;

function defaultCartId(photo: Photo): string {
  return cartItemId(photo.src, SIZE_OPTIONS[0].size, "No Frame", "", PAPER_FINISHES[0].name);
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12.5 10 17 19 7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function AddedToCartPanel({
  photo,
  size,
  price,
  fallbackPhotos,
  onClose,
}: {
  photo: Photo;
  size: string;
  price: string;
  fallbackPhotos: Photo[];
  onClose: () => void;
}) {
  const { items, addItem } = useCart();
  const recentlyViewed = useRecentlyViewed();

  const recommendations = useMemo(() => {
    const seen = new Set([photo.src]);
    const list: Photo[] = [];
    for (const p of [...recentlyViewed, ...fallbackPhotos]) {
      if (seen.has(p.src)) continue;
      seen.add(p.src);
      list.push(p);
      if (list.length >= MAX_RECOMMENDATIONS) break;
    }
    return list;
  }, [recentlyViewed, fallbackPhotos, photo.src]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  function handleQuickAdd(p: Photo) {
    const quickSize = SIZE_OPTIONS[0];
    const paper = PAPER_FINISHES[0].name;
    addItem({
      id: cartItemId(p.src, quickSize.size, "No Frame", "", paper),
      photoSrc: p.src,
      title: p.title,
      location: p.location,
      categorySlug: p.categorySlug,
      photoSlug: p.slug,
      size: quickSize.size,
      dimensions: quickSize.dimensions,
      framing: "No Frame",
      paper,
      price: quickSize.price,
      priceValue: parsePrice(quickSize.price),
    });
  }

  return createPortal(
    <div
      className="added-panel-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Added to cart"
      onClick={onClose}
    >
      <div className="added-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="added-panel__close" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <div className="added-panel__added">
          <div className="added-panel__added-thumb">
            <Image src={photo.src} alt={photo.alt} width={80} height={80} sizes="80px" />
          </div>
          <div className="added-panel__added-info">
            <span className="added-panel__check">
              <CheckIcon /> Added to your cart
            </span>
            <h3>{photo.title}</h3>
            <p>
              {size} · {price}
            </p>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="added-panel__recs">
            <div className="eyebrow added-panel__recs-label">From what you&apos;ve been browsing</div>
            <div className="added-panel__scroll">
              {recommendations.map((p) => {
                const inCart = items.some((i) => i.id === defaultCartId(p));
                return (
                  <div key={p.src} className="added-panel__item">
                    <Link
                      href={`/${p.categorySlug}/${p.slug}`}
                      className="added-panel__item-thumb"
                      onClick={onClose}
                    >
                      <Image src={p.src} alt={p.alt} width={118} height={118} sizes="118px" />
                    </Link>
                    <p className="added-panel__item-title">{p.title}</p>
                    <div className="added-panel__item-row">
                      <span>From {SIZE_OPTIONS[0].price}</span>
                      <button
                        type="button"
                        className={`added-panel__item-add${inCart ? " is-in-cart" : ""}`}
                        aria-label={
                          inCart
                            ? `${p.title} (${SIZE_OPTIONS[0].size}) is in your cart — add another`
                            : `Add ${p.title} (${SIZE_OPTIONS[0].size}) to cart`
                        }
                        onClick={() => handleQuickAdd(p)}
                      >
                        {inCart ? <CheckIcon /> : <PlusIcon />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="added-panel__actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Keep Browsing
          </button>
          <Link href="/cart" className="btn btn-primary">
            Go to Cart →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
