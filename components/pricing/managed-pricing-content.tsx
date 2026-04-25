"use client";

import Link from "next/link";
import { PublicActionLink } from "@/components/site/public-action-link";
import { buildBillingIntentPath } from "@/lib/billing/catalog";
import { publicLaunchManagedCta } from "@/lib/data/public-launch";
import {
  managedEscalationThresholdCredits,
  managedBuildDisclaimer,
  managedBuildPackageIntro,
  managedBuildPackages
} from "@/lib/pricing/config";

export function ManagedPricingContent({
  initialAuthenticated
}: {
  initialAuthenticated?: boolean;
}) {
  const managedBillingHref = buildBillingIntentPath({
    kind: "addon",
    addOnId: "done-for-you-support"
  });

  return (
    <>
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
            Managed pricing
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem]">
            Managed pricing for build, launch, and management support.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">
            Have Neroa help execute the build when you want more than a DIY subscription with
            monthly Engine Credits.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-[28px] border border-cyan-200/70 bg-[linear-gradient(135deg,rgba(240,249,255,0.94),rgba(255,255,255,0.84))] px-6 py-5">
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
                    Build / setup
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

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200/70 bg-white/80 px-5 py-5">
                  <p className="text-sm font-semibold text-slate-950">Included</p>
                  <div className="mt-3 grid gap-2">
                    {pkg.includes.map((item) => (
                      <div key={item} className="text-sm leading-7 text-slate-600">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,255,255,0.8))] px-5 py-5">
                  <p className="text-sm font-semibold text-slate-950">Not included</p>
                  <div className="mt-3 grid gap-2">
                    {pkg.excludes.map((item) => (
                      <div key={item} className="text-sm leading-7 text-slate-600">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-16">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_0.96fr]">
            <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Managed escalation
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Neroa recommends managed or hybrid execution when credits stop being the right tool on their own.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              DIY plans are meant to keep pacing, scope, and budget visible. When a project crosses
              about {managedEscalationThresholdCredits.toLocaleString()} credits, or the integration
              depth, QA burden, or launch risk becomes more serious, Neroa should say that clearly
              and offer a stronger execution model.
            </p>
            </div>

            <div className="rounded-[28px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,255,255,0.86))] px-6 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Hybrid path
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                Keep lighter planning in DIY, then move heavier execution into Managed Build.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                That usually means strategy, scope, MVP framing, and lighter workflow support stay in
                the DIY lane first. Heavy integrations, QA visibility, launch coordination, and tighter
                delivery oversight move into Managed Build once the project proves the need.
              </p>
            </div>
          </div>

          <div className="comparison-band mt-6">
            <div className="comparison-metric">
              <span className="comparison-label">DIY first</span>
              <span className="comparison-value">
                Use monthly Engine Credits for scope, planning, and lighter execution while the product
                is still being shaped.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Hybrid next</span>
              <span className="comparison-value">
                Add managed execution when the timeline tightens or delivery risk gets heavier.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Managed fully</span>
              <span className="comparison-value">
                Best when the product needs more direct oversight, QA support, and launch coordination
                from the start.
              </span>
            </div>
          </div>
        </div>
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
                Next step
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Open the managed path when the build needs stronger execution support.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Use the managed planning path to start in the right lane first, then continue
                through account access and the tracked managed intake when you are ready to move.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <PublicActionLink
                href={initialAuthenticated ? managedBillingHref : publicLaunchManagedCta.href}
                label={initialAuthenticated ? "Open managed billing" : publicLaunchManagedCta.label}
                className="button-primary"
                initialAuthenticated={initialAuthenticated}
              />
              <Link href="/pricing" className="button-secondary">
                Compare pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
