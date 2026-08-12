import { createBrowserClient } from "@supabase/ssr";

// Browser client — used by Client Components (login form, etc.). Cookie
// handling is automatic; no manual getAll/setAll needed here (that's only
// required for the server client and middleware).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
