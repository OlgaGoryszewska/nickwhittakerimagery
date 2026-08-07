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

// Every photo was shot at Whangamata for now. Add a `"filename.jpg": "Place, New Zealand"`
// entry here to override the location for individual photos as more shoot locations come in.
const DEFAULT_LOCATION = "Whangamata, New Zealand";
const LOCATION_OVERRIDES: Record<string, string> = {};

// Hand-tagged from a visual review of every photo (contact-sheet pass, one per
// category). Keyed by filename; merged with the category's auto-tag (if any)
// in getCategory(). Add entries here for any new photo dropped into public/.
const TAG_OVERRIDES: Record<string, string[]> = {
  // Abstracts
  "nick-whittaker-ocean-photography-golden-sand-foam.jpg": ["positive-vibe"],
  "nick-whittaker-ocean-photography-midnight-blue-ripple.jpg": ["positive-vibe"],
  "nick-whittaker-ocean-photography-turquoise-water-texture.jpg": ["positive-vibe", "most-popular"],
  "nick-whittaker-ocean-photography-golden-flecked-water.jpg": ["moody", "mystery", "most-popular"],
  "nick-whittaker-ocean-photography-motion-blur-abstract.jpg": ["moody", "mystery"],
  "nick-whittaker-ocean-photography-blue-pebble-texture.jpg": ["positive-vibe"],
  "nick-whittaker-ocean-photography-stone-mosaic-texture.jpg": ["positive-vibe", "most-popular"],
  "nick-whittaker-ocean-photography-copper-reflection-lines.jpg": ["sunset", "moody"],
  "nick-whittaker-ocean-photography-crimson-wave-abstract.jpg": ["sunset", "moody"],
  "nick-whittaker-ocean-photography-cream-foam-texture.jpg": ["positive-vibe"],
  "nick-whittaker-ocean-photography-slate-blue-lines.jpg": ["moody"],
  "nick-whittaker-ocean-photography-golden-grass-silhouette.jpg": ["sunset", "positive-vibe"],
  "nick-whittaker-ocean-photography-fiery-sunset-shoreline.jpg": ["sunset", "positive-vibe"],

  // Fine Art
  "nick-whittaker-ocean-photography-dusk-silhouette-figures.jpg": ["sunrise", "moody", "mystery"],
  "nick-whittaker-ocean-photography-golden-sunrise-fisherman.jpg": ["sunrise", "moody"],
  "nick-whittaker-ocean-photography-sunrise-fishing-boats.jpg": ["sunrise", "moody"],
  "nick-whittaker-ocean-photography-fisherman-light-trail.jpg": ["sunrise", "mystery"],
  "nick-whittaker-ocean-photography-palm-tree-silhouette.jpg": ["sunset", "moody"],
  "nick-whittaker-ocean-photography-fisheye-palm-canopy.jpg": ["abstract", "mystery"],
  "nick-whittaker-ocean-photography-amber-palm-sunset.jpg": ["sunset", "positive-vibe"],
  "nick-whittaker-ocean-photography-coastal-palm-treeline.jpg": ["moody", "mystery"],
  "nick-whittaker-ocean-photography-twilight-palm-silhouette.jpg": ["moody", "positive-vibe"],

  // Reflections
  "nick-whittaker-ocean-photography-amber-ripple-reflection.jpg": ["sunset", "moody"],
  "nick-whittaker-ocean-photography-hazy-gold-horizon.jpg": ["sunset", "positive-vibe"],
  "nick-whittaker-ocean-photography-cobalt-ripple-reflection.jpg": ["moody", "mystery"],
  "nick-whittaker-ocean-photography-sunburst-water-reflection.jpg": ["sunset", "positive-vibe"],
  "nick-whittaker-ocean-photography-fire-ripple-reflection.jpg": ["sunset", "positive-vibe"],
  "nick-whittaker-ocean-photography-golden-streak-wave.jpg": ["sunset", "positive-vibe"],
  "nick-whittaker-ocean-photography-golden-mesh-reflection.jpg": ["moody", "most-popular"],
  "nick-whittaker-ocean-photography-muted-blue-reflection.jpg": ["moody", "mystery"],

  // Textures
  "nick-whittaker-ocean-photography-amber-horizon-blur.jpg": ["sunset", "moody", "most-popular"],
  "nick-whittaker-ocean-photography-minimalist-wave-line.jpg": ["positive-vibe"],
  "nick-whittaker-ocean-photography-underwater-light-rays.jpg": ["mystery", "positive-vibe"],

  // Waves
  "nick-whittaker-ocean-photography-pastel-dawn-wave.jpg": ["sunset", "positive-vibe"],
  "nick-whittaker-ocean-photography-emerald-storm-break.jpg": ["moody"],
  "nick-whittaker-ocean-photography-misty-teal-barrel.jpg": ["moody", "mystery"],
  "nick-whittaker-ocean-photography-soft-pastel-swell.jpg": ["sunset", "positive-vibe"],
  "nick-whittaker-ocean-photography-golden-spray-burst.jpg": ["abstract", "positive-vibe"],
  "nick-whittaker-ocean-photography-azure-breaking-wave.jpg": ["positive-vibe"],
  "nick-whittaker-ocean-photography-deep-teal-curl.jpg": ["moody", "most-popular"],
  "nick-whittaker-ocean-photography-forest-coast-wave.jpg": ["positive-vibe"],
  "nick-whittaker-ocean-photography-sunset-shore-swell.jpg": ["sunset", "positive-vibe", "most-popular"],
  "nick-whittaker-ocean-photography-dreamy-sunset-horizon.jpg": ["sunset", "positive-vibe", "most-popular"],
  "nick-whittaker-ocean-photography-dynamic-spray-splash.jpg": ["positive-vibe", "most-popular"],
  "nick-whittaker-ocean-photography-stormy-golden-break.jpg": ["sunset", "moody", "mystery"],
  "nick-whittaker-ocean-photography-twilight-curl-wave.jpg": ["moody"],
  "nick-whittaker-ocean-photography-dark-teal-barrel.jpg": ["moody"],
  "nick-whittaker-ocean-photography-abstract-sunset-lines.jpg": ["abstract", "sunset", "positive-vibe", "most-popular"],
  "nick-whittaker-ocean-photography-sunset-wave-lines.jpg": ["abstract", "sunset", "positive-vibe"],
};

