import { motion } from "framer-motion";
import type {
  ExampleBuildProject,
  ExampleBuildType,
  ExampleFramework,
  ExampleIndustry,
  ExampleOpportunityArea
} from "@/lib/marketing/example-build-data";

export function ExampleProjectSelector({
  buildType,
  industry,
  opportunityArea,
  framework,
  projects,
  selectedProjectId,
  onBack,
  onSelect
}: {
  buildType: ExampleBuildType;
  industry: ExampleIndustry | null;
  opportunityArea: ExampleOpportunityArea | null;
  framework: ExampleFramework;
  projects: ExampleBuildProject[];
  selectedProjectId: string | null;
  onBack: () => void;
  onSelect: (projectId: string) => void;
}) {
  const contextLabel = industry?.label ?? opportunityArea?.label ?? "selected context";

  return (
    <section className="floating-plane rounded-[34px] p-6 sm:p-8">
      <div className="floating-wash rounded-[34px]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Step 4
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Choose the example project Neroa should simulate.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              These projects are filtered by <span className="font-semibold text-slate-950">{buildType.label}</span>,{" "}
              <span className="font-semibold text-slate-950">{contextLabel}</span>, and{" "}
              <span className="font-semibold text-slate-950">{framework.label}</span>. Pick the one
              that feels closest to your product so the guided breakdown reflects the right system.
            </p>
          </div>

          <button type="button" onClick={onBack} className="button-secondary">
            Change framework
          </button>
        </div>

        <div className="comparison-band mt-8">
          <div className="comparison-metric">
            <span className="comparison-label">Product type</span>
            <span className="comparison-value">{buildType.label}</span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">Market context</span>
            <span className="comparison-value">{contextLabel}</span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">Framework</span>
            <span className="comparison-value">{framework.label}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {projects.map((project, index) => {
            const selected = selectedProjectId === project.id;

            return (
              <motion.button
                key={project.id}
                type="button"
                onClick={() => onSelect(project.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.34 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className={`micro-glow relative rounded-[30px] border p-6 text-left transition ${
                  selected
                    ? "border-cyan-300/60 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] shadow-[0_22px_58px_rgba(34,211,238,0.16)]"
                    : "border-slate-200/70 bg-white/82"
                }`}
              >
                <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.1),transparent_28%)]" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-600">
                      {framework.label}
                    </span>
                    {selected ? (
                      <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{project.summary}</p>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                        Audience
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{project.audience}</p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                        Example estimate
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{project.creditEstimate}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-3 text-sm font-medium text-cyan-700">
                      <span>{selected ? "Selected example" : "Open guided breakdown"}</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/70 bg-cyan-50/80 text-base"
                      >
                        &rarr;
                      </span>
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
