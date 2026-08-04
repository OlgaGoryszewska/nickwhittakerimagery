import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategorySlugs, getCategory } from "@/app/lib/categories";
import { SIZE_OPTIONS, TAGS, ROOM_PREVIEW_WIDTH, ROOM_PREVIEW_HEIGHT } from "@/app/lib/catalog";
import PrintGrid from "@/app/components/PrintGrid";

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
  const prev = category.photos[(index - 1 + category.photos.length) % category.photos.length];
  const next = category.photos[(index + 1) % category.photos.length];
  const related = category.photos.filter((p) => p.slug !== photoSlug).slice(0, 3);

  return { category, photo, prev, next, related };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; photo: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, photo: photoSlug } = await params;
  const result = await findPhoto(categorySlug, photoSlug);
  if (!result) return {};

  const { category, photo } = result;
  const description = `${photo.title} — ${photo.location}. ${category.description}`;

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

  const { category, photo, prev, next, related } = result;

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
              <div className="print-card__mat">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 860px) 100vw, 60vw"
                  priority
                />
              </div>
              <div className="detail-nav">
                <Link href={`/${category.slug}/${prev.slug}`}>‹ {prev.title}</Link>
                <Link href={`/${category.slug}/${next.slug}`}>{next.title} ›</Link>
              </div>
            </div>

            <div className="detail-info">
              <h1>{photo.title}</h1>
              <p className="print-card__location">{photo.location}</p>
              {photo.edition && <p className="print-card__edition">{photo.edition}</p>}

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

      <section className="tight border-t border-line">
        <div className="wrap">
          <div className="section-head">
            <h2>See It On Your Wall</h2>
            <p>A preview of {photo.title} framed and hung — actual scale varies by print size.</p>
          </div>
          <div className="detail-room-preview">
            <Image
              src={photo.roomPreview}
              alt={`${photo.title} framed on a wall`}
              width={ROOM_PREVIEW_WIDTH}
              height={ROOM_PREVIEW_HEIGHT}
              sizes="(max-width: 1080px) 100vw, 1080px"
            />
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
