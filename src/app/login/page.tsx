"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import { createClient } from "@/app/lib/supabase/client";

type Mode = "sign-in" | "sign-up";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

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

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="section-head">
          <h1>{mode === "sign-in" ? "Sign In" : "Create Account"}</h1>
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

          {error && <p className="cart-summary__note cart-summary__note--error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "sign-in" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="login-switch">
          {mode === "sign-in" ? (
            <>
              Don&rsquo;t have an account?{" "}
              <button type="button" className="btn-link" onClick={() => setMode("sign-up")}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" className="btn-link" onClick={() => setMode("sign-in")}>
                Sign in
              </button>
            </>
          )}
        </p>

        <Link href="/" className="btn-link">
          Back to home
        </Link>
      </div>
    </section>
  );
}
