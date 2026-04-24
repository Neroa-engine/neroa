"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { PublicActionLink } from "@/components/site/public-action-link";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
import type { SaasBinaryChoice, SaasGuidanceMode } from "@/lib/onboarding/saas-intake";

type SaasIntakeFlowProps = {
  startSaasWorkspaceAction: (formData: FormData) => void | Promise<void>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary" disabled={pending}>
      {pending ? "Creating SaaS engine..." : "Create SaaS engine"}
    </button>
  );
}

function ToggleField<T extends string>({
  label,
  name,
  value,
  options,
  onChange
}: {
  label: string;
  name: string;
  value: T;
  options: Array<{
    value: T;
    label: string;
    description: string;
  }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`micro-glow cursor-pointer rounded-[22px] border px-4 py-4 transition ${
              value === option.value
                ? "border-cyan-300/28 bg-cyan-300/12 shadow-[0_18px_50px_rgba(34,211,238,0.10)]"
                : "border-slate-200 bg-white/76"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <p className="text-sm font-semibold text-slate-950">{option.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SaasIntakeFlow({
  startSaasWorkspaceAction
}: SaasIntakeFlowProps) {
  const [needsAccounts, setNeedsAccounts] = useState<SaasBinaryChoice>("yes");
  const [takesPayments, setTakesPayments] = useState<SaasBinaryChoice>("not-sure");
  const [needsAdminDashboard, setNeedsAdminDashboard] = useState<SaasBinaryChoice>("not-sure");
  const [guidanceMode, setGuidanceMode] = useState<SaasGuidanceMode>("guide-build");

  const agentCards = useMemo(
    () => [
      {
        id: "narua" as const,
        badge: "Core",
        active: true,
        description: "Neroa frames the product, sequences the work, and keeps the SaaS build moving in the right order."
      },
      {
        id: "forge" as const,
        badge: "Build",
        active: true,
        description: "Forge turns the scoped product into a technical execution path and developer-ready build structure."
      },
      {
        id: "atlas" as const,
        badge: "Strategy",
        active: true,
        description: "Atlas strengthens product reasoning, research depth, and decision quality around the customer problem."
      },
      {
        id: "repolink" as const,
        badge: "Connection",
        active: true,
        description: "RepoLink supports source, environment, and systems context when the build path becomes technical."
      },
      {
        id: "ops" as const,
        badge: "Operations",
        active: true,
        description: "Ops keeps launch prep, admin workflows, and post-launch management grounded in real operating steps."
      }
    ],
    []
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_380px]">
      <form action={startSaasWorkspaceAction} className="floating-plane rounded-[36px] p-6 sm:p-8">
        <div className="floating-wash rounded-[36px]" />
        <div className="relative space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
              SaaS intake
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Let&apos;s shape your SaaS idea into a build plan.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Answer a few focused questions. Neroa will create the SaaS engine, load the right execution lanes, and bring Neroa into the engine with the right specialist agents already assigned.
            </p>
          </div>

          <div className="grid gap-6">
            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">1. What does your SaaS do?</span>
              <textarea
                name="productSummary"
                required
                className="input min-h-[110px] w-full resize-none"
                placeholder="Describe the product, what it helps users do, and the core outcome."
              />
            </label>

            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">2. Who is the customer?</span>
              <input
                name="customer"
                required
                className="input"
                placeholder="Founders, agencies, local businesses, operations teams, creators..."
              />
            </label>

            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">3. What problem does it solve?</span>
              <textarea
                name="problem"
                required
                className="input min-h-[96px] w-full resize-none"
                placeholder="Explain the pain point or workflow problem this SaaS should solve first."
              />
            </label>

            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">4. What are the main features?</span>
              <textarea
                name="features"
                required
                className="input min-h-[120px] w-full resize-none"
                placeholder="List the main MVP features, separated by commas or new lines."
              />
            </label>

            <ToggleField
              label="5. Do users need accounts/login?"
              name="needsAccounts"
              value={needsAccounts}
              onChange={setNeedsAccounts}
              options={[
                {
                  value: "yes",
                  label: "Yes",
                  description: "User accounts are part of the first release."
                },
                {
                  value: "no",
                  label: "No",
                  description: "The first version can stay lighter without auth."
                },
                {
                  value: "not-sure",
                  label: "Not sure",
                  description: "Neroa should help decide whether auth belongs in version one."
                }
              ]}
            />

            <ToggleField
              label="6. Will it take payments?"
              name="takesPayments"
              value={takesPayments}
              onChange={setTakesPayments}
              options={[
                {
                  value: "yes",
                  label: "Yes",
                  description: "Billing or checkout needs to be considered in the build plan."
                },
                {
                  value: "no",
                  label: "No",
                  description: "Payments can wait until after the first release."
                },
                {
                  value: "not-sure",
                  label: "Not sure",
                  description: "Neroa should help decide whether payments belong in the MVP."
                }
              ]}
            />

            <ToggleField
              label="7. Do you need an admin dashboard?"
              name="needsAdminDashboard"
              value={needsAdminDashboard}
              onChange={setNeedsAdminDashboard}
              options={[
                {
                  value: "yes",
                  label: "Yes",
                  description: "Internal controls, moderation, or management tools need to exist early."
                },
                {
                  value: "no",
                  label: "No",
                  description: "The first version should stay customer-facing only."
                },
                {
                  value: "not-sure",
                  label: "Not sure",
                  description: "Neroa should decide whether an admin layer is worth the complexity."
                }
              ]}
            />

            <ToggleField
              label="8. Do you want Neroa to create the roadmap only, or guide the build?"
              name="guidanceMode"
              value={guidanceMode}
              onChange={setGuidanceMode}
              options={[
                {
                  value: "roadmap-only",
                  label: "Roadmap only",
                  description: "Neroa will shape the plan, MVP, cost view, and next steps."
                },
                {
                  value: "guide-build",
                  label: "Guide the build",
                  description: "Neroa will shape the plan and keep guiding execution after the engine opens."
                }
              ]}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <PublicActionLink
              href="/start"
              label="Back to Neroa intake"
              className="button-secondary"
            >
              Back to Neroa intake
            </PublicActionLink>
            <SubmitButton />
          </div>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="floating-plane rounded-[34px] p-6">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Engine created
            </p>
            <div className="mt-5 space-y-3">
              {[
                "Strategy lane",
                "Build lane",
                "Budget lane",
                "Launch lane",
                "Operations lane"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3 text-sm font-semibold text-slate-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Neroa execution stack
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This SaaS intake activates Neroa, Forge, Atlas, RepoLink, and Ops from the first engine pass.
            </p>
            <AiTeammateCards agents={agentCards} compact className="mt-5 grid-cols-1" />
          </div>
        </div>
      </aside>
    </div>
  );
}
