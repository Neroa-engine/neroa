"use client";

import { useState } from "react";
import Link from "next/link";
import { GrowthLayerPricing } from "@/components/pricing/growth-layer-pricing";
import {
  calculateIntervalPrice,
  executionCreditActions,
  hardCapPolicyPoints,
  getExecutionCreditPackUnitPrice,
  planningVsBuildProjectsDefinition,
  planScopedEstimateHeadline,
  planScopedEstimateSupport,
  pricingScopeDisclaimer,
  pricingTermDefinitions,
  pricingAddOns,
  teamPricingCallout,
  usageNotificationThresholds,
  type BillingInterval,
  type BillingIntervalId,
  type ExecutionCreditPack,
  type PricingPlan,
  type PricingPlanId
} from "@/lib/pricing/config";

type PublicPricingContentProps = {
  plans: PricingPlan[];
  billingIntervals: BillingInterval[];
  topUpBundles: ExecutionCreditPack[];
};

const workflowStages = [
  "Strategy",
  "Scope",
  "MVP",
  "Budget",
  "Test",
  "Build",
  "Launch",
  "Operate"
] as const;

function formatMoney(value: number | null) {
  if (value === null) {
    return "Custom";
  }

  if (value === 0) {
    return "$0";
  }

  return `$${value.toFixed(2)}`;
}

function getPlanTone(category: PricingPlan["category"]) {
  switch (category) {
    case "trial":
      return "Light entry";
    case "validation":
      return "Validation";
    case "build":
      return "Execution";
    case "scale":
      return "Advanced";
    case "agency":
      return "Agency";
  }
}

function getPlanAction(planId: PricingPlanId) {
  switch (planId) {
    case "free":
      return { href: "/start", label: "Start DIY Build", className: "button-primary" };
    case "starter":
      return { href: "/start", label: "Start DIY Build", className: "button-primary" };
    case "builder":
      return { href: "/start", label: "Start DIY Build", className: "button-primary" };
    case "pro":
      return { href: "/start", label: "Start DIY Build", className: "button-primary" };
    case "command-center":
      return { href: "/start", label: "Start Agency", className: "button-primary" };
  }
}

function getPlanningEngineDisplay(plan: PricingPlan) {
  if (plan.capacity.activePlanningEngines === null) {
    return "Custom";
  }

  return `${plan.capacity.activePlanningEngines} ${plan.capacity.activePlanningEngines === 1 ? "planning engine" : "planning engines"}`;
}

function getBuildProjectDisplay(plan: PricingPlan) {
  if (plan.capacity.activeBuildProjects === null) {
    return "Custom";
  }

  return `${plan.capacity.activeBuildProjects} ${plan.capacity.activeBuildProjects === 1 ? "active build project" : "active build projects"}`;
}

function getCreditsDisplay(plan: PricingPlan) {
  if (plan.capacity.includedExecutionCreditsMonthly === null) {
    return "Custom";
  }

  return `${plan.capacity.includedExecutionCreditsMonthly.toLocaleString("en-US")} / mo`;
}

function getSeatDisplay(plan: PricingPlan) {
  if (plan.capacity.teamSeatsIncluded === null) {
    return "Custom";
  }

  return `${plan.capacity.teamSeatsIncluded} ${plan.capacity.teamSeatsIncluded === 1 ? "seat" : "seats"} included`;
}

function getExtraSeatDisplay(plan: PricingPlan) {
  if (plan.capacity.additionalSeatPriceMonthly === null) {
    return "No extra seats";
  }

  return `+$${plan.capacity.additionalSeatPriceMonthly} / month per additional seat`;
}

