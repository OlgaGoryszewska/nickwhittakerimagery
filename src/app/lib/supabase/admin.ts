import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses Row Level Security entirely. Used ONLY by
// src/app/lib/orders.ts to write orders/order_items server-side. Never
// import this into a "use client" module or a user-facing request path that
// doesn't first validate what it's writing — this credential can read/write
// every row in every table regardless of RLS policy.
export function createAdminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
