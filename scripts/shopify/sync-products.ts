// Creates/updates one Shopify product per photo, with a variant for every
// valid (size, framing, colour) combination, via the Admin API's `productSet`
// upsert-by-handle mutation. Idempotent — safe to re-run after a price change
// or a new photo being added.
//
// Run with: npm run shopify:sync-products -- [--dry-run] [--photo=<slug>]
//
// Uses relative imports with explicit .ts extensions and no "@/*" alias,
// since this runs under plain Node (native TS support), not Next's bundler.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getAllPhotos } from "../../src/app/lib/categories.ts";
import { parsePrice, SIZE_OPTIONS } from "../../src/app/lib/catalog.ts";
import { FRAME_COLORS, NO_FRAME, PURCHASABLE_FRAMING_STYLES } from "../../src/app/lib/framing.ts";
import { adminGraphql, assertNoUserErrors } from "../../src/app/lib/shopify/admin-client.ts";
import { NO_COLOR_LABEL, variantKey, variantSku } from "../../src/app/lib/shopify/variant-sku.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_PATH = path.join(__dirname, "../../src/app/lib/shopify/generated/variant-map.json");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlySlug = args.find((a) => a.startsWith("--photo="))?.split("=")[1];

type PlannedVariant = {
  key: string;
  sku: string;
  price: string;
  optionValues: { optionName: string; name: string }[];
};

function buildVariants(photoSlug: string): PlannedVariant[] {
  const variants: PlannedVariant[] = [];

  for (const sizeOption of SIZE_OPTIONS) {
    variants.push({
      key: variantKey(sizeOption.size, NO_FRAME),
      sku: variantSku(photoSlug, sizeOption.size, NO_FRAME),
      price: parsePrice(sizeOption.price).toFixed(2),
      optionValues: [
        { optionName: "Size", name: sizeOption.size },
        { optionName: "Framing", name: NO_FRAME },
        { optionName: "Colour", name: NO_COLOR_LABEL },
      ],
    });
  }

  for (const framingStyle of PURCHASABLE_FRAMING_STYLES) {
    for (const sizeOption of SIZE_OPTIONS) {
      const framingPrice = framingStyle.pricing.find((p) => p.size === sizeOption.size)?.price;
      if (!framingPrice) continue;
      const total = parsePrice(sizeOption.price) + parsePrice(framingPrice);

      for (const color of FRAME_COLORS) {
        variants.push({
          key: variantKey(sizeOption.size, framingStyle.name, color.name),
          sku: variantSku(photoSlug, sizeOption.size, framingStyle.name, color.name),
          price: total.toFixed(2),
          optionValues: [
            { optionName: "Size", name: sizeOption.size },
            { optionName: "Framing", name: framingStyle.name },
            { optionName: "Colour", name: color.name },
          ],
        });
      }
    }
  }

  return variants;
}

// productSet does NOT upsert by handle on its own — passing only `handle`
// inside `input` always attempts a create, and errors ("Handle already in
// use") if a product with that handle already exists. To actually update an
// existing product, its id has to be passed separately via `identifier`.
const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($identifier: ProductIdentifierInput!) {
    productByIdentifier(identifier: $identifier) {
      id
    }
  }
`;

type ProductByHandleResponse = {
  productByIdentifier: { id: string } | null;
};

async function findExistingProductId(photoSlug: string): Promise<string | null> {
  const data = await adminGraphql<ProductByHandleResponse>(PRODUCT_BY_HANDLE_QUERY, {
    identifier: { handle: photoSlug },
  });
  return data.productByIdentifier?.id ?? null;
}

const PRODUCT_SET_MUTATION = `
  mutation SyncProduct($input: ProductSetInput!, $identifier: ProductSetIdentifiers, $synchronous: Boolean!) {
    productSet(input: $input, identifier: $identifier, synchronous: $synchronous) {
      product {
        id
        variants(first: 100) {
          nodes { id sku }
        }
      }
      userErrors { field message }
    }
  }
`;

type ProductSetResponse = {
  productSet: {
    product: { id: string; variants: { nodes: { id: string; sku: string | null }[] } } | null;
    userErrors: { field?: string[] | null; message: string }[];
  };
};

// Products created via the Admin API aren't published to any sales channel
// by default — the Storefront API (and therefore cartCreate/checkout) can't
// see an unpublished product even though it exists in Admin. Publish to
// "Online Store" (so checkout displays/behaves normally) and whichever
// channel backs the Storefront token (named "... Headless" here).
const PUBLICATIONS_QUERY = `
  query ListPublications {
    publications(first: 20) {
      nodes { id name }
    }
  }
