import { getStoreDomain } from "../config.ts";

// Shopify's Customer Account API is OIDC-discovery-based rather than
// hardcoded-URL-based: both discovery documents live under well-known paths
// on the store's own myshopify.com domain (confirmed against shopify.dev —
// NOT the separate "https://shopify.com/{shop_id}/account" URL format,
// despite that being what most starter .env examples show).

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
};

type CustomerAccountApiConfiguration = {
  graphql_api: string;
};

let cachedOpenIdConfig: OpenIdConfiguration | null = null;
let cachedApiConfig: CustomerAccountApiConfiguration | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Shopify discovery request failed (${url}): ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Cached in-memory for the life of the server process — these documents
// change essentially never, so re-fetching them on every login/callback
// request would just be wasted latency.
export async function getOpenIdConfiguration(): Promise<OpenIdConfiguration> {
  if (cachedOpenIdConfig) return cachedOpenIdConfig;
  const domain = getStoreDomain();
  cachedOpenIdConfig = await fetchJson<OpenIdConfiguration>(`https://${domain}/.well-known/openid-configuration`);
  return cachedOpenIdConfig;
}

export async function getCustomerAccountApiConfiguration(): Promise<CustomerAccountApiConfiguration> {
  if (cachedApiConfig) return cachedApiConfig;
  const domain = getStoreDomain();
  cachedApiConfig = await fetchJson<CustomerAccountApiConfiguration>(
    `https://${domain}/.well-known/customer-account-api`
  );
  return cachedApiConfig;
}
