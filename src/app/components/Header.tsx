"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartContext";

const NAV_ITEMS = [
  { label: "Gallery", href: "/gallery" },
  { label: "Framing Information", href: "/framing-information" },
  { label: "Biography", href: "/biography" },
  { label: "Contact", href: "/contact" },
  { label: "Shop", href: "/shop" },
  { label: "Events", href: "/events" },
  { label: "Trading", href: "/trading" },
  { label: "Interior Design", href: "/interior-design" },
  { label: "Interactive Room", href: "/interactive-room" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { totalCount } = useCart();

  return (
    <header className="site-header">
      <div className="wrap site-header__bar">
        <Link href="/" className="site-header__logo" onClick={() => setOpen(false)}>
          <Image
            src="/nick-logo.svg"
            alt="Nick Whittaker Imagery"
            width={440}
            height={159}
            priority
          />
        </Link>

        <div className="site-header__actions">
          <Link
            href="/cart"
            className="cart-toggle"
            aria-label={`View cart, ${totalCount} item${totalCount === 1 ? "" : "s"}`}
            onClick={() => setOpen(false)}
          >
            <svg
              width="20"
              height="20"
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
            {totalCount > 0 && <span className="cart-toggle__badge">{totalCount}</span>}
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-nav" aria-label="Primary">
          <div className="wrap">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
