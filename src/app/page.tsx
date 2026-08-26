import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPhotos, getPhotoMockups } from "@/app/lib/categories";
import PrintGrid from "@/app/components/PrintGrid";
import GalleryBrowser from "@/app/components/GalleryBrowser";
import HeroVideo from "@/app/components/HeroVideo";
import Reveal from "@/app/components/Reveal";
import { getUpcomingEvents } from "@/app/lib/events";
import { groupPhotosByRoom } from "@/app/lib/rooms";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const allPhotos = await getAllPhotos();
  const mostPopular = allPhotos.filter((photo) => photo.tags.includes("most-popular"));
  const upcomingEvents = getUpcomingEvents();

  // Room-mockup images per photo, keyed by src — shown as an in-card carousel
  // on the home page's print grids (see PrintCard) instead of just the
  // single canonical shot.
  const mockupLists = await Promise.all(allPhotos.map((photo) => getPhotoMockups(photo)));
  const mockupsBySrc = Object.fromEntries(allPhotos.map((photo, i) => [photo.src, mockupLists[i]]));
  const roomGroups = groupPhotosByRoom(allPhotos, mockupsBySrc);

  return (
    <>
      <header className="hero">
        <HeroVideo
          src="/hero-video.MP4"
          poster="/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg"
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
          <Reveal className="section-head home-section-head">
            <h2>Explore the work</h2>
            <p>Six bodies of work, from abstract water studies to fine-art prints ready for the wall — filter to find what you&apos;re after.</p>
          </Reveal>
          <GalleryBrowser photos={allPhotos} linkToDetail mockupsBySrc={mockupsBySrc} />
        </div>
      </section>

      <section className="tight border-t border-line">
        <div className="wrap">
          <Reveal className="section-head home-section-head">
            <h2>Most Popular</h2>
            <p>The prints people come back for most — click through for sizes, framing and pricing.</p>
          </Reveal>
          <PrintGrid
            photos={mostPopular}
            className="print-grid--scroll"
            linkToDetail
            enableCardCarousel={false}
          />
        </div>
      </section>

      <section className="tight border-t border-line">
        <div className="wrap">
          <Reveal className="section-head home-section-head">
            <h2>Shop by Room</h2>
            <p>See a print styled where it&apos;ll actually hang — pick the room you&apos;re decorating.</p>
          </Reveal>
          <div className="room-tiles">
            {roomGroups.map((group, index) => (
              <Reveal key={group.room.slug} delay={index * 100}>
                <Link href={`/shop-by-room/${group.room.slug}`} className="event-card room-tile">
                  <Image
                    src={group.hero.mockup.src}
                    alt={`${group.hero.photo.title} styled in a ${group.room.label.toLowerCase()}`}
                    fill
                    sizes="(max-width: 700px) 100vw, 50vw"
                  />
                  <div className="event-card__overlay" />
                  <div className="event-card__content">
                    <h3>{group.room.label}</h3>
                    <span className="room-tile__cta">Shop prints →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="tight border-t border-line">
        <div className="wrap">
          <Reveal className="card-feature">
            <div className="eyebrow">Trade Program</div>
            <h3>Trade pricing that scales with your project.</h3>
            <p>
              From a single room to a full rollout — interior designers, stagers,
              hospitality and commercial teams order at trade rates, framed to order,
              on one consolidated invoice.
            </p>
            <Link href="/trade" className="link">
              See trade pricing →
            </Link>
          </Reveal>
        </div>
      </section>

      <section id="upcoming-events" className="tight border-t border-line">
        <div className="wrap">
          <Reveal className="section-head home-section-head">
            <h2>Upcoming Events</h2>
            <p>Exhibitions and print showings — where to see the work in person.</p>
          </Reveal>
          {upcomingEvents.map((event, index) => (
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
          <Reveal className="home-about">
            <div className="home-about__media">
              <Image
                src="/nick-whittaker-biography.jpg"
                alt="Nick Whittaker, ocean and water photographer"
                width={480}
                height={640}
                className="home-about__portrait"
              />
            </div>
            <div className="home-about__content">
              <div className="eyebrow">About</div>
              <p className="lede home-about__lede">
                Nick Whittaker is an ocean and water photographer based in
                Auckland, New Zealand. His work holds still what the sea rarely
                offers twice — light, tide, and timing, caught in a single frame
                and printed as fine art.
              </p>
              <Link href="/biography" className="btn btn-link mt-5 inline-block">
                Read the story →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
