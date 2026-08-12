import { NextResponse, type NextRequest } from "next/server";
import { getCustomerAccountClientId, getCustomerAccountRedirectUri } from "@/app/lib/shopify/config";
import { getOpenIdConfiguration } from "@/app/lib/shopify/customer-account/discovery";
import { generateCodeChallenge, generateRandomString } from "@/app/lib/shopify/customer-account/pkce";
import { setOAuthState } from "@/app/lib/shopify/customer-account/session";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/account";
  const redirectUri = getCustomerAccountRedirectUri(
    new URL("/auth/callback", request.nextUrl.origin).toString()
  );

  const state = generateRandomString(16);
  const verifier = generateRandomString(32);
  const challenge = await generateCodeChallenge(verifier);

  await setOAuthState({ state, verifier, returnTo });

  const { authorization_endpoint } = await getOpenIdConfiguration();
  const url = new URL(authorization_endpoint);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", getCustomerAccountClientId());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(url);
}
