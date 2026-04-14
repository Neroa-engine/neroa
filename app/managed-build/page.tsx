import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import {
  managedBuildDisclaimer,
  managedBuildPackageIntro,
  managedBuildPackages
} from "@/lib/pricing/config";

export default function ManagedBuildPage() {
  return (
    <MarketingInfoShell
      ctaHref="/contact?type=managed-build-quote"
      ctaLabel="Request Managed Build Quote"
      brandVariant="prominent"
    >
      <section className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
            Managed Build Services
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
            Have Neroa help build, launch, and manage your software.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-600">
            Bring Neroa in when you need more than guided DIY planning and execution support.
            Managed Build gives you scoped delivery help, QA, deployment coordination, and ongoing
            management.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/contact?type=managed-build-quote" className="button-primary">
            Request Managed Build Quote
          </Link>
          <Link href="/pricing/managed" className="button-secondary">
            View Managed Pricing
          </Link>
        </div>

        <div className="mt-12 rounded-[30px] border border-cyan-200/70 bg-[linear-gradient(135deg,rgba(240,249,255,0.94),rgba(255,255,255,0.84))] px-6 py-6 sm:px-8">
          <p className="text-sm leading-7 text-slate-700">{managedBuildPackageIntro}</p>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {managedBuildPackages.map((pkg) => (
          <article key={pkg.id} className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                {pkg.label}
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">{pkg.summary}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Setup / build fee
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{pkg.buildFeeRange}</p>
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Monthly management
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {pkg.monthlyManagementRange}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-16">
        <div className="rounded-[30px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,255,255,0.86))] px-6 py-6 sm:px-8">
          <p className="text-sm leading-7 text-slate-700">{managedBuildDisclaimer}</p>
        </div>
      </section>

      <section className="mt-16">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Want to build it yourself?
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                If you prefer a lower-cost guided path, use Neroa DIY with monthly Engine Credits.
              </p>
            </div>

            <Link href="/diy" className="button-primary">
              View DIY Build Platform
            </Link>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
