import type { Metadata } from "next";
import Image from "next/image";
import { EVENTS } from "@/app/lib/events";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";

const TITLE = "Upcoming Events — Nick Whittaker Imagery";
const DESCRIPTION =
  "Exhibitions and print showings — where to see Nick Whittaker's fine-art ocean and water photography in person.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/events" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/events`,
    images: EVENTS[0] ? [`${BASE_URL}${EVENTS[0].image}`] : undefined,
  },
};

function eventJsonLd(event: (typeof EVENTS)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      "@type": "Place",
      name: event.location,
    },
    description: event.description,
    image: `${BASE_URL}${event.image}`,
    organizer: {
      "@type": "Organization",
      name: "Nick Whittaker Imagery",
      url: BASE_URL,
    },
  };
}

export default function EventsPage() {
  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Upcoming Events</h1>
          <p>Exhibitions and print showings — where to see the work in person.</p>
        </Reveal>

        {EVENTS.length === 0 ? (
          <p className="lede">No upcoming events right now — check back soon.</p>
        ) : (
          <div className="events-list">
            {EVENTS.map((event, index) => (
              <Reveal key={event.slug} className="event-card event-card--full" delay={index * 100}>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(event)) }}
                />
                <Image src={event.image} alt={event.imageAlt} fill sizes="100vw" />
                <div className="event-card__overlay" />
                <div className="event-card__content">
                  <div className="eyebrow">{event.eyebrow}</div>
                  <h2>{event.title}</h2>
                  <div className="event-date">
                    {event.dateRange} · {event.location}
                  </div>
                  <p>{event.description}</p>
                  <a
                    href={`mailto:nickjwhittaker@gmail.com?subject=${encodeURIComponent(
                      `RSVP — ${event.title}`
                    )}`}
                    className="btn btn-outline-light"
                  >
                    Enquire About This Event
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
