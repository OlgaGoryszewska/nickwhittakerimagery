import { readdir } from "fs/promises";
import path from "path";
import { imageSizeFromFile } from "image-size/fromFile";
import type { Photo, Category } from "@/app/lib/catalog";

export type { Photo, Category } from "@/app/lib/catalog";
export { TAGS, SIZE_OPTIONS } from "@/app/lib/catalog";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

const CATEGORY_DEFS: { slug: string; dir: string; label: string; description: string; tag?: string }[] = [
  {
    slug: "abstracts",
    dir: "Abstracts",
    label: "Abstracts",
    description:
      "Water stripped of context — colour, motion and light studied close, where the sea reads more like paint than place.",
    tag: "abstract",
  },
  {
    slug: "fine-art",
    dir: "Fine Art",
    label: "Fine Art",
    description:
      "The gallery selection — considered compositions printed for the wall, chosen for stillness as much as subject.",
    tag: "fine-art",
  },
  {
    slug: "reflections",
    dir: "Reflections",
    label: "Reflections",
    description:
      "The surface as mirror — sky, light and shore held for a moment in moving water.",
  },
  {
    slug: "textures",
    dir: "Textures",
    label: "Textures",
    description:
      "Close studies of water's surface — the fine grain of tide and wind, caught before it moves on.",
  },
  {
    slug: "waves",
    dir: "Waves",
    label: "Waves",
    description:
      "The ocean at work — breaking, folding and holding its shape for the length of a single frame.",
    tag: "wave",
  },
];

// A curated selection, not a photo folder — one flagship image pulled from each
// body of work and offered as a restricted print run.
const LIMITED_EDITION_SLUG = "limited-edition";
const LIMITED_EDITION_LABEL = "Limited Edition";
const LIMITED_EDITION_DESCRIPTION =
  "A small, numbered selection from across the catalogue — each print released in a run of 25.";
const LIMITED_EDITION_RUN = "Edition of 25";

const LIMITED_EDITION_PICKS: { dir: string; file: string; width: number; height: number }[] = [
  { dir: "Waves", file: "_NZP4237.jpg", width: 7555, height: 5037 },
  { dir: "Fine Art", file: "DSC07842.jpg", width: 5262, height: 3508 },
  { dir: "Abstracts", file: "_NZP6894.jpg", width: 7687, height: 5125 },
  { dir: "Reflections", file: "_NZP5491.jpg", width: 6880, height: 4587 },
  { dir: "Textures", file: "_NZP8113.jpg", width: 6267, height: 4178 },
];

// Every photo was shot at Whangamata for now. Add a `"filename.jpg": "Place, New Zealand"`
// entry here to override the location for individual photos as more shoot locations come in.
const DEFAULT_LOCATION = "Whangamata, New Zealand";
const LOCATION_OVERRIDES: Record<string, string> = {};

