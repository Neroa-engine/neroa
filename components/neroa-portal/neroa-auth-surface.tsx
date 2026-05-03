"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
  trailingAction,
  placeholder,
  disabled = false
}: {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (nextValue: string) => void;
  autoComplete?: string;
  trailingAction?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block space-y-2.5">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/62">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-[1.15rem] border border-white/12 bg-black/20 px-4 py-2.5 shadow-[0_0_28px_rgba(45,212,191,0.05)]">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          required
          className="h-8 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/28"
        />
        {trailingAction}
      </div>
    </label>
  );
}

const selectedPlanLabels = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  managed: "Managed Build"
} as const;

type SelectedPlan = keyof typeof selectedPlanLabels;

type NeroaAuthSurfaceProps = {
  selectedPlan?: SelectedPlan;
  hasExplicitPlan?: boolean;
  initialError?: string | null;
  initialNotice?: string | null;
};

type AuthMode = "signin" | "create" | "forgot-password";
type StatusTone = "error" | "success";

function normalizeAuthErrorMessage(message: string) {
  if (message.toLowerCase() === "email not confirmed") {
    return "Email not confirmed. Confirm your email first, then sign in to continue.";
  }

  return message;
}

function buildAuthStatus(tone: StatusTone, message: string) {
  return { tone, message };
}

