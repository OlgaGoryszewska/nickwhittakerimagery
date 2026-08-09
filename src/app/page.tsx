import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPhotos } from "@/app/lib/categories";
import PrintGrid from "@/app/components/PrintGrid";
import GalleryBrowser from "@/app/components/GalleryBrowser";
import Reveal from "@/app/components/Reveal";
import { EVENTS } from "@/app/lib/events";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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
          <div className="eyebrow">Ocean &amp; Water Photography — New Zealand</div>
          <h1>
            Unique <em>light</em>.
          </h1>
          <p className="sub">
            Fine-art ocean and water photography, shot around New
            Zealand — available as fine-art prints, and open to commissions
            and collaborations.
          </p>
         
        </div>
      </header>

      <section className="tight">
        <div className="wrap">
          <Reveal className="section-head">
            <h2>Most Popular</h2>
            <p>The prints people come back for most — click a photo for a closer look.</p>
          </Reveal>
          <PrintGrid photos={mostPopular} />
        </div>
      </section>

      <section className="border-t border-line">
        <div className="wrap">
          <Reveal className="section-head">
            <h2>Explore the work</h2>
            <p>Six bodies of work, from abstract water studies to fine-art prints ready for the wall — filter to find what you&apos;re after.</p>
          </Reveal>
          <GalleryBrowser photos={allPhotos} limit={10} />
        </div>
      </section>

      <section id="upcoming-events" className="tight border-t border-line">
        <div className="wrap">
          <Reveal className="section-head">
            <h2>Upcoming Events</h2>
            <p>Exhibitions and print showings — where to see the work in person.</p>
          </Reveal>
          {EVENTS.map((event, index) => (
            <Reveal key={event.slug} className="event-card" delay={index * 80}>
              <Image src={event.image} alt={event.imageAlt} fill sizes="100vw" />
              <div className="event-card__overlay" />
              <div className="event-card__content">
                <div className="eyebrow">{event.eyebrow}</div>
                <h3>{event.title}</h3>
                <div className="event-date">
                  {event.dateRange} · {event.location}
                </div>
                <p>{event.description}</p>
                <Link href="/events" className="btn btn-outline-light">
                  Event Details
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="tight border-t border-line">
        <div className="wrap">
          <Reveal>
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
