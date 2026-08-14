import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getCurrentUser } from "@/app/lib/supabase/server";

// Single-admin gate: whoever is signed in with the email in ADMIN_EMAIL is
// treated as the site admin. No roles table — there's only ever one admin
// (Nick), so matching against an env var is simpler than modeling roles.

// Used by Server Actions, which must fail with a normal return value rather
// than redirecting (a redirect() thrown mid-action would just surface as an
// unhandled error to the caller).
export async function getAdminUser(): Promise<User | null> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return null;

  const user = await getCurrentUser();
  if (!user || user.email !== adminEmail) return null;
  return user;
}

// Used by admin pages (Server Components) — redirects so the flow matches
// the rest of the site: signed-out visitors land on /login, and anyone
// signed in but not Nick is bounced home rather than shown a 403 (avoids
// confirming to a curious signed-in customer that /admin is admin-gated).
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?returnTo=/admin");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    redirect("/");
  }

  return user;
}
