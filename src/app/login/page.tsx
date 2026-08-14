"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import { createClient } from "@/app/lib/supabase/client";

type Mode = "sign-in" | "sign-up" | "forgot-password";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/account";

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    if (mode === "forgot-password") {
      // Points straight at the client page rather than the server-side
      // /auth/confirm route: Supabase's default "Reset Password" email
      // template links to its own hosted /verify endpoint, which redirects
      // here with the session in the URL fragment (#access_token=...), not
      // as query params — a fragment the server never sees, only the
      // browser. The Supabase browser client auto-detects it from
      // window.location on load, which is what /reset-password relies on.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setSubmitting(false);
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setResetLinkSent(true);
      return;
    }

    if (mode === "sign-up") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(returnTo)}` },
      });
      setSubmitting(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setCheckEmail(true);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(returnTo);
    router.refresh();
  }

  if (checkEmail) {
    return (
      <section className="tight">
        <div className="wrap">
          <Reveal className="section-head">
            <h1>Check your email</h1>
            <p>We&rsquo;ve sent a confirmation link to {email} — click it to finish creating your account.</p>
          </Reveal>
        </div>
      </section>
    );
  }

  if (resetLinkSent) {
    return (
      <section className="tight">
        <div className="wrap">
          <Reveal className="section-head">
            <h1>Check your email</h1>
            <p>{`If an account exists for ${email}, we've sent a link to reset the password — click it to choose a new one.`}</p>
          </Reveal>
          <Link href="/login" className="btn-link">
            Back to sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>{mode === "sign-in" ? "Sign In" : mode === "sign-up" ? "Create Account" : "Reset Password"}</h1>
        </Reveal>

        <form className="checkout-form login-form" onSubmit={handleSubmit}>
          <div className="purchase-field">
            <label className="purchase-field__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {mode !== "forgot-password" && (
            <div className="purchase-field">
              <label className="purchase-field__label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                minLength={6}
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {mode === "sign-in" && (
            <button
              type="button"
              className="btn-link login-forgot-password"
              onClick={() => {
                setMode("forgot-password");
                setError(null);
              }}
            >
              Forgot password?
            </button>
          )}

          {error && <p className="cart-summary__note cart-summary__note--error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign In"
                : mode === "sign-up"
                  ? "Create Account"
                  : "Send Reset Link"}
          </button>
        </form>

        <p className="login-switch">
          {mode === "sign-in" && (
            <>
              Don&rsquo;t have an account?{" "}
              <button type="button" className="btn-link" onClick={() => setMode("sign-up")}>
                Create one
              </button>
            </>
          )}
          {mode === "sign-up" && (
            <>
              Already have an account?{" "}
              <button type="button" className="btn-link" onClick={() => setMode("sign-in")}>
                Sign in
              </button>
            </>
          )}
          {mode === "forgot-password" && (
            <button type="button" className="btn-link" onClick={() => setMode("sign-in")}>
              Back to sign in
            </button>
          )}
        </p>

        <Link href="/" className="btn-link">
          Back to home
        </Link>
      </div>
    </section>
  );
}
