import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategorySlugs, getCategory, getPhotoMockups } from "@/app/lib/categories";
import { SIZE_OPTIONS } from "@/app/lib/catalog";
import PrintGrid from "@/app/components/PrintGrid";
import DetailGallery from "@/app/components/DetailGallery";
import PhotoPurchasePanel from "@/app/components/PhotoPurchasePanel";
import BackButton from "@/app/components/BackButton";
import { BASE_URL, breadcrumbJsonLd } from "@/app/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await Promise.all(getAllCategorySlugs().map((slug) => getCategory(slug)));
  return categories.flatMap(
    (category) =>
      category?.photos.map((photo) => ({ category: category.slug, photo: photo.slug })) ?? []
  );
}

async function findPhoto(categorySlug: string, photoSlug: string) {
  const category = await getCategory(categorySlug);
  if (!category) return null;
  const index = category.photos.findIndex((p) => p.slug === photoSlug);
  if (index === -1) return null;

  const photo = category.photos[index];
  const related = category.photos.filter((p) => p.slug !== photoSlug).slice(0, 3);

  return { category, photo, related };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; photo: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, photo: photoSlug } = await params;
  const result = await findPhoto(categorySlug, photoSlug);
  if (!result) return {};

  const { photo } = result;
  const description = photo.alt;

  return {
    title: `${photo.title} — Nick Whittaker Imagery`,
    description,
    alternates: { canonical: `/${categorySlug}/${photoSlug}` },
    openGraph: {
      title: photo.title,
      description,
      images: [{ url: photo.src, width: photo.width, height: photo.height }],
    },
  };
}

function productJsonLd(photo: { title: string; alt: string; src: string }) {
  const prices = SIZE_OPTIONS.map((option) => parseFloat(option.price.replace(/[^0-9.]/g, "")));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: photo.title,
    description: photo.alt,
    image: `${BASE_URL}${photo.src}`,
    brand: { "@type": "Brand", name: "Nick Whittaker Imagery" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "NZD",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: SIZE_OPTIONS.length,
      availability: "https://schema.org/InStock",
    },
  };
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ category: string; photo: string }>;
}) {
  const { category: categorySlug, photo: photoSlug } = await params;
  const result = await findPhoto(categorySlug, photoSlug);
  if (!result) notFound();

  const { category, photo, related } = result;

  const mockups = await getPhotoMockups(photo);
  const galleryImages = [
    { src: photo.src, width: photo.width, height: photo.height, label: "Original", alt: photo.alt },
    ...mockups.map((m) => ({ src: m.src, width: m.width, height: m.height, label: m.label, alt: m.alt })),
  ];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: BASE_URL },
    { name: category.label, url: `${BASE_URL}/${category.slug}` },
    { name: photo.title, url: `${BASE_URL}/${category.slug}/${photo.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(photo)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <section className="tight">
        <div className="wrap">
          <BackButton />

          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href={`/${category.slug}`}>{category.label}</Link>
            <span>/</span>
            <span>{photo.title}</span>
          </nav>

          <div className="detail-layout">
            <div className="detail-media">
              <DetailGallery images={galleryImages} title={photo.title} />
            </div>

            <div className="detail-info">
              <h1>{photo.title}</h1>
              <p className="print-card__location">{photo.location}</p>

              <p className="lede">{category.description}</p>

              <PhotoPurchasePanel photo={photo} />

              <Link href="/framing-information" className="btn-link detail-framing-link">
                More on framing options &amp; other styles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line">
          <div className="wrap">
            <div className="section-head">
              <h2>More from {category.label}</h2>
              <p>{category.description}</p>
            </div>
            <PrintGrid photos={related} />
          </div>
        </section>
      )}
    </>
  );
}
