import type { Metadata } from "next";
import Image from "next/image";
import { EVENTS, getPastEvents, getUpcomingEvents } from "@/app/lib/events";
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
  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Upcoming Events</h1>
          <p>Exhibitions and print showings — where to see the work in person.</p>
        </Reveal>

        {upcomingEvents.length === 0 ? (
          <p className="lede">No upcoming events right now — check back soon.</p>
        ) : (
          <div className="events-list">
            {upcomingEvents.map((event, index) => (
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
                  <div className="event-card__actions">
                    <a
                      href={`mailto:order@nickwhittakerimagery.com?subject=${encodeURIComponent(
                        `RSVP — ${event.title}`
                      )}`}
                      className="btn btn-outline-light"
                    >
                      Enquire About This Event
                    </a>
                    {event.links?.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-light"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {pastEvents.length > 0 && (
          <>
            <Reveal className="section-head past-events-head">
              <h2>Previous Events</h2>
            </Reveal>

            <div className="past-events-list">
              {pastEvents.map((event, index) => (
                <Reveal key={event.slug} className="past-event-card" delay={index * 80}>
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(event)) }}
                  />
                  <div className="eyebrow">Past Exhibition</div>
                  <h3>{event.title}</h3>
                  <div className="event-date">
                    {event.dateRange} · {event.location}
                  </div>
                  <p>{event.description}</p>
                  {event.links && event.links.length > 0 && (
                    <div className="past-event-card__links">
                      {event.links.map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
