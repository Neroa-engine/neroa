"use client";

import { motion } from "framer-motion";
import type {
  ExampleBuildType,
  ExampleIndustry,
  ExampleIntentMode,
  ExampleIntentOption,
  ExampleOpportunityArea
} from "@/lib/marketing/example-build-data";

type ExampleIntentSelectorProps = {
  buildType: ExampleBuildType;
  intentOptions: ExampleIntentOption[];
  intentMode: ExampleIntentMode | null;
  industries: ExampleIndustry[];
  selectedIndustryId: string | null;
  opportunities: ExampleOpportunityArea[];
  selectedOpportunityAreaId: string | null;
  onModeSelect: (mode: ExampleIntentMode) => void;
  onIndustrySelect: (industryId: ExampleIndustry["id"]) => void;
  onOpportunitySelect: (opportunityId: ExampleOpportunityArea["id"]) => void;
  onBack: () => void;
};

export function ExampleIntentSelector({
  buildType,
  intentOptions,
  intentMode,
  industries,
  selectedIndustryId,
  opportunities,
  selectedOpportunityAreaId,
  onModeSelect,
  onIndustrySelect,
  onOpportunitySelect,
  onBack
}: ExampleIntentSelectorProps) {
  const showingIndustries = intentMode === "known-industry";
  const optionLabel = showingIndustries ? "Industries" : "Hot Opportunity Areas";
  const optionSummary = showingIndustries
    ? "Choose the market Neroa should optimize this example around."
    : "Choose the opportunity zone Neroa should use to shape the framework and example build.";

  return (
    <section className="floating-plane rounded-[34px] p-6 sm:p-8">
      <div className="floating-wash rounded-[34px]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Step 2
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Is this for a specific industry, or are you exploring opportunities?
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              You already chose <span className="font-semibold text-slate-950">{buildType.label}</span>.
              Now Neroa needs to know whether this example should be shaped around a real industry
              you already understand or a hot opportunity area you want to evaluate.
            </p>
          </div>

          <button type="button" onClick={onBack} className="button-secondary">
            Change product type
          </button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {intentOptions.map((option, index) => {
            const selected = intentMode === option.id;

            return (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => onModeSelect(option.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.28 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className={`micro-glow relative rounded-[30px] border p-6 text-left transition ${
                  selected
                    ? "border-cyan-300/60 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] shadow-[0_22px_58px_rgba(34,211,238,0.16)]"
                    : "border-slate-200/70 bg-white/82"
                }`}
              >
                <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_30%)]" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-600">
                      {option.badge}
                    </span>
                    {selected ? (
                      <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                    {option.label}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{option.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {intentMode ? (
          <div className="mt-8">
            <div className="comparison-band">
              <div className="comparison-metric">
                <span className="comparison-label">Now selecting</span>
                <span className="comparison-value">{optionLabel}</span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">Why this matters</span>
                <span className="comparison-value">{optionSummary}</span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">Next step</span>
                <span className="comparison-value">
                  Neroa will rank the strongest framework once this market context is locked in.
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(showingIndustries ? industries : opportunities).map((item, index) => {
                const selected = showingIndustries
                  ? selectedIndustryId === item.id
                  : selectedOpportunityAreaId === item.id;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      showingIndustries
                        ? onIndustrySelect(item.id as ExampleIndustry["id"])
                        : onOpportunitySelect(item.id as ExampleOpportunityArea["id"])
                    }
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.24 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.985 }}
                    className={`micro-glow relative rounded-[28px] border p-5 text-left transition ${
                      selected
                        ? "border-cyan-300/60 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] shadow-[0_22px_58px_rgba(34,211,238,0.16)]"
                        : "border-slate-200/70 bg-white/82"
                    }`}
                  >
                    <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.08),transparent_28%)]" />
                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-600">
                          {buildType.label}
                        </span>
                        {selected ? (
                          <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                        {item.label}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
