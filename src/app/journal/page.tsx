import type { Metadata } from "next";
import Link from "next/link";
import { JOURNAL_POSTS } from "@/app/lib/journal";
import { BASE_URL } from "@/app/lib/seo";

const TITLE = "Journal — Nick Whittaker Imagery";
const DESCRIPTION =
  "Notes on sourcing and specifying fine-art ocean and water photography for hospitality, real estate, and trade projects.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/journal" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/journal`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`],
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
}

export default function JournalPage() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head">
          <h1>Journal</h1>
          <p>Notes on sourcing and specifying fine-art prints for real projects — hospitality, staging and trade.</p>
        </div>

        <div className="journal-list">
          {JOURNAL_POSTS.map((post) => (
            <Link key={post.slug} href={`/journal/${post.slug}`} className="journal-card">
              <span className="journal-card__segment">{post.segment}</span>
              <h3>{post.title}</h3>
              <p>{post.dek}</p>
              <span className="journal-card__meta">
                {formatDate(post.date)} · {post.readTime}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
