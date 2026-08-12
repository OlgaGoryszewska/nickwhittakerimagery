import { NextResponse, type NextRequest } from "next/server";
import { refreshTokens } from "@/app/lib/shopify/customer-account/tokens";
import {
  clearCustomerSession,
  getRefreshToken,
  setCustomerSession,
  setRefreshToken,
} from "@/app/lib/shopify/customer-account/session";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/account";
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.redirect(
      new URL(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`, request.nextUrl.origin)
    );
  }

  try {
    const tokens = await refreshTokens(refreshToken);
    await setCustomerSession(tokens.access_token, tokens.expires_in);
    if (tokens.refresh_token) await setRefreshToken(tokens.refresh_token);
  } catch (err) {
    console.error("Customer Account token refresh failed:", err);
    await clearCustomerSession();
    return NextResponse.redirect(
      new URL(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`, request.nextUrl.origin)
    );
  }

  return NextResponse.redirect(new URL(returnTo, request.nextUrl.origin));
}
