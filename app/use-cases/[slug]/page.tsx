import Link from "next/link";
import { notFound } from "next/navigation";
import NeroaLogo from "@/components/brand/neroa-logo";
import { getHowItWorksPage, getUseCasePage, howItWorksPages, useCasePages } from "@/lib/marketing-pages";

type UseCaseDetailPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return useCasePages.map((page) => ({ slug: page.slug }));
}

export default function UseCaseDetailPage({ params }: UseCaseDetailPageProps) {
  const page = getUseCasePage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-[-18rem] h-[36rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_42%)]" />
        <div className="absolute right-[-10rem] top-[10rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_58%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,15,32,0.92),rgba(22,28,54,0.82),rgba(45,20,77,0.62))] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-4">
            <NeroaLogo className="h-16 w-auto" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white/90">{page.title}</p>
              <p className="mt-1 text-sm text-white/55">Neroa use case guide</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
          >
            Back home
          </Link>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl">
              {page.heroTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/74">
              {page.intro}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">
              {page.summary}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#3b82f6,#8b5cf6)] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(59,130,246,0.32)]"
              >
                Start Building
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-4 text-sm font-medium text-white/86"
              >
                See how Neroa works
              </Link>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,26,0.96),rgba(16,20,40,0.9),rgba(30,19,52,0.86))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">
              Execution outline
            </p>
            <div className="mt-6 space-y-4">
              {page.workflow.map((step, index) => (
                <div
                  key={step}
                  className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                    Step {index + 1}
                  </p>
                  <p className="mt-3 text-base leading-7 text-white/78">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {page.pillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.022))] p-6"
              >
                <p className="text-2xl font-semibold text-white">{pillar.title}</p>
                <p className="mt-4 text-sm leading-7 text-white/62">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="grid gap-4 lg:grid-cols-3">
            {howItWorksPages.map((item) => (
              <Link
                key={item.slug}
                href={`/how-it-works/${item.slug}`}
                className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,26,0.95),rgba(20,24,45,0.88))] p-6 transition hover:border-white/18 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                  {item.index}
                </p>
                <h2 className="mt-5 text-2xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/60">{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
