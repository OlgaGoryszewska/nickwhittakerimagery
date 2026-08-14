"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import { createClient } from "@/app/lib/supabase/client";

// Landed on via the link in a "reset your password" email. Supabase's
// default email template points at its own hosted /verify endpoint, which
// redirects here with the session in the URL *fragment*
// (#access_token=...&refresh_token=...) rather than query params — a
// fragment the server never sees, only the browser, so this has to run
// client-side. The cookie-backed browser client here doesn't auto-adopt
// fragment tokens the way plain supabase-js does with localStorage, so
// they're parsed and handed to setSession() explicitly below.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function establishSession() {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        // Drop the tokens from the address bar now that they've been consumed.
        window.history.replaceState(null, "", window.location.pathname);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasSession(Boolean(user));
      setCheckingSession(false);
      // The header reads session state from cookies via a Server Component
      // at initial page load, before this ran — refresh so it picks up the
      // session set above instead of still showing "Sign In".
      if (user) router.refresh();
    }

    establishSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
  }

  if (checkingSession) {
    return null;
  }

  if (done) {
    return (
      <section className="tight">
        <div className="wrap">
          <Reveal className="section-head">
            <h1>Password updated</h1>
            <p className="lede">Your password has been changed — you&rsquo;re signed in.</p>
          </Reveal>
          <Link href="/account" className="btn btn-primary">
            Go to My Account
          </Link>
        </div>
      </section>
    );
  }

  if (!hasSession) {
    return (
      <section className="tight">
        <div className="wrap">
          <Reveal className="section-head">
            <h1>Reset link expired</h1>
            <p className="lede">This password reset link is invalid or has expired.</p>
          </Reveal>
          <Link href="/login" className="btn btn-outline">
            Request a new link
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>Set a new password</h1>
        </Reveal>

        <form className="checkout-form login-form" onSubmit={handleSubmit}>
          <div className="purchase-field">
            <label className="purchase-field__label" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="purchase-field">
            <label className="purchase-field__label" htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              className="field-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="cart-summary__note cart-summary__note--error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </section>
  );
}