// Rich, unique SEO/accessibility alt text per photo — distinct from the short
// display `title` ("Waves Study 01"). Keyed by filename; falls back to a
// generic description built from category + location if a photo has none yet
// (e.g. a brand-new file dropped in before someone writes its alt text).
const ALT_TEXT: Record<string, string> = {
  // Abstracts
  "nick-whittaker-ocean-photography-golden-sand-foam.jpg":
    "Golden sea foam breaking over amber sand — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-midnight-blue-ripple.jpg":
    "Dark indigo water rippling in soft abstract bands — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-turquoise-water-texture.jpg":
    "Bright turquoise ripples across the ocean surface — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-golden-flecked-water.jpg":
    "Dark water flecked with warm golden light — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-motion-blur-abstract.jpg":
    "Monochrome motion-blur study of moving water — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-blue-pebble-texture.jpg":
    "Cobalt blue water with a pebbled, textured surface — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-stone-mosaic-texture.jpg":
    "Sand and pebbles forming a natural stone mosaic — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-copper-reflection-lines.jpg":
    "Copper sunset light streaked across still water — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-crimson-wave-abstract.jpg":
    "Deep crimson and black abstract wave study — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-cream-foam-texture.jpg":
    "Soft cream sea foam dissolving on pale sand — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-slate-blue-lines.jpg":
    "Slate blue horizontal lines of moving water — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-golden-grass-silhouette.jpg":
    "Golden dune grass backlit against deep blue sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-fiery-sunset-shoreline.jpg":
    "Fiery orange sunset light along the shoreline — fine art ocean photography print, Whangamata NZ.",

  // Fine Art
  "nick-whittaker-ocean-photography-dusk-silhouette-figures.jpg":
    "Two figures silhouetted on still water at dusk — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-golden-sunrise-fisherman.jpg":
    "Traditional fisherman silhouetted against a golden sunrise — fine art photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-sunrise-fishing-boats.jpg":
    "Fishing boats and fishermen silhouetted at sunrise — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-fisherman-light-trail.jpg":
    "Fisherman in silhouette with a golden light trail on the water, Whangamata NZ — fine art photography print.",
  "nick-whittaker-ocean-photography-palm-tree-silhouette.jpg":
    "Single palm tree silhouetted against a pale sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-fisheye-palm-canopy.jpg":
    "Fisheye view looking up through a palm tree canopy — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-amber-palm-sunset.jpg":
    "Palm tree silhouette against an amber sunset sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-coastal-palm-treeline.jpg":
    "Moody coastal palm treeline under a grey sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-twilight-palm-silhouette.jpg":
    "Palm trees silhouetted against dramatic twilight clouds — fine art photography print, Whangamata NZ.",

  // Reflections
  "nick-whittaker-ocean-photography-amber-ripple-reflection.jpg":
    "Amber light rippling across dark water — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-hazy-gold-horizon.jpg":
    "Hazy gold horizon reflected on calm water — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-cobalt-ripple-reflection.jpg":
    "Cobalt blue ripples reflecting soft light — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-sunburst-water-reflection.jpg":
    "Bright sunburst reflection dancing on the water — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-fire-ripple-reflection.jpg":
    "Fiery orange ripples reflected across the surface — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-golden-streak-wave.jpg":
    "A single golden light streak across a blue wave — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-golden-mesh-reflection.jpg":
    "Golden light forming a mesh-like reflection pattern — fine art photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-muted-blue-reflection.jpg":
    "Soft muted blue reflection with a faint gold line — fine art ocean photography print, Whangamata NZ.",

  // Textures
  "nick-whittaker-ocean-photography-amber-horizon-blur.jpg":
    "Amber and blue motion-blurred water horizon — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-minimalist-wave-line.jpg":
    "Minimalist wave line against a pale blue sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-underwater-light-rays.jpg":
    "Underwater light rays filtering through teal water — fine art ocean photography print, Whangamata NZ.",

  // Waves
  "nick-whittaker-ocean-photography-pastel-dawn-wave.jpg":
    "A breaking wave under a soft pastel dawn sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-emerald-storm-break.jpg":
    "Emerald wave breaking under a stormy sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-misty-teal-barrel.jpg":
    "Teal barrel wave curling under a misty grey sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-soft-pastel-swell.jpg":
    "Gentle swell rolling under soft pastel clouds — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-golden-spray-burst.jpg":
    "Golden backlit spray bursting into a blue sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-azure-breaking-wave.jpg":
    "Clean azure wave breaking under bright daylight — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-deep-teal-curl.jpg":
    "A deep teal wave curling into a dramatic barrel — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-forest-coast-wave.jpg":
    "Breaking wave with a forested coastline behind it — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-sunset-shore-swell.jpg":
    "Soft swell rolling onto the shore at sunset — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-dreamy-sunset-horizon.jpg":
    "Dreamy pastel sunset horizon over gentle waves — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-dynamic-spray-splash.jpg":
    "Dynamic spray bursting from a breaking wave — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-stormy-golden-break.jpg":
    "Golden light breaking through stormy clouds over the point — fine art photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-twilight-curl-wave.jpg":
    "A curling wave under a dramatic twilight sky — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-dark-teal-barrel.jpg":
    "A dark teal wave curling into a barrel — fine art ocean photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-abstract-sunset-lines.jpg":
    "Abstract horizontal lines of pink sunset light on water — fine art photography print, Whangamata NZ.",
  "nick-whittaker-ocean-photography-sunset-wave-lines.jpg":
    "Sunset light forming abstract lines across the water — fine art ocean photography print, Whangamata NZ.",
};

