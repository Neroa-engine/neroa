import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";

export default function PricingPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start DIY Build" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
            Pricing lanes
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem]">
            Choose the Neroa path that matches how you want to build.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">
            DIY subscriptions are access plus monthly Engine Credits. Managed Build is a separate
            service with scoped setup fees and monthly management support.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                DIY Build Platform
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Build with Neroa&apos;s guided AI system at your own pace.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Use monthly Engine Credits for scoped planning, blueprinting, and guided execution.
                Large or complex builds still depend on scope and available credits.
              </p>
              <div className="mt-6 grid gap-3 text-sm leading-7 text-slate-600">
                <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-5 py-4">
                  Monthly subscription access
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-5 py-4">
                  Monthly Engine Credit pool
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-5 py-4">
                  Scoped execution instead of unlimited build labor
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/pricing/diy" className="button-primary">
                  View DIY Pricing
                </Link>
                <Link href="/start" className="button-secondary">
                  Start DIY Build
                </Link>
              </div>
            </div>
          </article>

          <article className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Managed Build Services
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Have Neroa help build, launch, and manage your software.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Managed work uses scoped setup fees plus monthly management for execution, QA,
                deployment help, and operating support.
              </p>
              <div className="mt-6 grid gap-3 text-sm leading-7 text-slate-600">
                <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-5 py-4">
                  Setup and build fee ranges
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-5 py-4">
                  Minimum monthly management ranges
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-5 py-4">
                  Quote-led delivery instead of DIY subscription assumptions
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/pricing/managed" className="button-primary">
                  View Managed Pricing
                </Link>
                <Link href="/contact?type=managed-build-quote" className="button-secondary">
                  Request Managed Build Quote
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
