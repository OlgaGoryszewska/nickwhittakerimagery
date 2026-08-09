import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategorySlugs, getCategory } from "@/app/lib/categories";
import PrintGrid from "@/app/components/PrintGrid";
import Reveal from "@/app/components/Reveal";
import { BASE_URL } from "@/app/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};

  const title = `${category.label} — Nick Whittaker Imagery`;
  const firstPhoto = category.photos[0];

  return {
    title,
    description: category.description,
    alternates: { canonical: `/${category.slug}` },
    openGraph: {
      title,
      description: category.description,
      url: `${BASE_URL}/${category.slug}`,
      images: firstPhoto ? [`${BASE_URL}${firstPhoto.src}`] : undefined,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>{category.label}</h1>
          <p>{category.description}</p>
        </Reveal>

        <PrintGrid photos={category.photos} />
      </div>
    </section>
  );
}
