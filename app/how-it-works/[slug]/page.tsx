import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicActionLink } from "@/components/site/public-action-link";
import { getHowItWorksPage, howItWorksPages } from "@/lib/marketing-pages";
import { publicLaunchPrimaryCta } from "@/lib/data/public-launch";
import { launchReadyUseCasePages } from "@/lib/use-cases";

type HowItWorksDetailPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return howItWorksPages.map((page) => ({ slug: page.slug }));
}

export default function HowItWorksDetailPage({ params }: HowItWorksDetailPageProps) {
  const page = getHowItWorksPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <MarketingInfoShell ctaHref="/auth" ctaLabel="Open Neroa" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/how-it-works" className="premium-pill text-slate-600 transition hover:text-slate-900">
            Back to how it works
          </Link>
          <Link href="/" className="premium-pill text-slate-600 transition hover:text-slate-900">
            Home
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
              {page.eyebrow} {page.index}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl xl:text-[4.5rem] xl:leading-[0.96]">
              {page.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">{page.intro}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">{page.summary}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PublicActionLink
                href={publicLaunchPrimaryCta.href}
                label={publicLaunchPrimaryCta.label}
                className="button-primary"
              >
                {publicLaunchPrimaryCta.label}
              </PublicActionLink>
              <Link href="/use-cases" className="button-secondary">
                Explore use cases
              </Link>
            </div>
          </div>

          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Outline
              </p>
              <div className="mt-6 grid gap-4">
                {page.outline.map((item, index) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                      Step 0{index + 1}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Related use cases
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Where this system flow becomes active work
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {launchReadyUseCasePages.map((useCase) => (
            <Link
              key={useCase.slug}
              href={`/use-cases/${useCase.slug}`}
              className="micro-glow floating-plane rounded-[28px] p-5"
            >
              <div className="floating-wash rounded-[28px]" />
              <div className="relative">
                <p className="text-xl font-semibold tracking-tight text-slate-950">{useCase.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{useCase.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MarketingInfoShell>
  );
}