// Hand-tagged from a visual review of every photo (contact-sheet pass, one per
// category). Keyed by filename; merged with the category's auto-tag (if any)
// in getCategory(). Add entries here for any new photo dropped into public/.
const TAG_OVERRIDES: Record<string, string[]> = {
  // Abstracts
  "DSC03143.jpg": ["moody", "mystery"],
  "_NZP2338.jpg": ["positive-vibe"],
  "_NZP2681.jpg": ["positive-vibe"],
  "_NZP4848.jpg": ["positive-vibe"],
  "_NZP5441.jpg": ["moody", "mystery"],
  "_NZP5490.jpg": ["moody", "mystery"],
  "_NZP5492.jpg": ["positive-vibe"],
  "_NZP6370.jpg": ["positive-vibe"],
  "_NZP6846.jpg": ["sunset", "moody"],
  "_NZP6894.jpg": ["sunset", "moody"],
  "_NZP7758.jpg": ["positive-vibe"],
  "_NZP9148.jpg": ["sunset", "positive-vibe"],
  "_NZP9694.jpg": ["moody"],
  "spark.jpg": ["sunset", "positive-vibe", "most-popular"],

  // Fine Art
  "DSC01961.jpg": ["wave", "positive-vibe", "most-popular"],
  "DSC07842.jpg": ["sunrise", "moody", "mystery"],
  "_NZP0948.jpg": ["sunrise", "moody"],
  "_NZP1062.jpg": ["sunrise", "moody"],
  "_NZP1310.jpg": ["sunrise", "mystery", "most-popular"],
  "_NZP3952.jpg": ["sunset", "moody"],
  "_NZP4112.jpg": ["mystery", "moody"],
  "_NZP5310.jpg": ["abstract", "mystery"],
  "_NZP6339.jpg": ["mystery", "moody"],
  "_NZP6713.jpg": ["sunset", "positive-vibe"],
  "_NZP7323.jpg": ["moody", "mystery"],
  "_NZP7572.jpg": ["moody", "positive-vibe"],
  "_NZP7618.jpg": ["sunset", "positive-vibe"],
  "_NZP7745.jpg": ["mystery", "moody"],
  "_NZP8205.jpg": ["mystery", "moody"],

  // Reflections
  "_NZP3268.jpg": ["sunset", "moody"],
  "_NZP3571.jpg": ["sunset", "positive-vibe"],
  "_NZP4151.jpg": ["moody", "mystery"],
  "_NZP5372.jpg": ["sunset", "positive-vibe"],
  "_NZP5434.jpg": ["sunset", "positive-vibe"],
  "_NZP5491.jpg": ["sunset", "moody"],
  "_NZP7255.jpg": ["sunset", "positive-vibe"],
  "_NZP7291.jpg": ["moody", "mystery"],
  "_NZP9224.jpg": ["moody"],
  "_NZP9636.jpg": ["moody", "mystery"],

  // Textures
  "DSC05392.jpg": ["moody", "mystery"],
  "_NZP2238.jpg": ["sunset", "moody"],
  "_NZP2436.jpg": ["positive-vibe"],
  "_NZP4566.jpg": ["sunset", "positive-vibe"],
  "_NZP5009.jpg": ["sunset", "positive-vibe"],
  "_NZP8113.jpg": ["mystery", "positive-vibe"],

  // Waves
  "DSC05261.jpg": ["sunset", "positive-vibe"],
  "DSC06780.jpg": ["moody"],
  "NZP03216.jpg": ["moody", "mystery"],
  "_NZP0620.jpg": ["sunset", "positive-vibe"],
  "_NZP0919.jpg": ["abstract", "positive-vibe"],
  "_NZP1305.jpg": ["positive-vibe", "most-popular"],
  "_NZP1353.jpg": ["moody"],
  "_NZP3081.jpg": ["positive-vibe"],
  "_NZP3509.jpg": ["sunset", "positive-vibe"],
  "_NZP3519.jpg": ["sunset", "positive-vibe"],
  "_NZP4237.jpg": ["positive-vibe", "most-popular"],
  "_NZP6130.jpg": ["sunset", "moody", "mystery"],
  "_NZP6229.jpg": ["moody"],
  "_NZP8293.jpg": ["moody"],
  "lines2-2.jpg": ["abstract", "sunset", "positive-vibe"],
  "lines2.jpg": ["abstract", "sunset", "positive-vibe", "most-popular"],
};

function resolveTags(file: string, categoryTag?: string, extraTag?: string): string[] {
  const tags = new Set(TAG_OVERRIDES[file] ?? []);
  if (categoryTag) tags.add(categoryTag);
  if (extraTag) tags.add(extraTag);
  return [...tags];
}

export function getAllCategorySlugs(): string[] {
  return [...CATEGORY_DEFS.map((c) => c.slug), LIMITED_EDITION_SLUG];
}

export async function getCategory(slug: string): Promise<Category | null> {
  if (slug === LIMITED_EDITION_SLUG) {
    const photos: Photo[] = LIMITED_EDITION_PICKS.map((pick, index) => {
      const sourceDef = CATEGORY_DEFS.find((c) => c.dir === pick.dir);
      return {
        src: `/${encodeURIComponent(pick.dir)}/${encodeURIComponent(pick.file)}`,
        width: pick.width,
        height: pick.height,
        title: `Limited Edition No. ${String(index + 1).padStart(2, "0")}`,
        location: LOCATION_OVERRIDES[pick.file] ?? DEFAULT_LOCATION,
        edition: LIMITED_EDITION_RUN,
        tags: resolveTags(pick.file, sourceDef?.tag, "limited-edition"),
        categorySlug: LIMITED_EDITION_SLUG,
        categoryLabel: LIMITED_EDITION_LABEL,
      };
    });

    return {
      slug: LIMITED_EDITION_SLUG,
      label: LIMITED_EDITION_LABEL,
      description: LIMITED_EDITION_DESCRIPTION,
      photos,
    };
  }

  const def = CATEGORY_DEFS.find((c) => c.slug === slug);
  if (!def) return null;

  const dirPath = path.join(process.cwd(), "public", def.dir);
  const entries = await readdir(dirPath);
  const files = entries
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const photos: Photo[] = await Promise.all(
    files.map(async (file, index) => {
      const { width, height } = await imageSizeFromFile(path.join(dirPath, file));
      return {
        src: `/${encodeURIComponent(def.dir)}/${encodeURIComponent(file)}`,
        width,
        height,
        title: `${def.label} Study ${String(index + 1).padStart(2, "0")}`,
        location: LOCATION_OVERRIDES[file] ?? DEFAULT_LOCATION,
        tags: resolveTags(file, def.tag),
        categorySlug: def.slug,
        categoryLabel: def.label,
      };
    })
  );

  return {
    slug: def.slug,
    label: def.label,
    description: def.description,
    photos,
  };
}

export async function getAllPhotos(): Promise<Photo[]> {
  const categories = await Promise.all(getAllCategorySlugs().map((slug) => getCategory(slug)));
  return categories.flatMap((category) => category?.photos ?? []);
}
