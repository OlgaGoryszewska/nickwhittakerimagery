import type { MetadataRoute } from "next";
import { getAllCategorySlugs, getCategory } from "@/app/lib/categories";

const BASE_URL = "https://www.nickwhittakerimagery.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await Promise.all(getAllCategorySlugs().map((slug) => getCategory(slug)));

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => category !== null)
    .map((category) => ({
      url: `${BASE_URL}/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const photoRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => category !== null)
    .flatMap((category) =>
      category.photos.map((photo) => ({
        url: `${BASE_URL}/${category.slug}/${photo.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    );

  return [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/gallery`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/trade`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/framing-information`, changeFrequency: "monthly", priority: 0.5 },
    ...categoryRoutes,
    ...photoRoutes,
  ];
}