`;

type PublicationsResponse = {
  publications: { nodes: { id: string; name: string }[] };
};

let cachedPublicationIds: string[] | null = null;

async function getTargetPublicationIds(): Promise<string[]> {
  if (cachedPublicationIds) return cachedPublicationIds;
  const data = await adminGraphql<PublicationsResponse>(PUBLICATIONS_QUERY);
  cachedPublicationIds = data.publications.nodes
    .filter((p) => p.name === "Online Store" || p.name.toLowerCase().includes("headless"))
    .map((p) => p.id);
  return cachedPublicationIds;
}

const PUBLISH_MUTATION = `
  mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

type PublishResponse = {
  publishablePublish: { userErrors: { field?: string[] | null; message: string }[] };
};

async function publishToSalesChannels(productId: string): Promise<void> {
  const publicationIds = await getTargetPublicationIds();
  if (publicationIds.length === 0) return;
  const data = await adminGraphql<PublishResponse>(PUBLISH_MUTATION, {
    id: productId,
    input: publicationIds.map((publicationId) => ({ publicationId })),
  });
  assertNoUserErrors(data.publishablePublish.userErrors, `publishablePublish(${productId})`);
}

async function syncPhoto(photoSlug: string, title: string, descriptionHtml: string, variants: PlannedVariant[]) {
  if (dryRun) {
    console.log(`[dry-run] ${photoSlug}: would upsert ${variants.length} variants`);
    return {
      productId: `dry-run:${photoSlug}`,
      variantIdsByKey: Object.fromEntries(variants.map((v) => [v.key, `dry-run:${v.sku}`])),
    };
  }

  const input = {
    handle: photoSlug,
    title,
    descriptionHtml,
    productOptions: [
      { name: "Size", position: 1, values: SIZE_OPTIONS.map((s) => ({ name: s.size })) },
      {
        name: "Framing",
        position: 2,
        values: [NO_FRAME, ...PURCHASABLE_FRAMING_STYLES.map((f) => f.name)].map((name) => ({ name })),
      },
      {
        name: "Colour",
        position: 3,
        values: [NO_COLOR_LABEL, ...FRAME_COLORS.map((c) => c.name)].map((name) => ({ name })),
      },
    ],
    variants: variants.map((v) => ({ optionValues: v.optionValues, price: v.price, sku: v.sku })),
  };

  const existingId = await findExistingProductId(photoSlug);
  const identifier = existingId ? { id: existingId } : null;

  const data = await adminGraphql<ProductSetResponse>(PRODUCT_SET_MUTATION, {
    input,
    identifier,
    synchronous: true,
  });
  assertNoUserErrors(data.productSet.userErrors, `productSet(${photoSlug})`);

  const product = data.productSet.product;
  if (!product) throw new Error(`productSet(${photoSlug}) returned no product`);

  await publishToSalesChannels(product.id);

  const skuToKey = new Map(variants.map((v) => [v.sku, v.key]));
  const variantIdsByKey: Record<string, string> = {};
  for (const node of product.variants.nodes) {
    const key = node.sku ? skuToKey.get(node.sku) : undefined;
    if (key) variantIdsByKey[key] = node.id;
  }

  const unmatched = variants.filter((v) => !variantIdsByKey[v.key]);
  if (unmatched.length > 0) {
    console.warn(`  ! ${photoSlug}: ${unmatched.length} variant(s) not matched back by SKU after sync`);
  }

  return { productId: product.id, variantIdsByKey };
}

type VariantMapFile = {
  version: number;
  generatedAt: string | null;
  products: Record<string, { productId: string; variants: Record<string, string> }>;
};

async function main() {
  const allPhotos = await getAllPhotos();
  const photos = onlySlug ? allPhotos.filter((p) => p.slug === onlySlug) : allPhotos;

  if (photos.length === 0) {
    console.error(onlySlug ? `No photo found with slug "${onlySlug}"` : "No photos found.");
    process.exitCode = 1;
    return;
  }

  const mapFile: VariantMapFile = JSON.parse(await readFile(MAP_PATH, "utf8"));

  let synced = 0;
  let errored = 0;

  for (const photo of photos) {
    const variants = buildVariants(photo.slug);
    try {
      const { productId, variantIdsByKey } = await syncPhoto(photo.slug, photo.title, photo.alt, variants);
      if (!dryRun) mapFile.products[photo.slug] = { productId, variants: variantIdsByKey };
      synced += 1;
      console.log(`✓ ${photo.slug} (${variants.length} variants)`);
    } catch (err) {
      errored += 1;
      console.error(`✗ ${photo.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  if (!dryRun) {
    mapFile.generatedAt = new Date().toISOString();
    await writeFile(MAP_PATH, JSON.stringify(mapFile, null, 2) + "\n", "utf8");
    console.log(`\nWrote ${MAP_PATH}`);
  }

  console.log(`\n${synced} synced, ${errored} errored${dryRun ? " (dry run, nothing written)" : ""}`);
  if (errored > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
