import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";

const TITLE = "Biography — Nick Whittaker Imagery";
const DESCRIPTION =
  "Nick Whittaker is an ocean and water photographer based in Auckland, New Zealand, working primarily around Whangamata.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/biography" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/biography`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`],
  },
};

export default function BiographyPage() {
  return (
    <section className="tight">
      <div className="wrap journal-article">
        <Reveal className="section-head">
          <h1>Biography</h1>
        </Reveal>

        <Reveal className="journal-article__portrait">
          <Image
            src="/nick-whittaker-biography.jpg"
            alt="Nick Whittaker photographed in Whangamata, New Zealand"
            width={720}
            height={960}
            className="journal-article__portrait-img"
            priority
          />
          <span className="journal-article__portrait-caption">Whangamata, New Zealand</span>
        </Reveal>

        <div className="journal-body">
          <p>
           Nick Whittaker is a contemporary fine art photographer based in Tāmaki Makaurau (Auckland), Aotearoa New Zealand. Specialising in limited-edition ocean wave photography and coastal art prints, Nick captures a fresh perspective on the marine environment by masterfully experimenting with water, light, and vibrant color. His abstract surf and seascape photography actively challenges visual perceptions, transforming the ocean into modern wall decor. Deeply connected to his roots in Whangamata and Ōtautahi (Christchurch), he frequently documents the dynamic surf and beaches across the Coromandel peninsula and Auckland region.
          </p>

          <p>
            Nick&rsquo;s work has been featured in numerous exhibitions, including the prestigious Paris Photo Fair, and has been published in leading photography magazines. His photographs are held in private collections worldwide, and he is recognized for his innovative approach to capturing the essence of the ocean. Through his lens, Nick invites viewers to experience the beauty and power of the sea, making his work a sought-after addition to any art collection.
          </p>

          <p>
            Prints are made available across sizes from A3 through A0, framed to order, and the
            work is open to commissions, collaborations, and trade projects — from a single print
            for a home to a full programme for a hospitality or commercial space. Nick&rsquo;s
            work will next be shown in person at an exhibition in Paris; see{" "}
            <Link href="/events">upcoming events</Link> for details.
          </p>
        </div>

        <Reveal className="trade-links">
          <Link href="/gallery" className="btn-link">
            Browse the full catalogue
          </Link>
          <Link href="/trade" className="btn-link">
            Trade &amp; commercial enquiries
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
