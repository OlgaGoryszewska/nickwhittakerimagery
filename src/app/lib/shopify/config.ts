// Env var access + API version pins for all Shopify integration code. Pinned
// as code constants (not env vars) so bumping the API version is a
// deliberate, reviewed change rather than an env-var typo in production.
//
// Uses relative imports only (no "@/*" alias) so this module — and anything
// that imports it — stays loadable by the plain-Node sync script in
// scripts/shopify/, which doesn't go through Next's bundler.

export const SHOPIFY_ADMIN_API_VERSION = "2025-10";
export const SHOPIFY_STOREFRONT_API_VERSION = "2025-10";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.local.`);
  }
  return value;
}

export function getStoreDomain(): string {
  return requireEnv("SHOPIFY_STORE_DOMAIN");
}

export function getStorefrontApiToken(): string {
  return requireEnv("SHOPIFY_STOREFRONT_API_TOKEN");
}

// Since Jan 2026, Shopify's Dev Dashboard apps no longer issue a static
// shpat_ token — Admin API access is obtained via the OAuth client
// credentials grant instead (see admin-client.ts), so we need the app's
// client ID/secret rather than a pre-issued token.
export function getAdminApiClientId(): string {
  return requireEnv("SHOPIFY_ADMIN_API_CLIENT_ID");
}

export function getAdminApiClientSecret(): string {
  return requireEnv("SHOPIFY_ADMIN_API_CLIENT_SECRET");
}

export function getCustomerAccountClientId(): string {
  return requireEnv("SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID");
}

export function getCustomerAccountRedirectUri(defaultUri: string): string {
  return process.env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI || defaultUri;
}
