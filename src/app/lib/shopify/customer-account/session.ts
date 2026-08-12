import { cookies } from "next/headers";

// cookies() can only be *written* from Route Handlers/Server Actions, never
// from Server Component rendering — so every setter here is only ever
// called from src/app/auth/*/route.ts. Server Components (the account page,
// the root layout) only ever call the read-only getters.

const SESSION_COOKIE = "nwi_customer_session";
const REFRESH_COOKIE = "nwi_customer_refresh";
const OAUTH_COOKIE = "nwi_oauth";

const isProd = process.env.NODE_ENV === "production";

export type CustomerSession = { accessToken: string; expiresAt: number };

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CustomerSession;
    if (!parsed.accessToken || !parsed.expiresAt || parsed.expiresAt <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setCustomerSession(accessToken: string, expiresInSeconds: number): Promise<void> {
  const store = await cookies();
  const session: CustomerSession = { accessToken, expiresAt: Date.now() + expiresInSeconds * 1000 };
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: isProd,
    // Must be "lax", not "strict" — this cookie has to survive the
    // top-level cross-origin redirect back from Shopify's own domain.
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSeconds,
  });
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

export async function setRefreshToken(refreshToken: string): Promise<void> {
  const store = await cookies();
  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export type OAuthState = { state: string; verifier: string; returnTo: string };

export async function setOAuthState(value: OAuthState): Promise<void> {
  const store = await cookies();
  store.set(OAUTH_COOKIE, JSON.stringify(value), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

export async function consumeOAuthState(): Promise<OAuthState | null> {
  const store = await cookies();
  const raw = store.get(OAUTH_COOKIE)?.value;
  store.delete(OAUTH_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OAuthState;
  } catch {
    return null;
  }
}
