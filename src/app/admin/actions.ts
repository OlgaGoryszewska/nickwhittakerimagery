"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/app/lib/admin";
import { createAdminClient } from "@/app/lib/supabase/admin";

export type OrderStatus = "pending" | "paid" | "cancelled";

export type UpdateOrderStatusResult = { ok: true } | { ok: false; error: string };

// Re-checks admin here rather than trusting the page-level guard: Server
// Actions are callable directly (they compile to their own endpoint), so
// the check that gates the /admin page doesn't gate this on its own.
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<UpdateOrderStatusResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return { ok: false, error: "Not authorized." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  return { ok: true };
}
