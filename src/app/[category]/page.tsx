import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategorySlugs, getCategory } from "@/app/lib/categories";
import PrintGrid from "@/app/components/PrintGrid";

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

  return {
    title: `${category.label} — Nick Whittaker Imagery`,
    description: category.description,
    alternates: { canonical: `/${category.slug}` },
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
        <div className="section-head">
          <h2>{category.label}</h2>
          <p>{category.description}</p>
        </div>

        <PrintGrid photos={category.photos} />
      </div>
    </section>
  );
}
