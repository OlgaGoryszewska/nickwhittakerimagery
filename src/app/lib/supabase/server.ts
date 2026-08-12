import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

// Server client — used in Server Components, Route Handlers, and Server
// Actions. Per Supabase's guidance, create a new instance per request rather
// than sharing one across requests.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't write cookies —
          // proxy.ts handles session refresh in that case instead.
        }
      },
    },
  });
}

// Used by the root layout (runs on every page) and anywhere else that just
// needs to know "is someone signed in" without treating a missing/broken
// Supabase config as a hard failure — a misconfigured project shouldn't take
// the entire site down, it should just render as signed-out.
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
