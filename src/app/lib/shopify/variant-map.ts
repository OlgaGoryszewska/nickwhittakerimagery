import variantMapJson from "./generated/variant-map.json";
import { variantKey } from "./variant-sku.ts";

type VariantMap = {
  version: number;
  generatedAt: string | null;
  products: Record<
    string,
    {
      productId: string;
      variants: Record<string, string>;
    }
  >;
};

const variantMap = variantMapJson as VariantMap;

export function getShopifyProductId(photoSlug: string): string | null {
  return variantMap.products[photoSlug]?.productId ?? null;
}

export function getShopifyVariantId(
  photoSlug: string,
  size: string,
  framing: string,
  frameColor?: string
): string | null {
  const product = variantMap.products[photoSlug];
  if (!product) return null;
  const key = variantKey(size, framing, frameColor);
  return product.variants[key] ?? null;
}
