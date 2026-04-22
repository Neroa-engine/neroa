"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingInteractiveCardGrid } from "@/components/marketing/interactive-card-system";
import { GrowthLayerPricing } from "@/components/pricing/growth-layer-pricing";
import { PublicActionLink } from "@/components/site/public-action-link";
import { buildBillingIntentPath } from "@/lib/billing/catalog";
import {
  publicLaunchManagedCta,
  publicLaunchPrimaryCta
} from "@/lib/data/public-launch";
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
  initialAuthenticated?: boolean;
};

const workflowStages = [
  "Strategy",
  "Scope",
  "Budget",
  "Build Definition",
  "Build",
  "Test",
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

function getPlanAction(planId: PricingPlanId, authenticated = false) {
  if (authenticated) {
    if (planId === "command-center") {
      return {
        href: buildBillingIntentPath({
          kind: "addon",
          addOnId: "done-for-you-support"
        }),
        label: "Open managed billing",
        className: "button-primary"
      };
    }

    return {
      href: buildBillingIntentPath({
        kind: "plan",
        planId
      }),
      label: planId === "free" ? "Review plan in billing" : "Upgrade in billing",
      className: "button-primary"
    };
  }

  switch (planId) {
    case "free":
      return {
        href: publicLaunchPrimaryCta.href,
        label: "Continue with Free",
        className: "button-primary"
      };
    case "starter":
      return {
        href: publicLaunchPrimaryCta.href,
        label: "Start with Starter",
        className: "button-primary"
      };
    case "builder":
      return {
        href: publicLaunchPrimaryCta.href,
        label: "Choose Builder",
        className: "button-primary"
      };
    case "pro":
      return {
        href: publicLaunchPrimaryCta.href,
        label: "Choose Pro",
        className: "button-primary"
      };
    case "command-center":
      return {
        href: publicLaunchManagedCta.href,
        label: "Start Managed Build",
        className: "button-primary"
      };
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
  intervalId,
  initialAuthenticated
}: {
  plan: PricingPlan;
  intervalId: BillingIntervalId;
  initialAuthenticated?: boolean;
}) {
  const pricing = calculateIntervalPrice(plan.priceMonthly, intervalId);
  const isMonthly = intervalId === "monthly";
  const isFree = plan.priceMonthly === 0;
  const action = getPlanAction(plan.id, initialAuthenticated);
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
          <PublicActionLink
            href={action.href}
            label={action.label}
            className={action.className}
            initialAuthenticated={initialAuthenticated}
          >
            {action.label}
          </PublicActionLink>
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
  topUpBundles,
  initialAuthenticated
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
            Choose a DIY plan based on how much guided build capacity, planning throughput, and monthly Engine Credit coverage your current budget can realistically support.
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

          <div className="mt-6">
            <MarketingInteractiveCardGrid
              items={pricingTermDefinitions.map((item) => ({
                eyebrow: "Pricing term",
                title: item.term,
                description: item.definition,
                expandedDescription:
                  item.term === "Subscription"
                    ? "A Neroa subscription gives access to the guided system plus a recurring monthly Engine Credit pool. It sets the default pace, not an unlimited labor promise."
                    : item.term === "Credits"
                      ? "Engine Credits measure guided planning and execution activity inside Neroa. They make pace, monthly capacity, and acceleration visible without exposing raw token math to customers."
                      : "Managed Build is a separate support layer for scopes that need Neroa or a partner team to carry more execution, QA, deployment, and operating responsibility directly.",
                details:
                  item.term === "Subscription"
                    ? ["Sets recurring access", "Includes a monthly credit pool", "Determines baseline pacing"]
                    : item.term === "Credits"
                      ? ["Visible monthly usage", "Used for planning and execution workflows", "Can be expanded with top-up packs"]
                      : ["Scope-led quote", "Heavier execution support", "Stronger QA and launch coverage"]
              }))}
              columns="three"
              affordanceMode="icon"
            />
          </div>
        </div>
      </section>

      <section className="mt-16">
        <MarketingInteractiveCardGrid
          items={executionCreditActions.map((action) => ({
            eyebrow: action.creditsLabel,
            title: action.label,
            description: action.detail,
            expandedDescription: `${action.detail} This is an example usage band, not a universal promise. Real scope, integrations, review loops, and launch pressure still affect how much guided work the project needs.`,
            details: [
              "Example usage band only",
              "Scope and integrations can move the estimate",
              "Useful for understanding what a heavier month may contain"
            ]
          }))}
          columns="three"
          affordanceMode="icon"
        />
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
            <PricingCard
              key={plan.id}
              plan={plan}
              intervalId={billingIntervalId}
              initialAuthenticated={initialAuthenticated}
            />
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-[28px] border border-cyan-200/70 bg-[linear-gradient(135deg,rgba(240,249,255,0.94),rgba(255,255,255,0.84))] px-6 py-5">
          <p className="text-sm leading-7 text-slate-700">
            If you&apos;re not sure which plan you need, start with the free plan. NEROA will
            recommend when to upgrade based on your scope, pace, and build needs.
          </p>
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

            <div className="mt-6">
              <MarketingInteractiveCardGrid
                items={topUpBundles.map((bundle) => ({
                  eyebrow: bundle.label,
                  title: `${bundle.credits.toLocaleString()} Engine Credits`,
                  description: `${formatMoney(bundle.price)} one-time top-up`,
                  footnote: `${formatMoney(getExecutionCreditPackUnitPrice(bundle))} per credit`,
                  expandedDescription: bundle.detail,
                  details: [
                    "One-time acceleration, not recurring plan capacity",
                    "Useful for heavier months or launch pushes",
                    "Still depends on scoped work, not unlimited delivery"
                  ]
                }))}
                columns="four"
                affordanceMode="icon"
              />
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Support options and limits
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

              <MarketingInteractiveCardGrid
                items={pricingAddOns.map((item) => ({
                  eyebrow: item.availability,
                  title: `${item.label} - ${item.pricing}`,
                  description: item.detail,
                  expandedDescription: `${item.detail} Neroa keeps this separate from the base plan so customers can see whether they need more capacity, more team access, or a heavier support layer.`,
                  details: [
                    `Availability: ${item.availability}`,
                    "Separate from the base subscription",
                    "Best added when the scope proves the need"
                  ]
                }))}
                columns="one"
                affordanceMode="icon"
              />
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
                Choose a starting capacity now, then expand only when the scope proves it.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                If you&apos;re uncertain, start with Free and let NEROA recommend when to upgrade
                based on scope, pace, and execution needs.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PublicActionLink
                href={publicLaunchPrimaryCta.href}
                label="Continue with Free"
                className="button-primary"
                initialAuthenticated={initialAuthenticated}
              >
                Continue with Free
              </PublicActionLink>
              <Link href="/managed-build" className="button-secondary">
                Compare with Managed
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
