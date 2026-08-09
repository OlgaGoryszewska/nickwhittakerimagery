import type { Metadata } from "next";
import Link from "next/link";
import { JOURNAL_POSTS } from "@/app/lib/journal";

export const metadata: Metadata = {
  title: "Journal — Nick Whittaker Imagery",
  description:
    "Notes on sourcing and specifying fine-art ocean and water photography for hospitality, real estate, and trade projects.",
  alternates: { canonical: "/journal" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
}

export default function JournalPage() {
  return (
    <section className="tight">
      <div className="wrap">
        <div className="section-head">
          <h2>Journal</h2>
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
