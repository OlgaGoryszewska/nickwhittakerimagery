import { getStorefrontApiToken, getStoreDomain, SHOPIFY_STOREFRONT_API_VERSION } from "./config.ts";

type GraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

// Low-privilege client (cart/checkout scope only) — safe to call from
// user-facing request paths (server actions, route handlers). Never gains
// write access to products/orders; that stays isolated in admin-client.ts.
export async function storefrontGraphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const domain = getStoreDomain();
  const token = getStorefrontApiToken();

  const res = await fetch(`https://${domain}/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GraphqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify Storefront API GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("Shopify Storefront API returned no data");
  }
  return json.data;
}

export type UserError = { field?: string[] | null; message: string };

export function assertNoUserErrors(userErrors: UserError[] | undefined, context: string): void {
  if (userErrors && userErrors.length > 0) {
    const detail = userErrors
      .map((e) => (e.field?.length ? `${e.field.join(".")}: ${e.message}` : e.message))
      .join("; ");
    throw new Error(`${context}: ${detail}`);
  }
}
