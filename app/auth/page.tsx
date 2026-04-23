import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { getOptionalUser } from "@/lib/auth";
import { normalizeAppPath } from "@/lib/auth/routes";
import { APP_ROUTES } from "@/lib/routes";

type AuthPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
    next?: string;
    email?: string;
  };
};

export const metadata: Metadata = {
  title: "Neroa | Continue into Neroa",
  description:
    "Sign in or create your Neroa account, then continue into planning, roadmap review, or your active workspace without losing the next step you already started."
};

function describeNextStep(next: string) {
  if (next.startsWith(APP_ROUTES.start)) {
    return {
      label: "Strategy Room",
      summary:
        "Sign in and Neroa takes you back into the guided planning flow so you can keep shaping the roadmap from the same starting point."
    };
  }

  if (
    next.startsWith("/workspace/") ||
    next.startsWith(APP_ROUTES.projects) ||
    next.startsWith(APP_ROUTES.dashboard)
  ) {
    return {
      label: "Current workspace",
      summary:
        "Sign in and Neroa returns you to the workspace, previews, and current build thread you were already using."
    };
  }

  if (next.startsWith(APP_ROUTES.billing)) {
    return {
      label: "Account step",
      summary:
        "Sign in and Neroa returns you to the account step you were already completing."
    };
  }

  return {
    label: "Continue in Neroa",
    summary:
      "Sign in once and Neroa sends you back to the right next step without making you restart the flow."
  };
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getOptionalUser();
  const next = normalizeAppPath(searchParams?.next, APP_ROUTES.dashboard);
  const destination = describeNextStep(next);

  if (user) {
    redirect(next);
  }

  return (
    <MarketingInfoShell
      ctaHref={`/signup?next=${encodeURIComponent(next)}`}
      ctaLabel="Create account"
      brandVariant="prominent"
      showHelpChat={false}
    >
      <section className="shell relative py-10 lg:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-xl space-y-6">
            <div className="premium-pill w-fit text-slate-600">Enter Neroa</div>

            <div className="space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Continue into your build.
              </h1>
              <p className="max-w-md text-base leading-8 text-slate-600">
                Sign in or create an account to return to the plan, roadmap, or workspace already
                waiting for you. Neroa keeps the next step attached so you can move straight back
                into the guided flow.
              </p>
            </div>

            <div className="floating-plane rounded-[28px] p-5">
              <div className="floating-wash rounded-[28px]" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Next step saved
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {destination.label}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {destination.summary}
                </p>
              </div>

              <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  [
                    "Sign in",
                    "Use your existing Neroa account and return to the same planning or workspace step."
                  ],
                  [
                    "Create account",
                    "Set up a new account without losing the product path you already started."
                  ],
                  [
                    "Keep momentum",
                    "Roadmap, progress, previews, and approvals stay attached after account entry."
                  ]
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-slate-200/70 bg-white/72 px-4 py-4"
                  >
                    <p className="text-sm font-medium text-slate-950">{title}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200/75 bg-white/82 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Strategy Room first
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">Start with the plan</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  If you are just getting started, Neroa brings you into the guided planning flow
                  before the rest of the build starts moving.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/75 bg-white/82 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Continuous product flow
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">Keep your place</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Neroa keeps the product thread intact so you can return to the roadmap,
                  previews, or approvals you were already working through.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm font-medium text-slate-500">
              <Link
                className="inline-flex transition hover:text-slate-900"
                href={`/signup?next=${encodeURIComponent(next)}`}
              >
                Create an account instead
              </Link>
              <Link className="inline-flex transition hover:text-slate-900" href="/">
                Back to the Neroa front door
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_34%)] blur-2xl" />
            <div className="panel relative p-8 sm:p-9">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-700">
                  Continue in Neroa
                </p>
                <p className="text-3xl font-semibold text-slate-950">Sign in</p>
                <p className="max-w-md text-sm leading-7 text-slate-600">
                  Use your account to continue planning, review the current roadmap, and keep the
                  build moving from the same customer-facing flow.
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

              <div className="mt-8">
                <AuthForm next={next} initialEmail={searchParams?.email} />
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200/75 bg-slate-50/90 p-5">
                <p className="text-sm font-semibold text-slate-950">New to Neroa?</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Create an account and return to the same plan, workspace, or next step after
                  sign-up.
                </p>
                <Link
                  href={`/signup?next=${encodeURIComponent(next)}`}
                  className="button-secondary mt-4 w-full justify-center"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
