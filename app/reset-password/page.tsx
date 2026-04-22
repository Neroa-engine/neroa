import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { getOptionalUser } from "@/lib/auth";
import { normalizeAppPath } from "@/lib/auth/routes";
import { APP_ROUTES } from "@/lib/routes";

type ResetPasswordPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
    next?: string;
  };
};

export const metadata: Metadata = {
  title: "Neroa | Reset password",
  description:
    "Set a new password for your Neroa account and continue the recovery flow cleanly."
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const user = await getOptionalUser();
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
              Reset password
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              Set your new password and continue cleanly.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              This screen only handles the password reset step. Once the password is updated, Neroa
              will send you back to sign in with the same return target preserved.
            </p>

            <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,255,0.88))] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Same-browser recovery
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                If this page says your recovery session is missing, reopen the password-reset email
                in this same browser so Neroa can complete the recovery handoff again.
              </p>
            </div>
          </section>

          <aside className="panel p-8 sm:p-9">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-700">
                New password
              </p>
              <p className="text-3xl font-semibold text-slate-950">Update password</p>
              <p className="max-w-md text-sm leading-7 text-slate-600">
                {user
                  ? "Choose a new password for your Neroa account."
                  : "Your recovery session is not active yet. Open the reset link from your email in this same browser first."}
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

            {user ? (
              <ResetPasswordForm next={next} />
            ) : (
              <div className="mt-8 space-y-4">
                <div className="rounded-[24px] border border-slate-200/75 bg-slate-50/90 p-5 text-sm leading-7 text-slate-600">
                  Open the password-reset link from your email in this same browser, then return to
                  this page if needed.
                </div>
                <div className="flex flex-col gap-3 text-sm font-medium text-slate-500">
                  <Link
                    href={`/forgot-password?next=${encodeURIComponent(next)}`}
                    className="inline-flex transition hover:text-slate-900"
                  >
                    Request a new reset link
                  </Link>
                  <Link
                    href={`/auth?next=${encodeURIComponent(next)}`}
                    className="inline-flex transition hover:text-slate-900"
                  >
                    Back to sign in
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
