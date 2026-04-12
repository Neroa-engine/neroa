import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getOptionalUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

type AuthPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
  };
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] pb-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-[-16rem] h-[30rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_42%)]" />
        <div className="absolute right-[-10rem] top-[8rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_58%)] blur-3xl" />
      </div>

      <SiteHeader ctaHref="/" ctaLabel="Back home" />

      <section className="shell relative py-10 lg:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
              Secure account access
            </div>

            <div className="space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Sign in to Neroa and open your workspace command center.
              </h1>
              <p className="max-w-md text-base leading-7 text-white/68">
                Access your premium multi-AI workspace for planning, research, writing, coding, and execution.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(139,92,246,0.22))] text-sm font-semibold text-white">
                  N
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Premium workspace system</p>
                  <p className="text-sm text-white/52">Supabase auth with protected dashboard and workspace routes</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Strategy", "Coordinate planning and decisions"],
                  ["Build", "Move from prompts into output"],
                  ["Execute", "Keep NeuroEngine context in one place"]
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl bg-white/[0.035] px-4 py-4">
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-2 text-xs leading-5 text-white/50">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link className="inline-flex text-sm font-medium text-white/62 transition hover:text-white" href="/">
              Return to the landing page
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_34%)] blur-2xl" />
            <div className="panel relative p-8 sm:p-9">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">
                  Neroa access
                </p>
                <p className="text-3xl font-semibold text-white">Account access</p>
                <p className="max-w-md text-sm leading-6 text-white/68">
                  Use an existing account or create a new one from the same form.
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
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
