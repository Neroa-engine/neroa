import type { Dispatch, SetStateAction } from "react";
import { GuidedModeToggle } from "@/components/onboarding/guided-mode-toggle";
import {
  buildRealBuilderSelectionSummary,
  type RealBuilderPlan,
  type RealBuilderState
} from "@/lib/onboarding/real-diy-builder";
import type { ExampleBuildProject } from "@/lib/marketing/example-build-data";

type ExampleBuildEntrySidebarProps = {
  guidedMode: boolean;
  setGuidedMode: (next: boolean) => void;
  state: RealBuilderState;
  assistMessage: string;
  restoredFromSaved: boolean;
  carriedSummary: string;
  referenceProject: ExampleBuildProject | null;
  plan: RealBuilderPlan | null;
  onReset: () => void;
  onSave: () => void;
};

export function ExampleBuildEntrySidebar({
  guidedMode,
  setGuidedMode,
  state,
  assistMessage,
  restoredFromSaved,
  carriedSummary,
  referenceProject,
  plan,
  onReset,
  onSave
}: ExampleBuildEntrySidebarProps) {
  return (
      <aside className="xl:sticky xl:top-28">
        <section className="section-stage px-5 py-5">
          <div className="floating-wash rounded-[32px]" />
          <div className="relative space-y-4">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Example Build simulation
            </span>
            <p className="text-sm leading-7 text-slate-600">
              This route now mirrors the real builder step architecture. The final output stays
              clearly simulated so the reference project and estimate read as guidance, not as live
              scoped commitments.
            </p>
            <GuidedModeToggle guidedMode={guidedMode} onToggle={setGuidedMode} compact />
            <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Selection summary
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {buildRealBuilderSelectionSummary(state) ||
                  "Choose product type and build stage to begin the simulation."}
              </p>
            </div>
            <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Neroa context
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{assistMessage}</p>
            </div>
            {restoredFromSaved && carriedSummary ? (
              <div className="rounded-[22px] border border-cyan-300/25 bg-cyan-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Restored simulation
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{carriedSummary}</p>
              </div>
            ) : null}
            {referenceProject ? (
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Matched reference example
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{referenceProject.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{referenceProject.creditEstimate}</p>
              </div>
            ) : null}
            {plan ? (
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Build plan snapshot
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{plan.frameworkLabel}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{plan.estimateRangeLabel}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{plan.recommendedPathLabel}</p>
              </div>
            ) : null}
            <button type="button" className="button-secondary w-full" onClick={onReset}>
              Reset simulation
            </button>
            <button
              type="button"
              className="button-secondary w-full"
              onClick={onSave}
            >
              Save simulation
            </button>
          </div>
        </section>
      </aside>
  );
}

