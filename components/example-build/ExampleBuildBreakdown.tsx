import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BuildPathComparison } from "@/components/example-build/BuildPathComparison";
import { ExampleBuildFinalCTA } from "@/components/example-build/ExampleBuildFinalCTA";
import { ExampleFlowTimeline } from "@/components/example-build/ExampleFlowTimeline";
import type {
  ExampleBuildProject,
  ExampleBuildType,
  ExampleFramework,
  ExampleIndustry,
  ExampleOpportunityArea
} from "@/lib/marketing/example-build-data";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-7 text-slate-600">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ExampleBuildBreakdown({
  buildType,
  industry,
  opportunityArea,
  framework,
  project,
  onBackToProjects,
  onBackToFrameworks,
  onBackToIntent,
  onBackToTypes,
  onSelectPath,
  finalSection
}: {
  buildType: ExampleBuildType;
  industry: ExampleIndustry | null;
  opportunityArea: ExampleOpportunityArea | null;
  framework: ExampleFramework;
  project: ExampleBuildProject;
  onBackToProjects: () => void;
  onBackToFrameworks: () => void;
  onBackToIntent: () => void;
  onBackToTypes: () => void;
  onSelectPath: (pathId: "diy" | "managed" | "pricing", pathLabel: string) => void;
  finalSection?: ReactNode;
}) {
  const recommendedPath =
    project.buildPaths.find((path) => path.recommended)?.label ?? "Choose the path that fits you";
  const contextLabel = industry?.label ?? opportunityArea?.label ?? "Selected context";

  return (
    <div className="space-y-6">
      <section className="section-stage px-6 py-7 sm:px-8 sm:py-8">
        <div className="floating-wash rounded-[34px]" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                Step 5
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Example build breakdown: {project.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{project.summary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                This is where the simulation becomes useful. Neroa now translates the selected
                product type, market context, framework, and example project into a first-release
                plan you can actually compare.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={onBackToProjects} className="button-secondary">
                Change example project
              </button>
              <button type="button" onClick={onBackToFrameworks} className="button-secondary">
                Change framework
              </button>
              <button type="button" onClick={onBackToIntent} className="button-secondary">
                Change industry or opportunity
              </button>
              <button type="button" onClick={onBackToTypes} className="button-secondary">
                Change product type
              </button>
            </div>
          </div>

          <div className="comparison-band mt-8">
            <div className="comparison-metric">
              <span className="comparison-label">Product type</span>
              <span className="comparison-value">{buildType.label}</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Industry or opportunity</span>
              <span className="comparison-value">{contextLabel}</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Framework</span>
              <span className="comparison-value">{framework.label}</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Example estimate</span>
              <span className="comparison-value">{project.creditEstimate}</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Best example fit</span>
              <span className="comparison-value">{recommendedPath}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="floating-plane rounded-[32px] p-6"
        >
          <div className="floating-wash rounded-[32px]" />
          <div className="relative">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Strategy
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              What problem this product solves and who it is for
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Neroa locks this in first so the build does not drift into a pile of features without
              a clear user and business reason.
            </p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Problem
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{project.problem}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Audience
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{project.audience}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04 }}
          className="floating-plane rounded-[32px] p-6"
        >
          <div className="floating-wash rounded-[32px]" />
          <div className="relative">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Scope
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              The pieces Neroa would organize before build execution
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Scope is where the example starts feeling real. The {framework.label.toLowerCase()}
              choice now shapes the modules, the first-build boundary, and what stays deferred until
              later phases.
            </p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Core features
                  </p>
                  <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-500">
                    {project.coreFeatures.length} signals
                  </span>
                </div>
                <BulletList items={project.coreFeatures} />
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Key modules
                  </p>
                  <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-500">
                    {project.keyModules.length} modules
                  </span>
                </div>
                <BulletList items={project.keyModules} />
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    What belongs in the first build
                  </p>
                  <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-500">
                    {project.firstBuild.length} first moves
                  </span>
                </div>
                <BulletList items={project.firstBuild} />
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="floating-plane rounded-[32px] p-6"
        >
          <div className="floating-wash rounded-[32px]" />
          <div className="relative">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              MVP
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              The smallest valuable version of this example
            </h3>
            <p className="mt-4 text-base leading-8 text-slate-600">{project.mvpSummary}</p>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              This keeps the product honest. Instead of imagining the whole future platform, Neroa
              shows what the first meaningful release needs to prove.
            </p>
            <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Included in the MVP
                </p>
                <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-500">
                  {project.mvpIncluded.length} locked-in pieces
                </span>
              </div>
              <BulletList items={project.mvpIncluded} />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.12 }}
          className="floating-plane rounded-[32px] p-6"
        >
          <div className="floating-wash rounded-[32px]" />
          <div className="relative">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Budget / Credits
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Illustrative budget pacing for this example
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              This estimate is here to make the simulation concrete, not to pretend the product has
              already been live-scoped by the real build engine.
            </p>
            <div className="mt-6 rounded-[26px] border border-cyan-300/30 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.82))] px-5 py-5 shadow-[0_20px_48px_rgba(34,211,238,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Example estimate
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {project.creditEstimate}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{project.estimateNote}</p>
            </div>
          </div>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.16 }}
        className="floating-plane rounded-[32px] p-6"
      >
        <div className="floating-wash rounded-[32px]" />
        <div className="relative">
          <div className="max-w-3xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Systems layer
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Example systems Neroa would likely connect for this build
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              The systems layer adapts to the selected product type and framework so the simulation
              feels more like a real implementation path and less like a static concept page.
            </p>
          </div>

          <div className="comparison-band mt-6">
            <div className="comparison-metric">
              <span className="comparison-label">Stack direction</span>
              <span className="comparison-value">{project.stackRecommendation.headline}</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Why this stack</span>
              <span className="comparison-value">{project.stackRecommendation.summary}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {project.stackRecommendation.systems.map((system) => (
              <div
                key={system.label}
                className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  {system.label}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{system.role}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <ExampleFlowTimeline />
      <BuildPathComparison paths={project.buildPaths} />
      {finalSection ?? (
        <ExampleBuildFinalCTA
          buildType={buildType}
          industry={industry}
          opportunityArea={opportunityArea}
          framework={framework}
          project={project}
          onSelectPath={onSelectPath}
        />
      )}
    </div>
  );
}
