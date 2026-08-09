import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/app/lib/seo";

const TITLE = "Biography — Nick Whittaker Imagery";
const DESCRIPTION =
  "Nick Whittaker is an ocean and water photographer based in Auckland, New Zealand, working primarily around Whangamata.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/biography" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/biography`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`],
  },
};

export default function BiographyPage() {
  return (
    <section className="tight">
      <div className="wrap journal-article">
        <div className="section-head">
          <h1>Biography</h1>
        </div>

        <div className="journal-body">
          <p>
            Nick Whittaker is an ocean and water photographer based in Auckland, New Zealand,
            working primarily around Whangamata. His work holds still what the sea rarely offers
            twice — light, tide, and timing, caught in a single frame and printed as fine art.
          </p>

          <p>
            The water is the constant subject, but rarely the same water twice. A morning tide
            can read as glass one day and as motion-blurred abstraction the next, depending on
            wind, light, and how close the camera sits to the surface. That range is why the
            catalogue is organised into distinct bodies of work rather than one continuous
            series — Abstracts, Fine Art, Reflections, Textures, and Waves each look at the same
            coastline from a different distance and a different temperament.
          </p>

          <p>
            Prints are made available across sizes from A3 through A0, framed to order, and the
            work is open to commissions, collaborations, and trade projects — from a single print
            for a home to a full programme for a hospitality or commercial space. Nick&rsquo;s
            work will next be shown in person at an exhibition in Paris; see{" "}
            <Link href="/events">upcoming events</Link> for details.
          </p>
        </div>

        <div className="trade-links">
          <Link href="/gallery" className="btn-link">
            Browse the full catalogue
          </Link>
          <Link href="/trade" className="btn-link">
            Trade &amp; commercial enquiries
          </Link>
        </div>
      </div>
    </section>
  );
}
