import Link from "next/link";
import { AiGrid } from "@/components/ai-system/ai-grid";
import NaruaCore from "@/components/ai/NaruaCore";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { publicLaunchPrimaryCta } from "@/lib/data/public-launch";
import { getExecutionRoutingModel } from "@/lib/workspace/execution-orchestration";

export function AiSystemOverviewPage() {
  const orchestrationModel = getExecutionRoutingModel();

  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
            AI System
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem]">
            Naroa at the core, specialized AI systems in active support.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">
            Neroa works as a coordinated AI build system. Naroa leads the user-facing
            flow, the specialist AI systems frame the work, GitHub stores the source of
            truth, and backend build-review systems turn on only when implementation or
            review is required.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/system/narua" className="button-primary">
              Explore Naroa
            </Link>
            <Link href={publicLaunchPrimaryCta.href} className="button-secondary">
              {publicLaunchPrimaryCta.label}
            </Link>
          </div>
        </div>

        <NaruaCore
          href="/system/narua"
          ctaLabel="View Naroa system page"
          supportingAgentIds={["forge", "atlas", "repolink", "nova", "pulse", "ops"]}
          className="mx-auto w-full max-w-[620px]"
        />
      </section>

      <section className="mt-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Execution model
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Neroa coordinates the right system for each stage of the build.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            The branded Naroa team frames the build, while backend execution and review
            systems step in behind the scenes when the work needs code implementation or
            second-pass review.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {orchestrationModel.map((item) => (
            <div key={item.id} className="floating-plane rounded-[28px] p-5">
              <div className="floating-wash rounded-[28px]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {item.label}
                  </p>
                  <span className="rounded-full border border-slate-200/70 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Supporting systems
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Each AI has a real role, activation moment, and practical output.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            These pages explain what each specialist system does, when it becomes active,
            and how it works with Naroa inside the broader operating model.
          </p>
        </div>

        <AiGrid />
      </section>
    </MarketingInfoShell>
  );
}
