"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";

function NorthStarIcon({
  className = ""
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.8 11.8 8.2 18.2 10l-6.4 1.8L10 18.2l-1.8-6.4L1.8 10l6.4-1.8L10 1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="1.1" fill="currentColor" />
    </svg>
  );
}

function AuthField({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  trailingAction
}: {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (nextValue: string) => void;
  autoComplete?: string;
  trailingAction?: ReactNode;
}) {
  return (
    <label className="block space-y-3">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/62">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-[1.2rem] border border-white/12 bg-black/20 px-4 py-3 shadow-[0_0_28px_rgba(45,212,191,0.05)]">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="h-8 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/28"
        />
        {trailingAction}
      </div>
    </label>
  );
}

export function NeroaAuthSurface() {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const passwordToggleClass =
    "text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:text-white";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.72]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.28)_0%,rgba(4,7,10,0.44)_24%,rgba(3,6,8,0.74)_62%,rgba(3,6,8,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(196,255,239,0.14),transparent_10%),radial-gradient(circle_at_73%_22%,rgba(255,255,255,0.06),transparent_18%)]" />
        <div className="absolute right-[4%] top-[3%] h-[42rem] w-[34rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.28),transparent_10%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.16),transparent_52%)] blur-xl" />
        <div className="absolute right-[11%] top-[6%] h-[72vh] w-[20rem] bg-[linear-gradient(180deg,rgba(134,255,232,0)_0%,rgba(134,255,232,0.14)_16%,rgba(72,239,200,0.24)_42%,rgba(36,191,156,0.12)_78%,rgba(36,191,156,0)_100%)] [clip-path:polygon(49%_0%,59%_0%,67%_100%,33%_100%)] blur-[12px]" />
        <div className="absolute bottom-[11rem] left-[-4%] right-[-4%] h-[16rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.12),transparent_60%)]" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.18em] text-white/62 md:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/neroa/pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/neroa/auth" className="transition hover:text-white">
              Sign In
            </Link>
            <Link
              href="/neroa/auth"
              className="inline-flex items-center rounded-full border border-teal-300/45 bg-teal-300/10 px-5 py-3 text-white shadow-[0_0_28px_rgba(45,212,191,0.12)] transition hover:border-teal-200/70 hover:bg-teal-300/16"
            >
              Start Your Project
            </Link>
          </nav>
        </header>

        <div className="flex flex-1 items-center justify-center py-12 lg:py-16">
          <section className="w-full max-w-[34rem] rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(8,12,16,0.78))] p-6 shadow-[0_34px_120px_rgba(0,0,0,0.46)] backdrop-blur-xl sm:p-8">
            <div className="space-y-4 border-b border-white/8 pb-6">
              <div className="flex items-center gap-2 text-white">
                <NorthStarIcon className="h-4 w-4 text-teal-200/84" />
                <span className="font-serif text-[1.9rem] tracking-tight">Neroa</span>
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-4xl text-white sm:text-[2.8rem]">
                  Welcome to Neroa
                </h1>
                <p className="text-[1rem] leading-8 text-white/68">
                  Sign in or create an account to start your project.
                </p>
              </div>
            </div>

            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1.5">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={[
                  "rounded-full px-5 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] transition",
                  mode === "signin"
                    ? "bg-teal-300 text-[#071113]"
                    : "text-white/62 hover:text-white"
                ].join(" ")}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("create")}
                className={[
                  "rounded-full px-5 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] transition",
                  mode === "create"
                    ? "bg-teal-300 text-[#071113]"
                    : "text-white/62 hover:text-white"
                ].join(" ")}
              >
                Create Account
              </button>
            </div>

            {mode === "signin" ? (
              <form onSubmit={handleSignInSubmit} className="mt-8 space-y-5">
                <AuthField
                  label="Email"
                  type="email"
                  value={signInEmail}
                  onChange={setSignInEmail}
                  autoComplete="email"
                />
                <AuthField
                  label="Password"
                  type={showSignInPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={setSignInPassword}
                  autoComplete="current-password"
                  trailingAction={
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword((current) => !current)}
                      className={passwordToggleClass}
                      aria-label={showSignInPassword ? "Hide password" : "Show password"}
                    >
                      {showSignInPassword ? "Hide" : "Show"}
                    </button>
                  }
                />

                <div className="flex items-center justify-between gap-4">
                  {/* TODO: connect this to a clean forgot-password route when that flow is ready. */}
                  <Link
                    href="#"
                    className="text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="flex h-14 w-full items-center justify-center rounded-[1.1rem] bg-teal-300 text-sm font-semibold uppercase tracking-[0.2em] text-[#071113] transition hover:bg-teal-200"
                >
                  Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateSubmit} className="mt-8 space-y-5">
                <AuthField
                  label="Name"
                  value={createName}
                  onChange={setCreateName}
                  autoComplete="name"
                />
                <AuthField
                  label="Email"
                  type="email"
                  value={createEmail}
                  onChange={setCreateEmail}
                  autoComplete="email"
                />
                <AuthField
                  label="Password"
                  type={showCreatePassword ? "text" : "password"}
                  value={createPassword}
                  onChange={setCreatePassword}
                  autoComplete="new-password"
                  trailingAction={
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword((current) => !current)}
                      className={passwordToggleClass}
                      aria-label={showCreatePassword ? "Hide password" : "Show password"}
                    >
                      {showCreatePassword ? "Hide" : "Show"}
                    </button>
                  }
                />
                <AuthField
                  label="Confirm Password"
                  type={showCreatePassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                />

                <button
                  type="submit"
                  className="flex h-14 w-full items-center justify-center rounded-[1.1rem] bg-teal-300 text-sm font-semibold uppercase tracking-[0.2em] text-[#071113] transition hover:bg-teal-200"
                >
                  Create Account
                </button>
              </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
