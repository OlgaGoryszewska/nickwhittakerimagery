import { getCustomerAccountApiConfiguration } from "./discovery.ts";

type GraphqlResponse<T> = { data?: T; errors?: { message: string }[] };

// Per Shopify's docs, the Authorization header carries the raw access
// token — not a "Bearer " prefix.
export async function customerAccountGraphql<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const { graphql_api } = await getCustomerAccountApiConfiguration();

  const res = await fetch(graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Customer Account API request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GraphqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Customer Account API GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("Customer Account API returned no data");
  }
  return json.data;
}
