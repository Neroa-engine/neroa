"use client";

import { useState } from "react";
import { signInFromPreview, signUpFromPreview } from "@/app/project-preview/actions";

type PreviewAuthGateProps = {
  userName: string;
  error?: string;
  notice?: string;
};

export function PreviewAuthGate({
  userName,
  error,
  notice
}: PreviewAuthGateProps) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");

  return (
    <section className="premium-surface rounded-[32px] p-5 sm:p-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          Account gate
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          I&apos;ve got enough to start shaping your build plan.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          Create your account to save this project, unlock your full roadmap, and continue into the
          project workspace.
        </p>
      </div>

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
        action={mode === "signup" ? signUpFromPreview : signInFromPreview}
        className="mt-6 space-y-5"
      >
        <input type="hidden" name="next" value="/project-preview" />
        <input type="hidden" name="name" value={userName} />

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="input"
              type="password"
              name="password"
              placeholder={mode === "signup" ? "Create a password" : "Your account password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </label>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white/84 px-4 py-4 text-sm leading-7 text-slate-600">
          {mode === "signup"
            ? "New visitors create their account here after the preview so the project can be saved before the full workspace opens."
            : "Returning users can sign in and continue straight into the saved project path without seeing signup again."}
        </div>

        <button className="button-primary w-full sm:w-auto" type="submit">
          {mode === "signup" ? "Create account to continue" : "Sign in to continue"}
        </button>
      </form>
    </section>
  );
}
