import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { pricingScopeDisclaimer } from "@/lib/pricing/config";

const diyValuePoints = [
  "Use guided planning, blueprinting, and scoped execution support without pretending a flat subscription includes unlimited build labor.",
  "Keep the build moving with monthly Engine Credits, hard caps, and optional top-ups when one month runs heavier.",
  "Let Naroa structure the path from idea to blueprint to build while you stay in control of pacing and spend."
] as const;

export default function DiyPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start DIY Build" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
            DIY Build Platform
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
            Build with Neroa&apos;s guided AI system at your own pace.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-600">
            Neroa helps you scope, structure, and guide the build with monthly Engine Credits. It
            gives you guided build capacity, not flat-rate done-for-you development across SaaS,
            apps, mobile products, or marketplaces.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/start" className="button-primary">
            Start DIY Build
          </Link>
          <Link href="/pricing/diy" className="button-secondary">
            View DIY Pricing
          </Link>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {diyValuePoints.map((item) => (
            <div key={item} className="floating-plane rounded-[28px] p-5">
              <div className="floating-wash rounded-[28px]" />
              <div className="relative text-sm leading-7 text-slate-600">{item}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              How DIY pricing works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Subscription plus Engine Credits, not unlimited build labor.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{pricingScopeDisclaimer}</p>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Scope-based credit estimate
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Neroa estimates the credit cost after your scope is defined.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              After guided scope, Neroa shows the selected plan, monthly Engine Credits, estimated
              total credits required, timeline, overage risk, and when to simplify scope, buy
              credits, upgrade, or request a managed build quote.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Want Neroa to build it with you?
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                If you want Neroa or a team to help with execution, QA, deployment, and
                management, explore Managed Build Services.
              </p>
            </div>

            <Link href="/managed-build" className="button-primary">
              View Managed Build Services
            </Link>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
