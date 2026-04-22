import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { getOptionalUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

type AuthPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
  };
};

export const metadata: Metadata = {
  title: "Neroa | Continue into Neroa",
  description:
    "Sign in or create your Neroa account, then continue into planning, roadmap review, or your active workspace inside Neroa."
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#060816] pb-16 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_46%)]" />
      <div className="pointer-events-none absolute right-[-10rem] top-[8rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18),transparent_58%)] blur-3xl" />

      <SiteHeader ctaHref="/" ctaLabel="Back to Neroa" />

      <section className="shell relative py-10 lg:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/[0.08] px-4 py-2 text-sm text-cyan-100/84">
              Enter Neroa
            </div>

            <div className="space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Continue into your build.
              </h1>
              <p className="max-w-md text-base leading-8 text-slate-300">
                Sign in to continue inside Neroa, review your current build context, and move back
                into the guided product flow without dropping into raw utility tooling.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                What this entry is for
              </p>
              <p className="mt-3 text-lg font-semibold text-white">Continue into Neroa</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Use this page when you already have an account and want to move back into planning,
                roadmap review, workspace visibility, and the current build thread.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  [
                    "Sign in",
                    "Use your existing Neroa account and move back into the guided build experience."
                  ],
                  [
                    "Create account",
                    "Create access if you are just joining Neroa and need to enter the product for the first time."
                  ],
                  [
                    "Keep momentum",
                    "Roadmap, progress, previews, and approvals stay connected once you are inside the product."
                  ]
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl bg-white/[0.035] px-4 py-4">
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                  Strategy Room first
                </p>
                <p className="mt-3 text-lg font-semibold text-white">Start with the plan</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  If you are just getting started, Neroa brings you into the guided planning flow
                  before the rest of the build starts moving.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                  Continuous product flow
                </p>
                <p className="mt-3 text-lg font-semibold text-white">Return cleanly</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  Move back into planning, roadmap review, previews, and approvals from the same
                  premium product shell.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm font-medium text-slate-400">
              <Link
                className="inline-flex transition hover:text-white"
                href="/start"
              >
                New here? Start planning instead
              </Link>
              <Link className="inline-flex transition hover:text-white" href="/">
                Back to the Neroa front door
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_34%)] blur-2xl" />
            <div className="panel relative p-8 sm:p-9">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">
                  Continue in Neroa
                </p>
                <p className="text-3xl font-semibold text-white">Sign in</p>
                <p className="max-w-md text-sm leading-7 text-slate-400">
                  Use your account to continue planning, review the current roadmap, and keep the
                  build moving from the same customer-facing flow.
                </p>
              </div>

              {searchParams?.error ? (
                <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {searchParams.error}
                </div>
              ) : null}

              {searchParams?.notice ? (
                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                  {searchParams.notice}
                </div>
              ) : null}

              <div className="mt-8">
                <AuthForm />
              </div>

              <div className="mt-6 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-sm font-semibold text-white">New to Neroa?</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  If you are starting fresh, begin in Strategy Room and then enter Neroa from the
                  guided build flow.
                </p>
                <Link href="/start" className="button-secondary mt-4 w-full justify-center">
                  Start planning
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
