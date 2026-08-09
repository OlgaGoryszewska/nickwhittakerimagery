import type { Metadata } from "next";
import { FRAMING_STYLES, FRAME_MOULDINGS } from "@/app/lib/framing";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";

const TITLE = "Framing Information — Nick Whittaker Imagery";
const DESCRIPTION =
  "Framing options for fine-art ocean and water photography prints — simple, mat, setback, float and canvas framing, plus available frame mouldings.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/framing-information" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/framing-information`,
    images: [`${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`],
  },
};

export default function FramingInformationPage() {
  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Framing Information</h1>
          <p>Every print can be framed to order — choose the style that best suits the piece.</p>
        </Reveal>

        <div className="framing-styles">
          {FRAMING_STYLES.map((style, index) => (
            <Reveal key={style.name} className="framing-style-card" delay={index * 80}>
              <h3>{style.name}</h3>
              <p className="framing-style-card__desc">{style.description}</p>
              <p className="framing-style-card__turnaround">Turnaround: {style.turnaround}</p>
              <ul className="print-card__sizes">
                {style.pricing.map((option) => (
                  <li key={option.size}>
                    <span className="print-card__size-name">{option.size}</span>
                    <span />
                    <span className="print-card__size-price">{option.price}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="section-head framing-section-head">
          <h2>Frame Mouldings</h2>
          <p>Each framing style is available in a choice of moulding profiles.</p>
        </Reveal>

        <div className="framing-mouldings">
          {FRAME_MOULDINGS.map((moulding, index) => (
            <Reveal key={moulding.name} className="framing-moulding-card" delay={index * 80}>
              <h3>{moulding.name}</h3>
              <p>{moulding.description}</p>
              <p className="framing-moulding-card__dims">{moulding.dimensions}</p>
            </Reveal>
          ))}
        </div>

        <p className="framing-note">
          Unframed, self-assembly frames are also available on request. Pricing shown is
          indicative — get in touch to enquire and confirm current rates for your print.
        </p>
      </div>
    </section>
  );
}
