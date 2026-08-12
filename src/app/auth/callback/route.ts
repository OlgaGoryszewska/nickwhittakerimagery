import { NextResponse, type NextRequest } from "next/server";
import { getCustomerAccountRedirectUri } from "@/app/lib/shopify/config";
import { exchangeCodeForTokens } from "@/app/lib/shopify/customer-account/tokens";
import { consumeOAuthState, setCustomerSession, setRefreshToken } from "@/app/lib/shopify/customer-account/session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauth = await consumeOAuthState();

  if (!code || !state || !oauth || oauth.state !== state) {
    return NextResponse.redirect(new URL("/auth/login?error=state_mismatch", request.nextUrl.origin));
  }

  const redirectUri = getCustomerAccountRedirectUri(
    new URL("/auth/callback", request.nextUrl.origin).toString()
  );

  try {
    const tokens = await exchangeCodeForTokens(code, oauth.verifier, redirectUri);
    await setCustomerSession(tokens.access_token, tokens.expires_in);
    if (tokens.refresh_token) await setRefreshToken(tokens.refresh_token);
  } catch (err) {
    console.error("Customer Account token exchange failed:", err);
    return NextResponse.redirect(new URL("/auth/login?error=token_exchange_failed", request.nextUrl.origin));
  }

  return NextResponse.redirect(new URL(oauth.returnTo || "/account", request.nextUrl.origin));
}
