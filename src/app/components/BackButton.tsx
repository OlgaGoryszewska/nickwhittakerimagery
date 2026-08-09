"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button type="button" className="back-arrow" onClick={() => router.back()}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="M11 6l-6 6 6 6" />
      </svg>
      Back
    </button>
  );
}
