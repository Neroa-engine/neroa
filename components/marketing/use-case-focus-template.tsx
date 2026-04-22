import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicActionLink } from "@/components/site/public-action-link";
import type { UseCaseFocusPage } from "@/lib/use-case-focus";
import type { UseCaseDetailPage } from "@/lib/use-cases";

type UseCaseFocusTemplateProps = {
  parentPage: UseCaseDetailPage;
  page: UseCaseFocusPage;
};

export function UseCaseFocusTemplate({ parentPage, page }: UseCaseFocusTemplateProps) {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/use-cases/${parentPage.slug}`}
            className="premium-pill text-slate-600 transition hover:text-slate-900"
          >
            Back to {parentPage.title}
          </Link>
          <Link href="/use-cases" className="premium-pill text-slate-600 transition hover:text-slate-900">
            All use cases
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl xl:text-[4.1rem] xl:leading-[0.98]">
              {page.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">{page.intro}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PublicActionLink
                href={page.primaryCtaHref}
                label={page.primaryCtaLabel}
                className="button-primary"
              />
              <PublicActionLink
                href={page.secondaryCtaHref}
                label={page.secondaryCtaLabel}
                className="button-secondary"
              />
            </div>
          </div>

          <div className="floating-plane relative overflow-hidden rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Why it matters
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">{page.whyItMatters}</p>

              <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/72 p-5">
                <p className="text-sm font-semibold text-slate-950">Where this fits in the workflow</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This detail sits inside the{" "}
                  <Link
                    href={`/use-cases/${parentPage.slug}`}
                    className="font-medium text-cyan-700 transition hover:text-cyan-800"
                  >
                    {parentPage.title}
                  </Link>{" "}
                  flow and supports the wider planning, research, and writing sequence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              What Neroa and Neroa do here
            </p>
            <div className="mt-6 grid gap-4">
              {page.whatNeroaDoes.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 p-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                    Step 0{index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Customer output
            </p>
            <div className="mt-6 grid gap-3">
              {page.outputs.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Continue the flow
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Return to the full use-case path or start the workspace.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                These detail pages explain one part of the workflow. The full Neroa experience still connects planning, research, writing, and execution inside the same project flow.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <PublicActionLink
                href={page.primaryCtaHref}
                label={page.primaryCtaLabel}
                className="button-primary"
              />
              <Link href={`/use-cases/${parentPage.slug}`} className="button-secondary">
                Back to use case
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