function PricingCard({
  plan,
  intervalId
}: {
  plan: PricingPlan;
  intervalId: BillingIntervalId;
}) {
  const pricing = calculateIntervalPrice(plan.priceMonthly, intervalId);
  const isMonthly = intervalId === "monthly";
  const isFree = plan.priceMonthly === 0;
  const action = getPlanAction(plan.id);
  const displayedPrice = isFree
    ? "Free"
    : pricing.effectiveMonthlyPrice === null
      ? "Custom"
      : isMonthly
        ? formatMoney(plan.priceMonthly)
        : formatMoney(pricing.effectiveMonthlyPrice);
  const helperCopy = isFree
    ? "A hard-capped entry point for learning the system before you commit to a deeper build workflow."
    : isMonthly
      ? "Monthly billing keeps the plan flexible while preserving the same capacity."
      : `${formatMoney(pricing.totalPrice)} billed annually. Save ${formatMoney(pricing.savingsAmount)} per year.`;

  return (
    <article
      id={plan.id === "command-center" ? "agency-command" : undefined}
      className="floating-plane relative overflow-hidden rounded-[30px] p-6 sm:p-7"
    >
      <div className="floating-wash rounded-[30px]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-700">{plan.shortLabel}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {plan.usageBandLabel}
            </p>
          </div>
          <span className="premium-pill border-slate-200/70 bg-white/72 text-slate-600">
            {getPlanTone(plan.category)}
          </span>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-end gap-2">
            <p className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-[2.65rem]">
              {displayedPrice}
            </p>
            <p className="pb-1 text-sm font-medium text-slate-500">
              {isFree ? "always free" : isMonthly ? "/month" : "/month effective"}
            </p>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600">{helperCopy}</p>
          <div className="mt-4 rounded-[20px] border border-cyan-200/70 bg-cyan-50/85 px-4 py-4">
            <p className="text-sm font-semibold text-slate-950">{planScopedEstimateHeadline}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{planScopedEstimateSupport}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Who it is for
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{plan.targetUser}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-slate-200/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.64))] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Engine Credits
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{getCreditsDisplay(plan)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {plan.capacity.includedExecutionCreditsNote}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.64))] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Active planning engines
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{getPlanningEngineDisplay(plan)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {plan.capacity.activePlanningEnginesNote}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.64))] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Active build projects
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{getBuildProjectDisplay(plan)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{plan.capacity.activeBuildProjectsNote}</p>
          </div>

          <div className="rounded-[18px] border border-slate-200/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.64))] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Seats
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{getSeatDisplay(plan)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{plan.capacity.teamSeatsNote}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              {getExtraSeatDisplay(plan)}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.64))] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Hard cap policy
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">Yes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{plan.capacity.hardCapControlsNote}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5">
          <p className="text-sm font-semibold text-slate-950">Included in this plan</p>
          <div className="mt-3 grid gap-2">
            {plan.whatYouGet.map((item) => (
              <div key={item} className="text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-950">Workflow stages</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {plan.workflowAccess.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200/70 bg-white/78 px-3 py-2 text-xs font-medium text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
            <p className="text-sm font-semibold text-slate-950">Guided support</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{plan.agentAccess}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
            <p className="text-sm font-semibold text-slate-950">Exports and handoffs</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{plan.exportsAndHandoffs}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
            <p className="text-sm font-semibold text-slate-950">Upgrade trigger</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{plan.upgradeTrigger}</p>
          </div>
        </div>

        {plan.exclusions?.length ? (
          <div className="mt-6 rounded-[24px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(253,230,138,0.2),rgba(255,255,255,0.72))] px-5 py-5">
            <p className="text-sm font-semibold text-slate-950">Not included</p>
            <div className="mt-3 grid gap-2">
              {plan.exclusions.map((item) => (
                <div key={item} className="text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={action.href} className={action.className}>
            {action.label}
          </Link>
          {plan.id === "command-center" ? (
            <Link href="/support" className="button-secondary">
              Get plan help
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function PublicPricingContent({
  plans,
  billingIntervals,
  topUpBundles
}: PublicPricingContentProps) {
  const [billingIntervalId, setBillingIntervalId] = useState<BillingIntervalId>("monthly");

  return (
    <>
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
            DIY pricing
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem]">
            Build with Neroa&apos;s guided AI system at your own pace.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">
            Choose a DIY plan based on how much guided build capacity, planning throughput, and monthly Engine Credit coverage you need.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-slate-500">
            No plan includes flat-rate full-build labor for SaaS, apps, or platforms.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="floating-plane rounded-[30px] p-4 sm:p-5">
            <div className="floating-wash rounded-[30px]" />
            <div className="relative grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
              <div>
                <p className="text-sm font-semibold text-slate-950">How pricing works</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Neroa DIY pricing is built around plan access, included monthly Engine Credits,
                  active planning engines, active build projects, and hard caps that keep usage predictable.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {workflowStages.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200/70 bg-white/78 px-3 py-2 text-xs font-medium text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">Billing interval</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Annual billing is the only discount path and keeps the same plan capacity with a
                  lower effective monthly rate.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {billingIntervals.map((interval) => {
                    const active = interval.id === billingIntervalId;

                    return (
                      <button
                        key={interval.id}
                        type="button"
                        onClick={() => setBillingIntervalId(interval.id)}
                        aria-pressed={active}
                        className={`rounded-[20px] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
                          active
                            ? "border-cyan-300/35 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(139,92,246,0.14))] shadow-[0_18px_44px_rgba(34,211,238,0.12)]"
                            : "border-slate-200/70 bg-white/72 hover:border-cyan-300/30 hover:bg-white/88"
                        }`}
                      >
                        <div className="text-sm font-semibold text-slate-950">{interval.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-600">
                          {interval.savingsLabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-5xl rounded-[28px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,255,255,0.84))] px-6 py-5">
          <p className="text-sm leading-7 text-slate-700">{pricingScopeDisclaimer}</p>
        </div>

        <div className="mx-auto mt-6 max-w-5xl rounded-[28px] border border-slate-200/70 bg-white/82 px-6 py-5">
          <p className="text-sm leading-7 text-slate-700">{planningVsBuildProjectsDefinition}</p>
        </div>
      </section>

      <section className="mt-14">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_0.96fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Engine Credits
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                One usage metric for guided work inside Neroa
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Engine Credits power guided activity inside Neroa, including strategy generation,
                scoping, MVP planning, budget analysis, AI coordination, build workflow
                assistance, testing guidance, launch planning, and structured handoffs.
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200/70 bg-white/72 px-5 py-5">
              <p className="text-sm font-semibold text-slate-950">Why this model is simpler</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                You do not need to track token usage, model pricing, or backend orchestration.
                Choose the number of engines you need, the workflow depth you need unlocked, and
                the monthly Engine Credit pool that matches your pace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {pricingTermDefinitions.map((item) => (
              <div
                key={item.term}
                className="rounded-[22px] border border-slate-200/70 bg-white/72 px-5 py-5"
              >
                <p className="text-sm font-semibold text-slate-950">{item.term}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {executionCreditActions.map((action) => (
            <div key={action.id} className="floating-plane rounded-[26px] p-5">
              <div className="floating-wash rounded-[26px]" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  {action.creditsLabel}
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{action.label}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{action.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Plans
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Choose the level of engine capacity and guided execution that fits how you build.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Every plan makes the engine limit, workflow depth, and monthly Engine Credit pool
            explicit. No vague unlimited messaging, no assumed full-build labor, and no hidden execution model.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} intervalId={billingIntervalId} />
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Engine Credit packs
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Add more capacity later if one month runs heavier.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Plans default to hard caps, so nobody is surprised by usage. If you need more guided
              execution in a busy month, top up instead of assuming the subscription includes unlimited build labor.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {topUpBundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                    {bundle.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {bundle.credits.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Engine Credits</p>
                  <p className="mt-4 text-lg font-semibold text-slate-950">
                    {formatMoney(bundle.price)}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                    {formatMoney(getExecutionCreditPackUnitPrice(bundle))} per credit
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{bundle.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Controls and expansion
            </p>
            <div className="mt-6 grid gap-4">
              {hardCapPolicyPoints.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}

              {pricingAddOns.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-lg font-semibold text-slate-950">{item.label}</p>
                    <p className="text-sm font-semibold text-cyan-700">{item.pricing}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  {item.availability}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GrowthLayerPricing />

      <section className="mt-16">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.96fr] lg:items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Agency and teams
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  {teamPricingCallout.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  {teamPricingCallout.description}
                </p>
              </div>

              <div className="rounded-[26px] border border-slate-200/70 bg-white/72 px-5 py-5">
                <p className="text-sm font-semibold text-slate-950">Notifications</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Neroa warns customers before they run out of included monthly Engine Credits so
                  usage stays visible and easy to manage.
                </p>
                <div className="mt-4 grid gap-3">
                  {usageNotificationThresholds.map((item) => (
                    <div
                      key={item.threshold}
                      className="rounded-[18px] border border-slate-200/70 bg-white/80 px-4 py-4 text-sm leading-7 text-slate-600"
                    >
                      <span className="font-semibold text-slate-950">{item.label}</span> {item.detail}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href={teamPricingCallout.actionHref} className="button-primary">
                    {teamPricingCallout.actionLabel}
                  </Link>
                  <Link href="/support" className="button-secondary">
                    Get pricing help
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Pricing FAQ
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {[
                {
                  question: "What are Engine Credits?",
                  answer:
                    "Engine Credits are the usage metric that powers guided activity inside Neroa, including planning, scoping, MVP definition, budget analysis, coordinated AI support, and execution workflows."
                },
                {
                  question: "How many Engine Credits do I need?",
                  answer:
                    "It depends on how many planning engines you keep active, whether you need a build project unlocked, and how deeply you use Neroa. Lighter users may stay within Free or Starter limits, while active builders and agencies may need Builder, Pro, or Agency / Command Center."
                },
                {
                  question: "Can I cap usage?",
                  answer:
                    "Yes. Plans default to hard caps so users stay in control of monthly Engine Credit usage."
                },
                {
                  question: "What happens if I need more credits?",
                  answer:
                    "Users can upgrade to a higher plan. Add-on Engine Credit packs can also be added later."
                },
                {
                  question: "Do I need a separate plan for every engine?",
                  answer:
                    "No. Plans include active planning-engine capacity plus a separate active build-project limit. Higher tiers increase planning throughput, available build slots, and monthly Engine Credits."
                },
                {
                  question: "Will I be notified before I hit my limit?",
                  answer: `Yes. Neroa notifies users at ${usageNotificationThresholds[0].label} and ${usageNotificationThresholds[1].label} of included monthly Engine Credit usage.`
                }
              ].map((item) => (
                <div
                  key={item.question}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                >
                  <p className="text-lg font-semibold text-slate-950">{item.question}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
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
                Start your build
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Choose the plan that matches your planning throughput and build capacity now, then expand only when the work proves it.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Neroa pricing is designed to stay legible: visible workflow access, visible Engine
                Credits, visible planning-engine and build-project limits, and clear hard-cap controls.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="button-primary">
                Start DIY Build
              </Link>
              <Link href="/managed-build" className="button-secondary">
                View Managed Build Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
