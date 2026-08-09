import type { Metadata } from "next";
import Link from "next/link";
import { JOURNAL_POSTS } from "@/app/lib/journal";

const post = JOURNAL_POSTS.find((p) => p.slug === "choosing-art-for-a-hotel-rollout")!;

export const metadata: Metadata = {
  title: `${post.title} — Nick Whittaker Imagery`,
  description: post.dek,
  alternates: { canonical: `/journal/${post.slug}` },
};

export default function HotelRolloutPost() {
  return (
    <article className="tight">
      <div className="wrap journal-article">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/journal">Journal</Link>
          <span>/</span>
          <span>{post.title}</span>
        </nav>

        <div className="journal-article__header">
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
        </div>

        <div className="journal-body">
          <p>
            Nobody buys art for a hotel the way they buy it for a house. A homeowner picks one
            piece for one wall and lives with it for a decade. A hotel is buying for forty rooms,
            a lobby, a restaurant and a spa — often in three separate stages over eighteen
            months, with a design brief that has to survive contractors, budget revisions and at
            least one change of GM. The brief that works is rarely the boldest one. It&rsquo;s
            the one built to be repeated.
          </p>

          <h2>Start with a pilot floor, not the whole property</h2>
          <p>
            The single biggest risk in a hotel art programme isn&rsquo;t taste — it&rsquo;s
            committing to a full rollout before anyone has seen a piece framed, hung and lit in
            an actual guest room. A pilot floor of six to ten rooms tells you more than any mood
            board: how the framing reads under the room&rsquo;s actual lighting, whether the size
            you specified on paper still feels right against the headboard, how long fabrication
            really takes once framing is added. Suppliers who insist on a minimum order before
            they&rsquo;ll even discuss a project are asking you to skip that step. A print like{" "}
            <Link href="/waves/waves-study-05">Dynamic Spray Splash</Link>{" "}
            reads very differently at A2 in a corridor than at A0 behind a bed — that&rsquo;s
            worth confirming once, cheaply, before it&rsquo;s decided three hundred times.
          </p>

          <h2>Consistency without repetition</h2>
          <p>
            Guests notice when every room has the identical print — it reads as budget, not
            design. They also notice when nothing relates to anything else, which reads as
            unplanned. The middle path is a consistent palette and photographer across the
            property, with the actual image varying floor to floor or wing to wing. A moody
            teal-and-charcoal set — pieces like{" "}
            <Link href="/waves/waves-study-09">Misty Teal Barrel</Link>{" "}
            or{" "}
            <Link href="/reflections/reflections-study-03">Hazy Gold Horizon</Link>{" "}
            — can share a frame profile and mount colour without ever repeating the same
            photograph twice in the same corridor.
          </p>

          <h2>Framing decisions belong in the brief, not the punch list</h2>
          <p>
            Public-facing hospitality spaces take more wear than a private home — more light
            exposure, more cleaning, more contact. Simple Framing is fast and economical for
            back-of-house or short-stay refurbishments; Mat Framing holds up better in
            high-traffic corridors and reads more considered in a lobby. Decide this once, at the
            brief stage, alongside sizing and mount colour — see the full breakdown on our{" "}
            <Link href="/framing-information">framing information page</Link>{" "}
            — rather than leaving it to whoever signs the final PO.
          </p>

          <h2>Provenance is a procurement question, not an art one</h2>
          <p>
            Facilities and finance teams need to file something. Authentication, a condition
            report at time of delivery, and clear care guidance for cleaning staff should arrive
            with the artwork, not get chased down after the fact — the same way you&rsquo;d
            expect documentation with any other fitted asset.
          </p>

          <h2>What to ask a supplier before you commit</h2>
          <p>
            Four questions tend to separate a workable partner from a slow one: Is there a real
            minimum order, or will they support a pilot? Can they hold pricing across a phased
            rollout instead of re-quoting each stage? Will one invoice cover the whole programme,
            or is finance getting a new bill every time a floor ships? And who do you call when a
            piece arrives with a damaged frame two days before a soft opening?
          </p>
        </div>

        <div className="journal-cta">
          <p>
            Nick Whittaker Imagery works with hospitality projects on exactly this basis — no
            minimum order, phased pricing, and one contact for the whole programme.
          </p>
          <Link href="/trade/hospitality" className="btn btn-primary">
            See hospitality trade pricing
          </Link>
        </div>
      </div>
    </article>
  );
}
