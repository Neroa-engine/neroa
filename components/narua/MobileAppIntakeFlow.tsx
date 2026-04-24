"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { PublicActionLink } from "@/components/site/public-action-link";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
import type {
  MobileBinaryChoice,
  MobileCompanionChoice,
  MobilePlatformChoice
} from "@/lib/onboarding/mobile-app-intake";

type MobileAppIntakeFlowProps = {
  startMobileAppWorkspaceAction: (formData: FormData) => void | Promise<void>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary" disabled={pending}>
      {pending ? "Creating Mobile App engine..." : "Create Mobile App engine"}
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
      <div className={`grid gap-3 ${options.length >= 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
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

export default function MobileAppIntakeFlow({
  startMobileAppWorkspaceAction
}: MobileAppIntakeFlowProps) {
  const [platformTarget, setPlatformTarget] = useState<MobilePlatformChoice>("both");
  const [needsAccounts, setNeedsAccounts] = useState<MobileBinaryChoice>("yes");
  const [needsPayments, setNeedsPayments] = useState<MobileBinaryChoice>("not-sure");
  const [needsNotifications, setNeedsNotifications] = useState<MobileBinaryChoice>("not-sure");
  const [companionSurface, setCompanionSurface] =
    useState<MobileCompanionChoice>("not-sure");

  const agentCards = useMemo(
    () => [
      {
        id: "narua" as const,
        badge: "Core",
        active: true,
        description:
          "Neroa frames the app direction, keeps the engine disciplined, and guides the route from concept into build and launch."
      },
      {
        id: "forge" as const,
        badge: "Build",
        active: true,
        description:
          "Forge shapes the React Native + Expo execution path, screen order, backend plan, and delivery sequence."
      },
      {
        id: "atlas" as const,
        badge: "Validation",
        active: true,
        description:
          "Atlas strengthens user reasoning, validation targets, and the decisions behind the MVP cut line."
      },
      {
        id: "repolink" as const,
        badge: "Systems",
        active: true,
        description:
          "RepoLink supports code, environment, Supabase, and implementation context when the engine becomes technical."
      },
      {
        id: "ops" as const,
        badge: "Operate",
        active: true,
        description:
          "Ops keeps store-prep, beta workflow, launch readiness, and post-release operations tied to the same engine."
      }
    ],
    []
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_380px]">
      <form
        action={startMobileAppWorkspaceAction}
        className="floating-plane rounded-[36px] p-6 sm:p-8"
      >
        <div className="floating-wash rounded-[36px]" />
        <div className="relative space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
              Mobile App intake
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Let&apos;s shape your mobile app into a build plan.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Answer a focused set of mobile product questions. Neroa will create the engine,
              load the full lane structure, recommend the right stack path, and open Neroa with
              the right specialist agents already aligned to the app.
            </p>
          </div>

          <div className="grid gap-6">
            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">
                1. What does the mobile app do?
              </span>
              <textarea
                name="appSummary"
                required
                className="input min-h-[110px] w-full resize-none"
                placeholder="Describe the app, the core workflow, and the value it should deliver first."
              />
            </label>

            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">2. Who is it for?</span>
              <input
                name="audience"
                required
                className="input"
                placeholder="Consumers, field teams, sales reps, members, operators, creators..."
              />
            </label>

            <ToggleField
              label="3. Is it for iPhone, Android, or both?"
              name="platformTarget"
              value={platformTarget}
              onChange={setPlatformTarget}
              options={[
                {
                  value: "iphone",
                  label: "iPhone",
                  description: "The MVP can target iOS first."
                },
                {
                  value: "android",
                  label: "Android",
                  description: "The MVP can target Android first."
                },
                {
                  value: "both",
                  label: "Both",
                  description: "The engine should plan for cross-platform delivery from the start."
                }
              ]}
            />

            <ToggleField
              label="4. Does it need login/accounts?"
              name="needsAccounts"
              value={needsAccounts}
              onChange={setNeedsAccounts}
              options={[
                {
                  value: "yes",
                  label: "Yes",
                  description: "Accounts are part of the first release."
                },
                {
                  value: "no",
                  label: "No",
                  description: "The first version can stay lighter without auth."
                },
                {
                  value: "not-sure",
                  label: "Not sure",
                  description: "Neroa should decide whether auth belongs in the MVP."
                }
              ]}
            />

            <ToggleField
              label="5. Does it need payments/subscriptions?"
              name="needsPayments"
              value={needsPayments}
              onChange={setNeedsPayments}
              options={[
                {
                  value: "yes",
                  label: "Yes",
                  description: "Billing or subscriptions belong in the early release."
                },
                {
                  value: "no",
                  label: "No",
                  description: "Payments can wait until later."
                },
                {
                  value: "not-sure",
                  label: "Not sure",
                  description: "Neroa should help decide whether payments belong in version one."
                }
              ]}
            />

            <ToggleField
              label="6. Does it need push notifications?"
              name="needsNotifications"
              value={needsNotifications}
              onChange={setNeedsNotifications}
              options={[
                {
                  value: "yes",
                  label: "Yes",
                  description: "Notifications matter to the first experience."
                },
                {
                  value: "no",
                  label: "No",
                  description: "The app can launch without notification complexity."
                },
                {
                  value: "not-sure",
                  label: "Not sure",
                  description: "Neroa should help decide if push belongs in the MVP."
                }
              ]}
            />

            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">
                7. Does it need camera, location, or other device features?
              </span>
              <textarea
                name="deviceFeatures"
                required
                className="input min-h-[96px] w-full resize-none"
                placeholder="List device capabilities or say 'none' if the app can stay simple."
              />
            </label>

            <ToggleField
              label="8. Does it need an admin dashboard or web companion app?"
              name="companionSurface"
              value={companionSurface}
              onChange={setCompanionSurface}
              options={[
                {
                  value: "none",
                  label: "No companion",
                  description: "Keep the first release mobile-only."
                },
                {
                  value: "admin-dashboard",
                  label: "Admin dashboard",
                  description: "Internal controls or moderation matter early."
                },
                {
                  value: "web-companion",
                  label: "Web companion",
                  description: "A browser-based companion app belongs in the plan."
                },
                {
                  value: "both",
                  label: "Both",
                  description: "The engine should plan for mobile plus back-office surfaces."
                },
                {
                  value: "not-sure",
                  label: "Not sure",
                  description: "Neroa should decide whether a companion surface belongs in phase one."
                }
              ]}
            />

            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">
                9. What is the MVP version?
              </span>
              <textarea
                name="mvpVersion"
                required
                className="input min-h-[110px] w-full resize-none"
                placeholder="Describe the smallest launchable version worth testing."
              />
            </label>

            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">
                10. What budget are you trying to protect?
              </span>
              <input
                name="budgetGuardrail"
                required
                className="input"
                placeholder="Example: Keep the first version under $30k and avoid app-store overbuild."
              />
            </label>

            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-950">
                11. What outcome would prove the app is worth building further?
              </span>
              <textarea
                name="proofOutcome"
                required
                className="input min-h-[96px] w-full resize-none"
                placeholder="Example: 100 active beta users, 20 paid subscribers, or repeat weekly usage from a pilot team."
              />
            </label>
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
              Mobile App engine
            </p>
            <div className="mt-5 grid gap-3">
              {[
                "Strategy",
                "Scope",
                "MVP",
                "Budget",
                "Test",
                "Build",
                "Launch",
                "Operate"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3 text-sm font-semibold text-slate-900"
                >
                  {item} lane
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Supported mobile stack paths
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">Primary Build Path</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    React Native + Expo with Supabase, Stripe, Expo Notifications, and an
                    optional Next.js companion surface when needed.
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">Secondary MVP Path</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    PWA / mobile web when speed, budget protection, and testing matter more than
                    app-store packaging.
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">Advisory Path</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Flutter, native iOS, and native Android stay advisory-only for special
                    performance or platform-specific cases.
                  </p>
                </div>
              </div>
            </div>

            <AiTeammateCards agents={agentCards} compact className="grid-cols-1" />
          </div>
        </div>
      </aside>
    </div>
  );
}
