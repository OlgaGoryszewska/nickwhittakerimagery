"use client";

import { useState } from "react";
import { SIZE_OPTIONS, parsePrice, type Photo } from "@/app/lib/catalog";
import { FRAME_COLORS, NO_FRAME, PAPER_FINISHES, PURCHASABLE_FRAMING_STYLES } from "@/app/lib/framing";
import { cartItemId, useCart } from "./CartContext";

export default function PhotoPurchasePanel({ photo }: { photo: Photo }) {
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[0].size);
  const [selectedPaper, setSelectedPaper] = useState(PAPER_FINISHES[0].name);
  const [selectedFraming, setSelectedFraming] = useState(NO_FRAME);
  const [selectedColor, setSelectedColor] = useState(FRAME_COLORS[0].name);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const sizeOption = SIZE_OPTIONS.find((o) => o.size === selectedSize) ?? SIZE_OPTIONS[0];
  const paperOption = PAPER_FINISHES.find((p) => p.name === selectedPaper) ?? PAPER_FINISHES[0];
  const framingStyle = PURCHASABLE_FRAMING_STYLES.find((f) => f.name === selectedFraming);
  const framingPrice = framingStyle?.pricing.find((p) => p.size === selectedSize)?.price;
  const isFramed = selectedFraming !== NO_FRAME;

  const baseValue = parsePrice(sizeOption.price);
  const framingValue = framingPrice ? parsePrice(framingPrice) : 0;
  const totalValue = baseValue + framingValue;

  function handleAddToCart() {
    addItem({
      id: cartItemId(photo.src, sizeOption.size, selectedFraming, isFramed ? selectedColor : "", selectedPaper),
      photoSrc: photo.src,
      title: photo.title,
      location: photo.location,
      categorySlug: photo.categorySlug,
      photoSlug: photo.slug,
      size: sizeOption.size,
      dimensions: sizeOption.dimensions,
      framing: selectedFraming,
      frameColor: isFramed ? selectedColor : undefined,
      paper: selectedPaper,
      price: `$${totalValue} NZD`,
      priceValue: totalValue,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="purchase-panel">
      <div className="purchase-field">
        <span className="purchase-field__label">Size</span>
        <div className="option-row" role="radiogroup" aria-label="Print size">
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option.size}
              type="button"
              role="radio"
              aria-checked={option.size === selectedSize}
              className={`option-pill${option.size === selectedSize ? " is-selected" : ""}`}
              onClick={() => setSelectedSize(option.size)}
            >
              <span className="option-pill__name">{option.size}</span>
              <span className="option-pill__meta">{option.dimensions}</span>
              <span className="option-pill__price">{option.price}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="purchase-field">
        <span className="purchase-field__label">Paper — {selectedPaper}</span>
        <div className="option-row" role="radiogroup" aria-label="Paper finish">
          {PAPER_FINISHES.map((paper, i) => (
            <button
              key={paper.name}
              type="button"
              role="radio"
              aria-checked={selectedPaper === paper.name}
              className={`option-pill${selectedPaper === paper.name ? " is-selected" : ""}`}
              onClick={() => setSelectedPaper(paper.name)}
            >
              <span className="option-pill__name">{paper.name}</span>
              {i === 0 && <span className="option-pill__badge">Artist&apos;s Choice</span>}
            </button>
          ))}
        </div>
        <p className="note">{paperOption.description}</p>
      </div>

      <div className="purchase-field">
        <span className="purchase-field__label">Framing</span>
        <div className="option-row" role="radiogroup" aria-label="Framing option">
          <button
            type="button"
            role="radio"
            aria-checked={selectedFraming === NO_FRAME}
            className={`option-pill${selectedFraming === NO_FRAME ? " is-selected" : ""}`}
            onClick={() => setSelectedFraming(NO_FRAME)}
          >
            <span className="option-pill__name">No Frame</span>
            <span className="option-pill__meta">Print only</span>
          </button>
          {PURCHASABLE_FRAMING_STYLES.map((style) => {
            const priceForSize = style.pricing.find((p) => p.size === selectedSize)?.price;
            return (
              <button
                key={style.name}
                type="button"
                role="radio"
                aria-checked={selectedFraming === style.name}
                className={`option-pill${selectedFraming === style.name ? " is-selected" : ""}`}
                onClick={() => setSelectedFraming(style.name)}
              >
                <span className="option-pill__name">{style.name}</span>
                <span className="option-pill__meta">{style.turnaround}</span>
                {priceForSize && <span className="option-pill__price">+{priceForSize}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {isFramed && (
        <div className="purchase-field">
          <span className="purchase-field__label">Frame Colour — {selectedColor}</span>
          <div className="color-row" role="radiogroup" aria-label="Frame colour">
            {FRAME_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                role="radio"
                aria-checked={selectedColor === color.name}
                className={`color-swatch${selectedColor === color.name ? " is-selected" : ""}`}
                style={{ backgroundColor: color.swatch }}
                onClick={() => setSelectedColor(color.name)}
                aria-label={color.name}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      <div className="purchase-total">
        <span>Total</span>
        <span>${totalValue} NZD</span>
      </div>

      <button type="button" className="btn btn-primary detail-cta" onClick={handleAddToCart}>
        {added ? "Added to Cart" : "Add to Cart"}
      </button>
    </div>
  );
}