export function NeroaAuthSurface({
  selectedPlan = "free",
  hasExplicitPlan = false,
  initialError = null,
  initialNotice = null
}: NeroaAuthSurfaceProps) {
  const router = useRouter();
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [mode, setMode] = useState<AuthMode>("signin");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [status, setStatus] = useState(
    initialError
      ? buildAuthStatus("error", initialError)
      : initialNotice
        ? buildAuthStatus("success", initialNotice)
        : null
  );
  const [activeSubmit, setActiveSubmit] = useState<AuthMode | null>(null);
  const [showEmailConfirmationHelp, setShowEmailConfirmationHelp] = useState(false);

  function buildAccountPathForSignIn(plan: SelectedPlan, preservePlan: boolean) {
    if (!preservePlan) {
      return "/neroa/account";
    }

    return `/neroa/account?plan=${plan}`;
  }

  function buildAccountPathForSignup(plan: SelectedPlan) {
    return `/neroa/account?plan=${plan}`;
  }

  function buildCleanConfirmUrl(nextPath: string) {
    const url = new URL("/neroa/auth/confirm", window.location.origin);
    url.searchParams.set("next", nextPath);
    return url.toString();
  }

  function buildResetPasswordPath() {
    return selectedPlan ? `/neroa/auth/reset-password?plan=${selectedPlan}` : "/neroa/auth/reset-password";
  }

  function openMode(nextMode: AuthMode) {
    setMode(nextMode);
    setStatus(null);
    setShowEmailConfirmationHelp(false);

    if (nextMode === "forgot-password" && !forgotPasswordEmail.trim()) {
      setForgotPasswordEmail(signInEmail.trim() || createEmail.trim());
    }
  }

  async function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setShowEmailConfirmationHelp(false);
    setActiveSubmit("signin");

    const email = signInEmail.trim();
    const password = signInPassword;

    if (!email || !password) {
      setStatus(buildAuthStatus("error", "Enter both your email and password to sign in."));
      setActiveSubmit(null);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setStatus(buildAuthStatus("error", normalizeAuthErrorMessage(error.message)));
      setActiveSubmit(null);
      return;
    }

    const destination = buildAccountPathForSignIn(selectedPlan, hasExplicitPlan);
    router.push(destination);
    router.refresh();
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setShowEmailConfirmationHelp(false);
    setActiveSubmit("create");

    const name = createName.trim();
    const email = createEmail.trim();
    const password = createPassword;
    const passwordConfirmation = confirmPassword;

    if (!name) {
      setStatus(buildAuthStatus("error", "Enter your name so Neroa can attach it to the account."));
      setActiveSubmit(null);
      return;
    }

    if (password !== passwordConfirmation) {
      setStatus(
        buildAuthStatus("error", "Passwords do not match. Re-enter the same password in both fields.")
      );
      setActiveSubmit(null);
      return;
    }

    const destination = buildAccountPathForSignup(selectedPlan);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildCleanConfirmUrl(destination),
        data: {
          name,
          full_name: name,
          selected_plan: selectedPlan
        }
      }
    });

    if (error) {
      setStatus(buildAuthStatus("error", normalizeAuthErrorMessage(error.message)));
      setActiveSubmit(null);
      return;
    }

    if (data.session) {
      router.push(destination);
      router.refresh();
      return;
    }

    setStatus(
      buildAuthStatus(
        "success",
        "Account created. Check your email for the confirmation link. After confirming, you'll continue into Neroa with your selected plan."
      )
    );
    setShowEmailConfirmationHelp(true);
    setActiveSubmit(null);
  }

  async function handleForgotPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setActiveSubmit("forgot-password");

    const email = forgotPasswordEmail.trim();

    if (!email) {
      setStatus(buildAuthStatus("error", "Enter your email so Neroa can send the reset link."));
      setActiveSubmit(null);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildCleanConfirmUrl(buildResetPasswordPath())
    });

    if (error) {
      setStatus(buildAuthStatus("error", normalizeAuthErrorMessage(error.message)));
      setActiveSubmit(null);
      return;
    }

    setStatus(
      buildAuthStatus(
        "success",
        "Password reset email sent. Open the link in this same browser to finish updating your password."
      )
    );
    setActiveSubmit(null);
  }

  const passwordToggleClass =
    "text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:text-white";
  const selectedPlanLabel = selectedPlanLabels[selectedPlan];
  const isSigningIn = activeSubmit === "signin";
  const isCreatingAccount = activeSubmit === "create";
  const isResettingPassword = activeSubmit === "forgot-password";

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
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" />
        <div className="absolute bottom-[11rem] left-[-4%] right-[-4%] h-[16rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.12),transparent_60%)]" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/neroa" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.18em] text-white/62 md:flex">
            <Link href="/neroa" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/neroa/pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/neroa/diy-vs-managed" className="transition hover:text-white">
              DIY vs Managed
            </Link>
            <Link href="/neroa/blog" className="transition hover:text-white">
              Blog
            </Link>
            <Link href="/neroa/auth" className="transition hover:text-white">
              Sign In
            </Link>
            <Link
              href="/neroa/pricing"
              className="inline-flex items-center rounded-full border border-teal-300/45 bg-teal-300/10 px-5 py-3 text-white shadow-[0_0_28px_rgba(45,212,191,0.12)] transition hover:border-teal-200/70 hover:bg-teal-300/16"
            >
              Start Your Project
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,34rem)] lg:gap-20 lg:py-16">
          <section className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-teal-200/78">
                Structured Project Access
              </p>
              <h1 className="max-w-3xl font-serif text-[clamp(3.25rem,7vw,5.8rem)] leading-[0.95] tracking-[-0.05em] text-white">
                Start with a plan before the build begins.
              </h1>
              <p className="max-w-2xl text-[1.05rem] leading-8 text-white/66 sm:text-[1.12rem]">
                Neroa helps turn your software idea into a structured roadmap,
                clear scope, key decisions, approvals, and a project workspace
                before execution starts.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Roadmap-first planning",
                "Scope before execution",
                "Decisions and approvals",
                "Evidence and review",
                "Build with direction"
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/72 shadow-[0_0_24px_rgba(45,212,191,0.06)]"
                >
                  <NorthStarIcon className="h-3.5 w-3.5 shrink-0 text-teal-200/78" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <p className="max-w-2xl text-[0.98rem] leading-8 text-white/56">
              Sign in or create an account to begin shaping your project.
            </p>
          </section>

          <section className="w-full justify-self-end rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(8,12,16,0.78))] p-5 shadow-[0_34px_120px_rgba(0,0,0,0.46)] backdrop-blur-xl sm:p-6">
            <div className="space-y-3 border-b border-white/8 pb-5">
              <div className="flex items-center gap-2 text-white">
                <NorthStarIcon className="h-4 w-4 text-teal-200/84" />
                <span className="font-serif text-[1.9rem] tracking-tight">Neroa</span>
              </div>

              <div className="space-y-2.5">
                <h2 className="font-serif text-[2.15rem] text-white sm:text-[2.45rem]">
                  Welcome to Neroa
                </h2>
                <p className="text-[0.95rem] leading-7 text-white/68">
                  Sign in or create an account to start your project.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-teal-100">
                  <NorthStarIcon className="h-3.5 w-3.5 text-teal-200/84" />
                  Selected Plan: {selectedPlanLabel}
                </div>
                {!hasExplicitPlan ? (
                  <p className="max-w-md text-sm leading-7 text-white/56">
                    Starting with Free Project Preview. You can choose or upgrade a plan after account creation.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => openMode("signin")}
                className={[
                  "rounded-full px-4.5 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition",
                  mode === "signin"
                    ? "bg-teal-300 text-[#071113]"
                    : "text-white/62 hover:text-white"
                ].join(" ")}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openMode("create")}
                className={[
                  "rounded-full px-4.5 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition",
                  mode === "create"
                    ? "bg-teal-300 text-[#071113]"
                    : "text-white/62 hover:text-white"
                ].join(" ")}
              >
                Create Account
              </button>
            </div>

            {status ? (
              <div
                className={[
                  "mt-5 rounded-[1.2rem] border px-4 py-3 text-sm leading-7",
                  status.tone === "error"
                    ? "border-rose-300/30 bg-rose-500/10 text-rose-100"
                    : "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                ].join(" ")}
              >
                {status.message}
              </div>
            ) : null}

            {mode === "signin" ? (
              <form onSubmit={handleSignInSubmit} className="mt-6 space-y-4">
                <AuthField
                  label="Email"
                  type="email"
                  value={signInEmail}
                  onChange={setSignInEmail}
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isSigningIn}
                />
                <AuthField
                  label="Password"
                  type={showSignInPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={setSignInPassword}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={isSigningIn}
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

                <div className="flex items-center justify-between gap-4 pt-0.5">
                  <button
                    type="button"
                    onClick={() => openMode("forgot-password")}
                    className="text-left text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:text-white"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="flex h-12 w-full items-center justify-center rounded-[1rem] bg-teal-300 text-sm font-semibold uppercase tracking-[0.2em] text-[#071113] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:bg-teal-200/60"
                >
                  {isSigningIn ? "Signing In..." : "Sign In"}
                </button>
              </form>
            ) : mode === "create" ? (
              <form onSubmit={handleCreateSubmit} className="mt-6 space-y-4">
                <AuthField
                  label="Name"
                  value={createName}
                  onChange={setCreateName}
                  autoComplete="name"
                  placeholder="Your name"
                  disabled={isCreatingAccount}
                />
                <AuthField
                  label="Email"
                  type="email"
                  value={createEmail}
                  onChange={setCreateEmail}
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isCreatingAccount}
                />
                <AuthField
                  label="Password"
                  type={showCreatePassword ? "text" : "password"}
                  value={createPassword}
                  onChange={setCreatePassword}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  disabled={isCreatingAccount}
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
                  placeholder="Confirm your password"
                  disabled={isCreatingAccount}
                />

                <button
                  type="submit"
                  disabled={isCreatingAccount}
                  className="flex h-12 w-full items-center justify-center rounded-[1rem] bg-teal-300 text-sm font-semibold uppercase tracking-[0.2em] text-[#071113] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:bg-teal-200/60"
                >
                  {isCreatingAccount ? "Creating Account..." : "Create Account"}
                </button>

                {showEmailConfirmationHelp ? (
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <Link
                      href="/neroa/pricing"
                      className="text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:text-white"
                    >
                      Back to pricing
                    </Link>
                    <p className="mt-3 text-sm leading-7 text-white/58">
                      Didn&apos;t receive it? Check spam or confirm the email address is correct.
                    </p>
                  </div>
                ) : null}
              </form>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-teal-200/82">
                    Reset Access
                  </p>
                  <p className="text-sm leading-7 text-white/64">
                    Enter your email and Neroa will send a password-reset link that stays inside the clean auth flow.
                  </p>
                </div>

                <AuthField
                  label="Email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={setForgotPasswordEmail}
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isResettingPassword}
                />

                <div className="flex items-center justify-between gap-4 pt-0.5">
                  <button
                    type="button"
                    onClick={() => openMode("signin")}
                    className="text-left text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:text-white"
                  >
                    Back to Sign In
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="flex h-12 w-full items-center justify-center rounded-[1rem] bg-teal-300 text-sm font-semibold uppercase tracking-[0.2em] text-[#071113] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:bg-teal-200/60"
                >
                  {isResettingPassword ? "Sending Reset Link..." : "Send Reset Link"}
                </button>
              </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
