"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SHOW_ON_PATHS = new Set(["/", "/gallery"]);
const SCROLL_THRESHOLD = 600;

export default function ScrollToTopButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const eligible = SHOW_ON_PATHS.has(pathname || "");

  useEffect(() => {
    if (!eligible) {
      setVisible(false);
      return;
    }

    function handleScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [eligible]);

  if (!eligible || !visible) return null;

  return (
    <button
      type="button"
      className="scroll-top-btn"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
