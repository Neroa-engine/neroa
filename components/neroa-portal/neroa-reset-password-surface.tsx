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

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  disabled = false,
  helper
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  disabled?: boolean;
  helper?: ReactNode;
}) {
  return (
    <label className="block space-y-2.5">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/62">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-[1.15rem] border border-white/12 bg-black/20 px-4 py-2.5 shadow-[0_0_28px_rgba(45,212,191,0.05)]">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          placeholder={label}
          disabled={disabled}
          required
          className="h-8 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/28"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {helper ? <div className="text-sm leading-7 text-white/58">{helper}</div> : null}
    </label>
  );
}

function buildStatus(tone: "error" | "success", message: string) {
  return { tone, message };
}

type NeroaResetPasswordSurfaceProps = {
  initialError?: string | null;
  initialNotice?: string | null;
};

export function NeroaResetPasswordSurface({
  initialError = null,
  initialNotice = null
}: NeroaResetPasswordSurfaceProps) {
  const router = useRouter();
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState(
    initialError
      ? buildStatus("error", initialError)
      : initialNotice
        ? buildStatus("success", initialNotice)
        : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setStatus(
        buildStatus("error", "Passwords do not match. Re-enter the same password in both fields.")
      );
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      setStatus(buildStatus("error", error.message));
      setIsSubmitting(false);
      return;
    }

    await supabase.auth.signOut().catch(() => {
      // Continue even if the sign-out step fails; the next page is still the clean sign-in entry.
    });

    router.push(
      "/neroa/auth?notice=" +
        encodeURIComponent("Password updated. Sign in with your new password.")
    );
    router.refresh();
  }

  const passwordsMatch =
    confirmPassword.length === 0 ? null : password === confirmPassword;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.72]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.28)_0%,rgba(4,7,10,0.44)_24%,rgba(3,6,8,0.74)_62%,rgba(3,6,8,0.96)_100%)]" />
        <div className="absolute right-[4%] top-[3%] h-[42rem] w-[34rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.28),transparent_10%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.16),transparent_52%)] blur-xl" />
        <div className="absolute right-[11%] top-[6%] h-[72vh] w-[20rem] bg-[linear-gradient(180deg,rgba(134,255,232,0)_0%,rgba(134,255,232,0.14)_16%,rgba(72,239,200,0.24)_42%,rgba(36,191,156,0.12)_78%,rgba(36,191,156,0)_100%)] [clip-path:polygon(49%_0%,59%_0%,67%_100%,33%_100%)] blur-[12px]" />
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="reset-password-north-star" />
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
            <Link href="/neroa/contact" className="transition hover:text-white">
              Contact
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

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(24rem,34rem)] lg:gap-20 lg:py-16">
          <section className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-teal-200/78">
                Password Recovery
              </p>
              <h1 className="max-w-3xl font-serif text-[clamp(3.25rem,7vw,5.8rem)] leading-[0.95] tracking-[-0.05em] text-white">
                Reset your password inside the clean Neroa auth flow.
              </h1>
              <p className="max-w-2xl text-[1.05rem] leading-8 text-white/66 sm:text-[1.12rem]">
                Update your password, return to sign in, and continue through the same clean Neroa entry path.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Same dark Neroa auth environment",
                "No legacy auth page dependency",
                "Soft silver framing and teal guidance",
                "Clear return path back to sign in"
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
          </section>

          <section className="w-full justify-self-end rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(8,12,16,0.78))] p-5 shadow-[0_34px_120px_rgba(0,0,0,0.46)] backdrop-blur-xl sm:p-6">
            <div className="space-y-3 border-b border-white/8 pb-5">
              <div className="flex items-center gap-2 text-white">
                <NorthStarIcon className="h-4 w-4 text-teal-200/84" />
                <span className="font-serif text-[1.9rem] tracking-tight">Neroa</span>
              </div>

              <div className="space-y-2.5">
                <h2 className="font-serif text-[2.15rem] text-white sm:text-[2.45rem]">
                  Reset Password
                </h2>
                <p className="text-[0.95rem] leading-7 text-white/68">
                  Choose a new password, then head back to the clean sign-in page.
                </p>
              </div>
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

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <PasswordField
                label="New Password"
                value={password}
                onChange={setPassword}
                visible={showPassword}
                onToggleVisibility={() => setShowPassword((current) => !current)}
                disabled={isSubmitting}
                helper="Use at least 6 characters."
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword((current) => !current)}
                disabled={isSubmitting}
                helper={
                  passwordsMatch === null
                    ? "Confirm the same password before updating."
                    : passwordsMatch
                      ? "Passwords match. You are ready to update the password."
                      : "Passwords do not match yet."
                }
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center rounded-[1rem] bg-teal-300 text-sm font-semibold uppercase tracking-[0.2em] text-[#071113] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:bg-teal-200/60"
              >
                {isSubmitting ? "Updating Password..." : "Update Password"}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between gap-4 pt-0.5">
              <Link
                href="/neroa/auth"
                className="text-left text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:text-white"
              >
                Back to Sign In
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
