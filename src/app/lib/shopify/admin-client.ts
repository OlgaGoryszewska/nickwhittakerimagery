import { getAdminApiClientId, getAdminApiClientSecret, getStoreDomain, SHOPIFY_ADMIN_API_VERSION } from "./config.ts";

type GraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

// Since Jan 2026, Dev Dashboard custom apps no longer hand out a static
// shpat_ token — access is obtained via the OAuth client credentials grant
// (client_id + client_secret -> short-lived access_token, ~24h). Cached
// in-memory for the life of the process; refreshed a minute early to avoid
// racing the actual expiry.
type CachedToken = { accessToken: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const domain = getStoreDomain();
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: getAdminApiClientId(),
      client_secret: getAdminApiClientSecret(),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Shopify Admin API token request failed: ${res.status} ${res.statusText} ${detail}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { accessToken: json.access_token, expiresAt: Date.now() + (json.expires_in - 60) * 1000 };
  return cachedToken.accessToken;
}

// Write-scope client — used ONLY by scripts/shopify/sync-products.ts. Never
// import this from a user-facing request path (route handler, server
// component, server action); use storefront-client.ts there instead.
export async function adminGraphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const domain = getStoreDomain();
  const token = await getAdminAccessToken();

  const res = await fetch(`https://${domain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GraphqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify Admin API GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("Shopify Admin API returned no data");
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
