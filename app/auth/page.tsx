import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { getOptionalUser } from "@/lib/auth";

type AuthPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
    next?: string;
    email?: string;
  };
};

function safeNextPath(value?: string) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/dashboard";
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getOptionalUser();
  const access = resolveAccountPlanAccess(user);
  const next = safeNextPath(searchParams?.next);

  if (user) {
    redirect(access.hasSelectedPlan ? next : "/start?step=plan");
  }

  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="shell relative py-10 lg:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-xl space-y-6">
            <div className="premium-pill w-fit text-slate-600">Existing account access</div>

            <div className="space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Sign in and continue the engine you were already setting up.
              </h1>
              <p className="max-w-md text-base leading-8 text-slate-600">
                `/auth` is now for account access, not first-run signup. New users should start the guided build flow, choose a plan, and create their first engine there.
              </p>
            </div>

            <div className="floating-plane rounded-[28px] p-5">
              <div className="floating-wash rounded-[28px]" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(139,92,246,0.22))] text-sm font-semibold text-slate-950">
                  N
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">Account access only</p>
                  <p className="text-sm text-slate-500">Sign in, then continue into /start or your Engine Board.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Plans", "Account already exists, so plan and engine state stay attached."],
                  ["Engines", "Resume the guided intake or open existing engines without losing context."],
                  ["Support", "Use one account across product, pricing, and support surfaces."]
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl border border-slate-200/70 bg-white/72 px-4 py-4">
                    <p className="text-sm font-medium text-slate-950">{title}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link className="inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-900" href="/start">
              New to Neroa? Start your build instead.
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_34%)] blur-2xl" />
            <div className="panel relative p-8 sm:p-9">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-700">
                  Neroa access
                </p>
                <p className="text-3xl font-semibold text-slate-950">Sign in</p>
                <p className="max-w-md text-sm leading-7 text-slate-600">
                  Use your existing account to continue into the right next step.
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
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
