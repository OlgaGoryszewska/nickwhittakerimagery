"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Gallery", href: "/gallery" },
  { label: "Abstracts", href: "/abstracts" },
  { label: "Fine Art", href: "/fine-art" },
  { label: "Reflections", href: "/reflections" },
  { label: "Textures", href: "/textures" },
  { label: "Waves", href: "/waves" },
  { label: "Limited Edition", href: "/limited-edition" },
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
