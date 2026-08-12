import { getCustomerAccountClientId } from "../config.ts";
import { getOpenIdConfiguration } from "./discovery.ts";

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
};

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const { token_endpoint } = await getOpenIdConfiguration();
  const res = await fetch(token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Shopify token request failed: ${res.status} ${res.statusText} ${detail}`);
  }
  return res.json() as Promise<TokenResponse>;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TokenResponse> {
  return postToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: getCustomerAccountClientId(),
      redirect_uri: redirectUri,
      code,
      code_verifier: codeVerifier,
    })
  );
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return postToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: getCustomerAccountClientId(),
      refresh_token: refreshToken,
    })
  );
}