function resolveTags(file: string, categoryTag?: string): string[] {
  const tags = new Set(TAG_OVERRIDES[file] ?? []);
  if (categoryTag) tags.add(categoryTag);
  return [...tags];
}

function resolveAlt(file: string, categoryLabel: string, location: string): string {
  return (
    ALT_TEXT[file] ??
    `Fine art ${categoryLabel.toLowerCase()} ocean photography print by Nick Whittaker, ${location}.`
  );
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getAllCategorySlugs(): string[] {
  return CATEGORY_DEFS.map((c) => c.slug);
}

export async function getCategory(slug: string): Promise<Category | null> {
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
      const title = `${def.label} Study ${String(index + 1).padStart(2, "0")}`;
      const location = LOCATION_OVERRIDES[file] ?? DEFAULT_LOCATION;
      return {
        slug: slugify(title),
        src: `/${encodeURIComponent(def.dir)}/${encodeURIComponent(file)}`,
        width,
        height,
        title,
        alt: resolveAlt(file, def.label, location),
        location,
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

// "See it on your wall" room mockups. Drop a file named
// `{photo-base-filename}-{room-descriptor}.jpg` into public/mockup/ and it
// will automatically show up in that photo's carousel — no code changes
// needed. e.g. nick-whittaker-ocean-photography-cream-foam-texture-modern-bedroom.jpg
// attaches to nick-whittaker-ocean-photography-cream-foam-texture.jpg.
const MOCKUP_DIR_NAME = "mockup";

export type PhotoMockup = {
  src: string;
  width: number;
  height: number;
  label: string;
  alt: string;
};

// Corrects known typos from hand-typed mockup filenames so the carousel
// caption still reads cleanly (the file on disk is left as-is).
const LABEL_WORD_FIXES: Record<string, string> = {
  moder: "modern",
  minimalistik: "minimalistic",
  bedrooom: "bedroom",
  vobrant: "vibrant",
};

function mockupLabel(descriptor: string): string {
  return descriptor
    .split("-")
    .map((word) => LABEL_WORD_FIXES[word] ?? word)
    .flatMap((word) => (word === "livingroom" ? ["living", "room"] : [word]))
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function getPhotoMockups(photo: Photo): Promise<PhotoMockup[]> {
  const mockupDir = path.join(process.cwd(), "public", MOCKUP_DIR_NAME);
  let entries: string[];
  try {
    entries = await readdir(mockupDir);
  } catch {
    return [];
  }

  const baseName = path.parse(decodeURIComponent(photo.src)).name;
  const prefix = `${baseName}-`;
  const matches = entries
    .filter((file) => file.startsWith(prefix) && IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  return Promise.all(
    matches.map(async (file) => {
      const { width, height } = await imageSizeFromFile(path.join(mockupDir, file));
      const label = mockupLabel(path.parse(file).name.slice(prefix.length));
      return {
        src: `/${MOCKUP_DIR_NAME}/${encodeURIComponent(file)}`,
        width,
        height,
        label,
        alt: `${photo.title} shown as a framed print in a ${label.toLowerCase()} — Nick Whittaker Imagery.`,
      };
    })
  );
}
