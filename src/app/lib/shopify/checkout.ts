"use server";

import type { CartItem } from "@/app/components/CartContext";
import { resolveCartItems } from "./resolve-cart";
import { assertNoUserErrors, storefrontGraphql } from "./storefront-client";

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type CartCreateResponse = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: { field?: string[] | null; message: string }[];
  };
};

export type CreateCheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: string; unavailableItemIds?: string[] };

// Builds a Shopify cart via the Storefront API from the current local cart
// and hands back the hosted checkoutUrl to redirect to. Never trusts a
// client-sent total/price — Shopify computes those from the resolved
// variant IDs.
export async function createCheckout(items: CartItem[]): Promise<CreateCheckoutResult> {
  if (items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const resolved = resolveCartItems(items);
  const unavailable = resolved.filter((line) => !line.shopifyVariantId);
  if (unavailable.length > 0) {
    return {
      ok: false,
      error: "Some items in your cart are temporarily unavailable.",
      unavailableItemIds: unavailable.map((line) => line.item.id),
    };
  }

  const lines = resolved.map((line) => ({
    merchandiseId: line.shopifyVariantId as string,
    quantity: line.item.qty,
  }));

  try {
    const data = await storefrontGraphql<CartCreateResponse>(CART_CREATE_MUTATION, { input: { lines } });
    assertNoUserErrors(data.cartCreate.userErrors, "cartCreate");
    if (!data.cartCreate.cart) {
      return { ok: false, error: "Shopify did not return a cart. Please try again." };
    }
    return { ok: true, checkoutUrl: data.cartCreate.cart.checkoutUrl };
  } catch (err) {
    console.error("createCheckout failed:", err);
    return { ok: false, error: "Couldn't start checkout. Please try again or contact us." };
  }
}
