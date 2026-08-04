"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SIZE_OPTIONS, type Photo } from "@/app/lib/catalog";
import Lightbox from "./Lightbox";

export default function PrintGrid({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
                alt={photo.title}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              />
            </button>
            <div className="print-card__info">
              {photo.edition && <span className="pill on print-card__edition">{photo.edition}</span>}
              <h3>{photo.title}</h3>
              <p className="print-card__location">{photo.location}</p>
              <ul className="print-card__sizes">
                {SIZE_OPTIONS.map((option) => (
                  <li key={option.size}>
                    <span className="print-card__size-name">{option.size}</span>
                    <span className="print-card__size-dims">{option.dimensions}</span>
                    <span className="print-card__size-price">{option.price}</span>
                  </li>
                ))}
              </ul>
              <Link href="/shop" className="btn btn-outline">
                Add to Cart
              </Link>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
