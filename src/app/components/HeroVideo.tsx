"use client";

import { useEffect, useRef } from "react";

export default function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    // Autoplay is driven from here rather than the `autoplay` attribute so
    // playback never starts at all for anyone who has asked their OS for
    // reduced motion — the poster frame stays put as the fallback.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function sync() {
      if (!video) return;
      if (reducedMotion.matches) {
        video.pause();
      } else {
        video.play().catch(() => {
          // Autoplay can still be blocked in rare cases — the poster image
          // stays visible as a graceful fallback.
        });
      }
    }

    sync();
    reducedMotion.addEventListener("change", sync);
    return () => reducedMotion.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={videoRef}
      className="hero-bg"
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
