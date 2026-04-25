"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PublicActionLink } from "@/components/site/public-action-link";
import {
  publicLaunchManagedCta,
  publicLaunchPrimaryCta
} from "@/lib/data/public-launch";
import {
  calculateCreditsNeededForTargetMonths,
  calculateScopedBuildMonths,
  getExecutionCreditPackUnitPrice,
  getGrowthLayerScenario,
  getPricingPlan,
  getRecommendedCreditPackMix,
  growthLayerScenarios,
  growthUpgrades,
  planScopedEstimateHeadline,
  pricingScopeDisclaimer,
  shouldEscalateToManagedBuild,
  summarizeCreditPackMix,
  type PricingPlanId
} from "@/lib/pricing/config";

const growthLayerPlanOptions: PricingPlanId[] = [
  "starter",
  "builder",
  "pro",
  "command-center"
];

export function GrowthLayerPricing() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(growthLayerScenarios[1]?.id ?? "customer-saas");
  const selectedScenario = getGrowthLayerScenario(selectedScenarioId) ?? growthLayerScenarios[0];
  const [selectedPlanId, setSelectedPlanId] = useState<PricingPlanId>(selectedScenario.defaultPlanId);

  const selectedPlan = getPricingPlan(selectedPlanId) ?? getPricingPlan("starter");
  const monthlyCredits = selectedPlan?.capacity.includedExecutionCreditsMonthly ?? 0;
  const monthsOnBasePlan = calculateScopedBuildMonths(selectedScenario.totalCredits, monthlyCredits, 0);
  const creditsNeededForAcceleration = calculateCreditsNeededForTargetMonths(
    selectedScenario.totalCredits,
    monthlyCredits,
    selectedScenario.targetAcceleratedMonths
  );
  const recommendedMix = getRecommendedCreditPackMix(creditsNeededForAcceleration);
  const recommendedMixSummary = summarizeCreditPackMix(recommendedMix);
  const acceleratedMonths = calculateScopedBuildMonths(
    selectedScenario.totalCredits,
    monthlyCredits,
    recommendedMixSummary.totalCredits
  );
  const managedEscalation = shouldEscalateToManagedBuild(
    selectedScenario.totalCredits,
    selectedScenario.complexity
  );

  const packComparison = useMemo(
    () =>
      recommendedMix.map((item) => ({
        ...item,
        unitPrice: getExecutionCreditPackUnitPrice(item.pack)
      })),
    [recommendedMix]
  );

  if (!selectedPlan) {
    return null;
  }

  return (
    <section className="mt-16 space-y-6">
      <div className="floating-plane rounded-[34px] p-6 sm:p-8">
        <div className="floating-wash rounded-[34px]" />
        <div className="relative">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Growth layer
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Expand build capacity, accelerate the timeline, or move into a hybrid path when the scope gets heavier.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Neroa&apos;s pricing layer is designed to stay honest after the plan is chosen. Credits
              do not equal unlimited labor. Growth happens through visible acceleration choices,
              optional support layers, and a clear managed escalation path when a build crosses the
              point where self-serve pacing stops being the best answer.
            </p>
          </div>

          <div className="mt-6 rounded-[24px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,255,255,0.86))] px-5 py-5">
            <p className="text-sm font-semibold text-slate-950">{planScopedEstimateHeadline}</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{pricingScopeDisclaimer}</p>
          </div>

          <div className="comparison-band mt-6">
            <div className="comparison-metric">
              <span className="comparison-label">Credit expansion</span>
              <span className="comparison-value">
                Buy additional Engine Credits when the build needs a faster month than the base plan allows.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Acceleration pricing</span>
              <span className="comparison-value">
                Compare the slower base-plan pace against a faster path with a visible credit cost.
              </span>
            </div>
              <div className="comparison-metric">
                <span className="comparison-label">Managed escalation</span>
                <span className="comparison-value">
                  When complexity, QA burden, or launch pressure gets heavy, Neroa recommends a managed or hybrid path instead of vague hope.
                </span>
              </div>
            </div>
        </div>
      </div>

      <div className="floating-plane rounded-[34px] p-6 sm:p-8">
        <div className="floating-wash rounded-[34px]" />
        <div className="relative">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Build acceleration planner
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  See how credits change the timeline.
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Choose an example scope and a plan, then compare the default monthly pace against
                  a faster path unlocked by additional Engine Credits.
                </p>
              </div>

              <div className="grid gap-3">
                <p className="text-sm font-semibold text-slate-950">Example scoped build</p>
                <div className="grid gap-3">
                  {growthLayerScenarios.map((scenario) => {
                    const active = scenario.id === selectedScenario.id;

                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => {
                          setSelectedScenarioId(scenario.id);
                          setSelectedPlanId(scenario.defaultPlanId);
                        }}
                        className={`rounded-[24px] border px-5 py-5 text-left transition ${
                          active
                            ? "border-cyan-300/45 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.86))] shadow-[0_18px_42px_rgba(34,211,238,0.1)]"
                            : "border-slate-200/70 bg-white/82 hover:border-cyan-300/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{scenario.label}</p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{scenario.description}</p>
                          </div>
                          <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-500">
                            {scenario.totalCredits.toLocaleString()} credits
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3">
                <p className="text-sm font-semibold text-slate-950">Compare against plan</p>
                <div className="flex flex-wrap gap-2">
                  {growthLayerPlanOptions.map((planId) => {
                    const plan = getPricingPlan(planId);
                    if (!plan) {
                      return null;
                    }

                    const active = planId === selectedPlanId;

                    return (
                      <button
                        key={planId}
                        type="button"
                        onClick={() => setSelectedPlanId(planId)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "border-cyan-300/45 bg-cyan-50/90 text-cyan-700 shadow-[0_12px_28px_rgba(34,211,238,0.08)]"
                            : "border-slate-200/70 bg-white/78 text-slate-600 hover:border-cyan-300/30"
                        }`}
                      >
                        {plan.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-cyan-300/24 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.86))] px-6 py-6 shadow-[0_20px_48px_rgba(34,211,238,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Timeline comparison
                </p>
                <h4 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Finish in {monthsOnBasePlan ?? "N/A"} months or accelerate to {acceleratedMonths ?? selectedScenario.targetAcceleratedMonths} months.
                </h4>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  On {selectedPlan.label}, this {selectedScenario.label.toLowerCase()} example uses{" "}
                  {selectedPlan.capacity.includedExecutionCreditsMonthly?.toLocaleString() ?? "custom"} monthly
                  Engine Credits. The faster path assumes a one-time credit expansion sized to hit the
                  acceleration target.
                </p>
              </div>

              <div className="comparison-band">
                <div className="comparison-metric">
                  <span className="comparison-label">Selected plan</span>
                  <span className="comparison-value">
                    {selectedPlan.label} with {monthlyCredits.toLocaleString()} included monthly Engine Credits
                  </span>
                </div>
                <div className="comparison-metric">
                  <span className="comparison-label">Base-plan pace</span>
                  <span className="comparison-value">
                    {monthsOnBasePlan ?? "N/A"} months if you stay on the plan only
                  </span>
                </div>
                <div className="comparison-metric">
                  <span className="comparison-label">Accelerated target</span>
                  <span className="comparison-value">
                    {selectedScenario.targetAcceleratedMonths} months with a credit expansion
                  </span>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-[26px] border border-slate-200/70 bg-white/82 px-5 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Stay on base plan
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {monthsOnBasePlan ?? "N/A"} months
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Best when the goal is tight monthly spend and a slower, more deliberate build pace.
                  </p>
                </article>

                <article className="rounded-[26px] border border-cyan-300/35 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.86))] px-5 py-5 shadow-[0_18px_42px_rgba(34,211,238,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Accelerated with credits
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {acceleratedMonths ?? selectedScenario.targetAcceleratedMonths} months
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Add {recommendedMixSummary.totalCredits.toLocaleString()} credits for{" "}
                    ${recommendedMixSummary.totalPrice.toLocaleString()} total and push the work into a faster execution window.
                  </p>
                </article>
              </div>

              <div className="rounded-[28px] border border-slate-200/70 bg-white/82 px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      Recommended credit expansion
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      ${recommendedMixSummary.totalPrice.toLocaleString()} for {recommendedMixSummary.totalCredits.toLocaleString()} credits
                    </p>
                  </div>
                  <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-500">
                    ${recommendedMixSummary.unitPrice.toFixed(3)} per credit
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {packComparison.map((item) => (
                    <div
                      key={item.pack.id}
                      className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {item.quantity} x {item.pack.label}
                          </p>
                          <p className="mt-1 text-sm leading-7 text-slate-600">{item.pack.detail}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-950">
                            ${(item.pack.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                            ${item.unitPrice.toFixed(3)} / credit
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  This is a visible acceleration choice, not hidden labor. The extra credits only buy
                  more guided execution capacity for this scoped build.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contact?type=credit-pack" className="button-primary">
                    Talk to Neroa about credits
                  </Link>
                  <PublicActionLink
                    href={publicLaunchPrimaryCta.href}
                    label="Start with this plan"
                    className="button-secondary"
                  >
                    Start with this plan
                  </PublicActionLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Paid upgrade layer
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Add AI SEO + Marketing Optimization when the build also needs growth support.
            </h3>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Neroa can extend beyond the build itself. If the product also needs SEO review,
              keyword structure, landing-page optimization, and launch-positioning support, this
              becomes a paid growth layer instead of being buried inside the base plan.
            </p>

            <div className="mt-6 grid gap-4">
              {growthUpgrades.map((upgrade) => (
                <article
                  key={upgrade.id}
                  className="rounded-[28px] border border-cyan-300/28 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.86))] px-6 py-6 shadow-[0_18px_40px_rgba(34,211,238,0.08)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl">
                      <p className="text-sm font-semibold text-slate-950">{upgrade.label}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{upgrade.detail}</p>
                    </div>
                    <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                      {upgrade.pricing}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {upgrade.features.map((feature) => (
                      <div
                        key={feature}
                        className="rounded-[20px] border border-slate-200/70 bg-white/80 px-4 py-4 text-sm leading-7 text-slate-600"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {upgrade.availability}
                    </p>
                    <Link href="/contact?type=seo-marketing-upgrade" className="button-secondary">
                      Ask about this upgrade
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Managed escalation logic
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Neroa recommends managed or hybrid execution when the scope crosses the self-serve comfort line.
            </h3>
            <p className="mt-4 text-base leading-8 text-slate-600">
              This selected scenario is rated{" "}
              <span className="font-semibold text-slate-950">{selectedScenario.complexity}</span> and
              estimates {selectedScenario.totalCredits.toLocaleString()} credits. When the scope gets
              heavy enough, Neroa should say that clearly instead of pretending more credits solve every delivery risk.
            </p>

            <div
              className={`mt-6 rounded-[28px] px-6 py-6 ${
                managedEscalation
                  ? "border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,255,255,0.86))]"
                  : "border border-slate-200/70 bg-white/82"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Recommendation
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {managedEscalation
                  ? "This scope crosses Neroa's managed escalation threshold."
                  : "This scope can stay DIY-first, with managed support as an optional later move."}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {managedEscalation
                  ? "Hybrid path: keep strategy, scope, MVP framing, and lighter execution inside DIY, then move heavier integrations, QA, and launch coordination into Managed Build when delivery pressure or operational importance rises."
                  : "Stay on the DIY path first, then move into managed support later if integrations, launch pressure, or operational importance increase."}
              </p>
            </div>

            <div className="comparison-band mt-6">
              <div className="comparison-metric">
                <span className="comparison-label">Complexity</span>
                <span className="comparison-value">{selectedScenario.complexity}</span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">Estimated total credits</span>
                <span className="comparison-value">
                  {selectedScenario.totalCredits.toLocaleString()} credits
                </span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">Hybrid path</span>
                <span className="comparison-value">
                  Scope and MVP in DIY, heavier execution and launch support in Managed Build.
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <PublicActionLink
                href={publicLaunchManagedCta.href}
                label={publicLaunchManagedCta.label}
                className="button-primary"
              />
              <PublicActionLink
                href={publicLaunchManagedCta.href}
                label={publicLaunchManagedCta.label}
                className="button-secondary"
              >
                {publicLaunchManagedCta.label}
              </PublicActionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
