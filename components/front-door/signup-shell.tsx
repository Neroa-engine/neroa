"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { signInFromSignup, signUpFromSignup } from "@/app/signup/actions";
import { PasswordField } from "@/components/auth/password-field";
import { managedBuildEntryPath } from "@/lib/data/public-launch";
import { APP_ROUTES } from "@/lib/routes";

type SignupShellProps = {
  error?: string;
  notice?: string;
  initialEmail?: string;
  next?: string;
};

function safeNextPath(value?: string) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return APP_ROUTES.dashboard;
}

function describeDestination(nextPath: string) {
  if (nextPath.startsWith("/dashboard")) {
    return "command center entry";
  }

  if (nextPath.startsWith("/start?entry=managed")) {
    return "managed planning center";
  }

  if (nextPath.startsWith("/start")) {
    return "planning center";
  }

  if (nextPath.startsWith("/billing")) {
    return "billing";
  }

  if (nextPath.startsWith("/projects")) {
    return "project area";
  }

  return "account destination";
}

export function SignupShell({ error, notice, initialEmail, next }: SignupShellProps) {
  const [mode, setMode] = useState<"signup" | "signin">(notice ? "signin" : "signup");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const nextPath = safeNextPath(next);
  const isManagedEntry = nextPath === managedBuildEntryPath;
  const destinationLabel = useMemo(() => describeDestination(nextPath), [nextPath]);
  const passwordMatchState =
    mode !== "signup" || confirmPassword.length === 0
      ? "neutral"
      : password === confirmPassword
        ? "match"
        : "mismatch";
  const passwordMismatch = passwordMatchState === "mismatch";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="premium-surface rounded-[34px] p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          Neroa account
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
          Create your account without losing your place.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          This page is only for account access. Create an account if you are new, or sign in if
          you already have one. Neroa will keep the same return target attached throughout auth.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200/75 bg-white/86 p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Create account
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">New to Neroa</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Set your password, confirm your email if required, and continue into the same{" "}
              {destinationLabel}.
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200/75 bg-white/86 p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Sign in
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">Returning user</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Use your existing account and go straight back to the same {destinationLabel} without
              redoing public steps.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,255,0.88))] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Confirmation flow
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-950">Stay in the same browser</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            If email confirmation is enabled, open the confirmation link in this same browser so
            Neroa can complete the session handoff cleanly and return you to the correct next step.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="premium-pill text-slate-600">Destination preserved</span>
            <span className="premium-pill text-slate-600">
              {isManagedEntry ? "Managed lane preserved" : "Account handoff preserved"}
            </span>
          </div>
        </div>
      </section>

      <aside className="premium-surface rounded-[34px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
          Account access
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
          {mode === "signup" ? "Create your account" : "Sign in"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {mode === "signup"
            ? "Create your account, then continue into the exact destination you were already headed toward."
            : "Sign in with your existing Neroa account and continue without changing the current target."}
        </p>

        <div className="mt-5 inline-flex rounded-full border border-slate-200/80 bg-white/84 p-1">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "signin"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Sign in
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <form
          action={mode === "signup" ? signUpFromSignup : signInFromSignup}
          className="mt-6 space-y-5"
        >
          <input type="hidden" name="next" value={nextPath} />

          <div className="grid gap-5">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                className="input"
                type="email"
                name="email"
                defaultValue={initialEmail}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </label>
            {mode === "signup" ? (
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <PasswordField
                  label="Password"
                  name="password"
                  placeholder={mode === "signup" ? "Create a password" : "Your account password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  helperText={mode === "signup" ? "Use at least 6 characters." : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {mode === "signup" ? (
                <div
                  className={`rounded-[20px] p-3 ${
                    passwordMatchState === "mismatch"
                      ? "border border-rose-200/80 bg-rose-50/50"
                      : passwordMatchState === "match"
                        ? "border border-emerald-200/80 bg-emerald-50/50"
                        : ""
                  }`}
                >
                  <PasswordField
                    label="Confirm password"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    helperText={
                      passwordMatchState === "mismatch"
                        ? "Passwords do not match yet."
                        : passwordMatchState === "match"
                          ? "Passwords match. You are ready to create the account."
                          : "Confirm the same password to finish account creation."
                    }
                    helperTone={
                      passwordMatchState === "mismatch"
                        ? "error"
                        : passwordMatchState === "match"
                          ? "success"
                          : "default"
                    }
                  />
                </div>
              ) : (
                <div className="flex items-end">
                  <Link
                    href={`/forgot-password?next=${encodeURIComponent(nextPath)}`}
                    className="text-sm font-medium text-cyan-700 transition hover:text-cyan-900"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/84 px-4 py-4 text-sm leading-7 text-slate-600">
            If Neroa sends a confirmation email, open it in this same browser tab family so the
            confirmation handoff can return you to the right destination cleanly.
          </div>

          <button className="button-primary w-full" type="submit" disabled={passwordMismatch}>
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </aside>
    </div>
  );
}
