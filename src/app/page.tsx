import Image from "next/image";
import Link from "next/link";
import { getAllPhotos } from "@/app/lib/categories";
import PrintGrid from "@/app/components/PrintGrid";
import GalleryBrowser from "@/app/components/GalleryBrowser";

export default async function Home() {
  const allPhotos = await getAllPhotos();
  const mostPopular = allPhotos.filter((photo) => photo.tags.includes("most-popular"));

  return (
    <>
      <header className="hero">
        <Image
          src="/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg"
          alt=""
          fill
          priority
          className="hero-bg"
        />
        <div className="hero-overlay" />
        <div className="wrap">
          <div className="eyebrow">Ocean &amp; Water Photography — Auckland, NZ</div>
          <h1>
            Deep water, held in <em>light</em>.
          </h1>
          <p className="sub">
            Fine-art ocean and water photography, shot around Auckland, New
            Zealand — available as fine-art prints, and open to commissions
            and collaborations.
          </p>
          <div className="tag-row mt-10">
            <Link href="#upcoming-events" className="btn btn-primary">
              See Upcoming Events
            </Link>
            <Link href="/gallery" className="btn btn-outline-light">
              View gallery
            </Link>
          </div>
        </div>
      </header>

      <section className="tight">
        <div className="wrap">
          <div className="section-head">
            <h2>Most Popular</h2>
            <p>The prints people come back for most — click a photo for a closer look.</p>
          </div>
          <PrintGrid photos={mostPopular} />
        </div>
      </section>

      <section className="border-t border-line">
        <div className="wrap">
          <div className="section-head">
            <h2>Explore the work</h2>
            <p>Six bodies of work, from abstract water studies to fine-art prints ready for the wall — filter to find what you&apos;re after.</p>
          </div>
          <GalleryBrowser photos={allPhotos} limit={10} />
        </div>
      </section>

      <section id="upcoming-events" className="tight border-t border-line">
        <div className="wrap">
          <div className="section-head">
            <h2>Upcoming Events</h2>
            <p>Exhibitions and print showings — where to see the work in person.</p>
          </div>
          <div className="event-card">
            <Image
              src="/Fine%20Art/nick-whittaker-ocean-photography-fisherman-light-trail.jpg"
              alt="Ocean & Water exhibition, Paris"
              fill
              sizes="100vw"
            />
            <div className="event-card__overlay" />
            <div className="event-card__content">
              <div className="eyebrow">Upcoming Exhibition</div>
              <h3>Ocean &amp; Water — Paris</h3>
              <div className="event-date">23–26 November · Paris, France</div>
              <p>
                A four-day gallery exhibition of fine-art ocean and water
                photography, showing a curated selection of prints in
                central Paris.
              </p>
              <Link href="/events" className="btn btn-outline-light">
                Event Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="tight border-t border-line">
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
    </>
  );
}
