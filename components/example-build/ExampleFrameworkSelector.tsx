"use client";

import { motion } from "framer-motion";
import type {
  ExampleBuildType,
  ExampleFramework,
  ExampleIndustry,
  ExampleOpportunityArea
} from "@/lib/marketing/example-build-data";

type ExampleFrameworkSelectorProps = {
  buildType: ExampleBuildType;
  industry: ExampleIndustry | null;
  opportunityArea: ExampleOpportunityArea | null;
  frameworks: ExampleFramework[];
  selectedFrameworkId: string | null;
  onBack: () => void;
  onSelect: (frameworkId: ExampleFramework["id"]) => void;
};

export function ExampleFrameworkSelector({
  buildType,
  industry,
  opportunityArea,
  frameworks,
  selectedFrameworkId,
  onBack,
  onSelect
}: ExampleFrameworkSelectorProps) {
  const contextLabel = industry?.label ?? opportunityArea?.label ?? "your selected context";
  const contextKind = industry ? "Industry" : "Opportunity area";

  return (
    <section className="floating-plane rounded-[34px] p-6 sm:p-8">
      <div className="floating-wash rounded-[34px]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Step 3
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Select a system framework
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Neroa now combines <span className="font-semibold text-slate-950">{buildType.label}</span> with{" "}
              <span className="font-semibold text-slate-950">{contextLabel}</span> and asks one
              strategic question: what kind of system architecture makes the most sense for the
              first build?
            </p>
          </div>

          <button type="button" onClick={onBack} className="button-secondary">
            Change industry or opportunity
          </button>
        </div>

        <div className="comparison-band mt-8">
          <div className="comparison-metric">
            <span className="comparison-label">Product type</span>
            <span className="comparison-value">{buildType.label}</span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">{contextKind}</span>
            <span className="comparison-value">{contextLabel}</span>
          </div>
              <div className="comparison-metric">
                <span className="comparison-label">What this step does</span>
                <span className="comparison-value">
                  It replaces static example logic with a framework choice that shapes scope, stack, and
                  build-path logic.
                </span>
              </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {frameworks.map((framework, index) => {
            const selected = selectedFrameworkId === framework.id;

            return (
              <motion.button
                key={framework.id}
                type="button"
                onClick={() => onSelect(framework.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.28 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className={`micro-glow relative rounded-[30px] border p-6 text-left transition ${
                  selected
                    ? "border-cyan-300/60 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] shadow-[0_22px_58px_rgba(34,211,238,0.16)]"
                    : "border-slate-200/70 bg-white/82"
                }`}
              >
                <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.08),transparent_28%)]" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-600">
                      Framework
                    </span>
                    {selected ? (
                      <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                    {framework.label}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{framework.description}</p>

                  <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                      Why Neroa surfaces this
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{framework.systemValue}</p>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                      Scope anchors
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {framework.scopeAnchors.join(" | ")}
                    </p>
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
