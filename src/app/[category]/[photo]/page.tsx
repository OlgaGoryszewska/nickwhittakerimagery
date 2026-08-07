import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategorySlugs, getCategory, getPhotoMockups } from "@/app/lib/categories";
import { SIZE_OPTIONS, TAGS } from "@/app/lib/catalog";
import PrintGrid from "@/app/components/PrintGrid";
import DetailGallery from "@/app/components/DetailGallery";

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
    openGraph: {
      title: photo.title,
      description,
      images: [{ url: photo.src, width: photo.width, height: photo.height }],
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

  return (
    <>
      <section className="tight">
        <div className="wrap">
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

              <div className="tag-row detail-tags">
                {photo.tags.map((tagSlug) => {
                  const tag = TAGS.find((t) => t.slug === tagSlug);
                  if (!tag) return null;
                  return (
                    <Link key={tagSlug} href={`/gallery?tag=${tagSlug}`} className="pill">
                      {tag.label}
                    </Link>
                  );
                })}
              </div>

              <p className="lede">{category.description}</p>

              <ul className="print-card__sizes detail-sizes">
                {SIZE_OPTIONS.map((option) => (
                  <li key={option.size}>
                    <span className="print-card__size-name">{option.size}</span>
                    <span className="print-card__size-dims">{option.dimensions}</span>
                    <span className="print-card__size-price">{option.price}</span>
                  </li>
                ))}
              </ul>

              <Link href="/shop" className="btn btn-primary detail-cta">
                Add to Cart
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
