import type { Metadata } from "next";
import Link from "next/link";
import { JOURNAL_POSTS } from "@/app/lib/journal";
import Reveal from "@/app/components/Reveal";
import { BASE_URL, breadcrumbJsonLd } from "@/app/lib/seo";

const post = JOURNAL_POSTS.find((p) => p.slug === "staging-a-listing-with-ocean-photography")!;
const OG_IMAGE = `${BASE_URL}/Waves/nick-whittaker-ocean-photography-dreamy-sunset-horizon.jpg`;

export const metadata: Metadata = {
  title: `${post.title} — Nick Whittaker Imagery`,
  description: post.dek,
  alternates: { canonical: `/journal/${post.slug}` },
  openGraph: {
    title: post.title,
    description: post.dek,
    url: `${BASE_URL}/journal/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    images: [OG_IMAGE],
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", url: BASE_URL },
  { name: "Journal", url: `${BASE_URL}/journal` },
  { name: post.title, url: `${BASE_URL}/journal/${post.slug}` },
]);

export default function StagingPost() {
  return (
    <article className="tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="wrap journal-article">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/journal">Journal</Link>
          <span>/</span>
          <span>{post.title}</span>
        </nav>

        <Reveal className="journal-article__header">
          <Link href={post.segmentHref} className="journal-card__segment">
            {post.segment}
          </Link>
          <h1>{post.title}</h1>
          <p className="lede">{post.dek}</p>
          <div className="journal-card__meta">
            {new Date(post.date).toLocaleDateString("en-NZ", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {post.readTime}
          </div>
        </Reveal>

        <div className="journal-body">
          <p>
            A staged room sells a feeling before it sells a floor plan. Furniture does most of
            that work, but it&rsquo;s the wall art that finishes the sentence — it&rsquo;s the
            difference between a room that looks temporarily arranged and one that looks like
            somebody could actually live there. Art is also the fastest, cheapest lever a stager
            has: no delivery of a sofa, no styling day, just a print that arrives framed and
            ready to hang.
          </p>

          <h2>Why ocean and water photography stages well</h2>
          <p>
            Buyers aren&rsquo;t browsing a listing to see someone else&rsquo;s taste — they&rsquo;re
            trying to picture their own life in the space, and art that&rsquo;s too specific gets
            in the way of that. Water is about as close to universally appealing as photography
            gets: nobody is put off by the ocean. A calm horizon like{" "}
            <Link href="/waves/waves-study-04">Dreamy Sunset Horizon</Link>{" "}
            or a soft, textural piece like{" "}
            <Link href="/textures/textures-study-01">Amber Horizon Blur</Link>{" "}
            adds warmth and colour without competing with the furniture, the light fittings, or a
            buyer&rsquo;s own imagination.
          </p>

          <h2>Sizing to the room, not just the wall</h2>
          <p>
            A print that&rsquo;s slightly too small for its wall is one of the most common
            staging mistakes — it reads as an afterthought even when everything else in the room
            is right. As a rough guide: A3 suits a hallway or a small guest room, A2 works well
            above a console table or bed in a standard room, and A1 or A0 is usually what a
            living room feature wall actually needs once you stand back and look at it properly.
            Every print in the catalogue is available in all four sizes, so the same photograph
            can scale from a compact apartment to a full-sized lounge.
          </p>

          <h2>Reorder the same piece with confidence</h2>
          <p>
            Staging is repeat business by nature — the piece that worked for last month&rsquo;s
            listing is worth reaching for again rather than re-solving the same brief from
            scratch. Ordering the same print and size a second or third time removes the
            guesswork: you already know how it photographs for the listing photos, how it reads
            in the room, and how buyers respond to it.
          </p>

          <h2>Turnaround matters more than anything else</h2>
          <p>
            A listing going on the market this week doesn&rsquo;t have time for a six-week
            framing lead. Simple Framing — the print set straight against the glass, no mount
            board — is the fastest option in the catalogue at four to ten days, and it&rsquo;s
            usually the right call for staging: clean, contemporary, and quick enough to still
            matter. See the full range of options on the{" "}
            <Link href="/framing-information">framing information page</Link>.
          </p>
        </div>

        <Reveal className="journal-cta">
          <p>
            Nick Whittaker Imagery supports real estate and staging accounts with trade pricing,
            fast turnaround, and reorders on the same print and size, every time.
          </p>
          <Link href="/trade/real-estate" className="btn btn-primary">
            See real estate &amp; staging trade pricing
          </Link>
        </Reveal>
      </div>
    </article>
  );
}
