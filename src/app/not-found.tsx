import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found — Nick Whittaker Imagery",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="tight">
      <div className="wrap not-found">
        <div className="eyebrow">404</div>
        <h1>This page has drifted off.</h1>
        <p className="lede">
          The page you&rsquo;re looking for doesn&rsquo;t exist — it may have moved, or the link
          may be out of date.
        </p>
        <div className="tag-row mt-10">
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link href="/gallery" className="btn btn-outline">
            Browse the Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
