import type { Metadata } from "next";
import Link from "next/link";
import { sendPasswordResetEmail } from "@/app/signup/actions";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { normalizeAppPath } from "@/lib/auth/routes";
import { APP_ROUTES } from "@/lib/routes";

type ForgotPasswordPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
    email?: string;
    next?: string;
  };
};

export const metadata: Metadata = {
  title: "Neroa | Forgot password",
  description:
    "Request a Neroa password reset link and continue the recovery flow in the same browser."
};

export default function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const next = normalizeAppPath(searchParams?.next, APP_ROUTES.dashboard);

  return (
    <MarketingInfoShell
      ctaHref={APP_ROUTES.auth}
      ctaLabel="Back to sign in"
      brandVariant="prominent"
      contentWidth="wide"
      showHelpChat={false}
    >
      <section className="shell py-10 lg:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="premium-surface rounded-[34px] p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Password recovery
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              Reset your password without losing your destination.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Neroa will email a recovery link tied to the same next step you were already heading
              toward. Open the link in this same browser so the session handoff completes cleanly.
            </p>

            <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,255,0.88))] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Recovery notes
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                <li>Use the same email tied to your Neroa account.</li>
                <li>Open the recovery email in this same browser.</li>
                <li>After resetting your password, Neroa will return you to sign in cleanly.</li>
              </ul>
            </div>
          </section>

          <aside className="panel p-8 sm:p-9">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-700">
                Recovery email
              </p>
              <p className="text-3xl font-semibold text-slate-950">Send reset link</p>
              <p className="max-w-md text-sm leading-7 text-slate-600">
                Request a password reset link for your account.
              </p>
            </div>

            {searchParams?.error ? (
              <div className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {searchParams.error}
              </div>
            ) : null}

            {searchParams?.notice ? (
              <div className="mt-5 rounded-2xl border border-emerald-300/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {searchParams.notice}
              </div>
            ) : null}

            <form action={sendPasswordResetEmail} className="mt-8 space-y-5">
              <input type="hidden" name="next" value={next} />
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  className="input"
                  type="email"
                  name="email"
                  defaultValue={searchParams?.email}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>

              <button className="button-primary w-full" type="submit">
                Send password reset email
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-sm font-medium text-slate-500">
              <Link
                href={`/auth?next=${encodeURIComponent(next)}`}
                className="inline-flex transition hover:text-slate-900"
              >
                Back to sign in
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(next)}`}
                className="inline-flex transition hover:text-slate-900"
              >
                Need an account? Create one
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
