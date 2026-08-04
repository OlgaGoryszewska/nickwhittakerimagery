import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  { label: "Abstracts", href: "/abstracts", image: "/Abstracts/spark.jpg" },
  { label: "Fine Art", href: "/fine-art", image: "/Fine%20Art/DSC01961.jpg" },
  { label: "Reflections", href: "/reflections", image: "/Reflections/_NZP3268.jpg" },
  { label: "Textures", href: "/textures", image: "/Textures/DSC05392.jpg" },
  { label: "Waves", href: "/waves", image: "/Waves/lines2.jpg" },
];

export default function Home() {
  return (
    <>
      <header className="hero">
        <Image src="/Waves/_NZP1305.jpg" alt="" fill priority className="hero-bg" />
        <div className="hero-overlay" />
        <div className="wrap">
          <div className="eyebrow">Ocean &amp; Water Photography — Auckland, NZ</div>
          <h1>
            Deep water, held in <em>light</em>.
          </h1>
          <p className="sub">
            Fine-art ocean and water photography, shot around Auckland, New
            Zealand — available as limited-edition prints, and open to
            commissions and collaborations.
          </p>
          <div className="tag-row mt-10">
            <Link href="/contact" className="btn btn-primary">
              Enquire about a print
            </Link>
            <Link href="/fine-art" className="btn btn-outline-light">
              View the gallery
            </Link>
          </div>
          <div className="meta">
            <div>
              Location
              <strong>Auckland, NZ</strong>
            </div>
            <div>
              Focus
              <strong>Ocean &amp; Water</strong>
            </div>
            <div>
              Prints
              <strong>Limited Edition</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="tight">
        <div className="wrap">
          <div className="eyebrow">About</div>
          <p className="lede">
            Nick Whittaker is an ocean and water photographer based in
            Auckland, New Zealand. His work holds still what the sea rarely
            offers twice — light, tide, and timing, caught in a single frame
            and printed as fine art.
          </p>
          <Link href="/biography" className="btn btn-link mt-5 inline-block">
            Read the story →
          </Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="wrap">
          <div className="section-head">
            <h2>Explore the work</h2>
            <p>Five bodies of work, from abstract water studies to fine-art prints ready for the wall.</p>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((category) => (
              <Link key={category.href} href={category.href} className="category-tile">
                <Image
                  src={category.image}
                  alt={category.label}
                  fill
                  sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                />
                <span className="tile-label">{category.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
