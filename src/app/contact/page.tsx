import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";

const TITLE = "Contact — Nick Whittaker Imagery";
const DESCRIPTION =
  "Get in touch about prints, commissions, or collaborations with Nick Whittaker Imagery, ocean and water photography based in Auckland, New Zealand.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/contact`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`],
  },
};

export default function ContactPage() {
  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Contact</h1>
          <p>
            For prints, commissions, collaborations, or anything else — get in touch directly.
          </p>
        </Reveal>

        <Reveal className="contact-details">
          <div className="contact-detail">
            <div className="trade-subhead">Email</div>
            <a href="mailto:nickjwhittaker@gmail.com" className="contact-detail__value">
              nickjwhittaker@gmail.com
            </a>
          </div>
          <div className="contact-detail">
            <div className="trade-subhead">Phone</div>
            <a href="tel:+6421507507" className="contact-detail__value">
              +64 21 507 507
            </a>
          </div>
        </Reveal>

        <Reveal className="trade-cta" delay={100}>
          <div className="trade-cta__row">
            <a
              href={`mailto:nickjwhittaker@gmail.com?subject=${encodeURIComponent("General Enquiry")}`}
              className="btn btn-primary"
            >
              Send an Enquiry
            </a>
            <Link href="/trade" className="btn btn-outline">
              Trade &amp; Commercial Enquiries
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
