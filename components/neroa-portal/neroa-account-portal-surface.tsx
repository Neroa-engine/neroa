"use client";

import { useState } from "react";
import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const selectedPlanLabels = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  managed: "Managed Build"
} as const;

type SelectedPlan = keyof typeof selectedPlanLabels;

type NeroaAccountPortalSurfaceProps = {
  selectedPlan?: SelectedPlan | null;
};

const accountTabs = [
  "Project Board",
  "Billing / Usage",
  "Account",
  "Contact"
] as const;

type AccountTab = (typeof accountTabs)[number];

const boardColumns = [
  {
    title: "Active Projects",
    emptyState: "No active projects yet."
  },
  {
    title: "Open Items",
    emptyState: "No open items yet."
  },
  {
    title: "Paused / Waiting",
    emptyState: "No paused items yet."
  },
  {
    title: "Completed / Archived",
    emptyState: "No completed projects yet."
  }
] as const;

function renderPanel(activeTab: AccountTab, selectedPlanLabel: string | null) {
  if (activeTab === "Billing / Usage") {
    return (
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
            Billing / Usage
          </p>
          <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">Billing / Usage</h1>
          <p className="max-w-3xl text-sm leading-8 text-slate-300">
            Review your plan path, Build Credit structure, and managed-credit separation.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
          <article className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/78">
              Plan Context
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {selectedPlanLabel
                ? `Current account entry is carrying ${selectedPlanLabel} plan context into the portal.`
                : "Plan context appears here when a selected plan is attached to the account entry."}
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/78">
              Build Credits
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Standard Build Credits and managed credits stay distinct so account guidance stays clear without turning this portal into a checkout flow.
            </p>
          </article>
        </div>

        <div>
          <Link
            href="/neroa/pricing"
            className="inline-flex rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
          >
            View Pricing
          </Link>
        </div>
      </section>
    );
  }

  if (activeTab === "Account") {
    return (
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
            Account
          </p>
          <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">Account</h1>
          <p className="max-w-3xl text-sm leading-8 text-slate-300">
            Manage your profile, preferences, and account access details.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
          <p className="text-sm leading-7 text-slate-300">
            Account settings stay descriptive here so the portal reflects the real account area cleanly without implying live profile editing where that flow is not wired.
          </p>
        </div>
      </section>
    );
  }

  if (activeTab === "Contact") {
    return (
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
            Contact
          </p>
          <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">Contact</h1>
          <p className="max-w-3xl text-sm leading-8 text-slate-300">
            Need help with your plan, project setup, or account access? Contact Neroa support.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
          <a
            href="mailto:support@neroa.io"
            className="inline-flex rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
          >
            Contact Support
          </a>
          <p className="mt-4 text-sm leading-7 text-slate-300">support@neroa.io</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
          Project Board
        </p>
        <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">Project Board</h1>
        <p className="max-w-3xl text-sm leading-8 text-slate-300">
          Track active projects, open work, paused items, and next project actions.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {boardColumns.map((column) => (
          <article
            key={column.title}
            className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 backdrop-blur"
          >
            <h2 className="text-lg font-semibold text-slate-100">{column.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{column.emptyState}</p>
          </article>
        ))}
      </div>

      <article className="rounded-[1.5rem] border border-teal-300/22 bg-[linear-gradient(160deg,rgba(10,16,20,0.88)_0%,rgba(6,10,14,0.78)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/78">
          Next Action
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          No next action yet. Start a project or move into the project portal when you are ready to organize roadmap, scope, decisions, evidence, and build readiness.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/neroa/pricing"
            className="inline-flex rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
          >
            Start a Project
          </Link>
          <Link
            href="/neroa/project"
            className="inline-flex rounded-full border border-slate-400/25 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-teal-300/45 hover:text-teal-100"
          >
            View Project Portal
          </Link>
        </div>
      </article>
    </section>
  );
}

export function NeroaAccountPortalSurface({
  selectedPlan = null
}: NeroaAccountPortalSurfaceProps) {
  const [activeTab, setActiveTab] = useState<AccountTab>("Project Board");
  const selectedPlanLabel = selectedPlan ? selectedPlanLabels[selectedPlan] : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] px-6 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.68]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.18)_0%,rgba(4,7,10,0.38)_26%,rgba(3,6,8,0.76)_68%,rgba(3,6,8,0.96)_100%)]" />
        <div className="absolute right-[5%] top-[3%] h-[38rem] w-[30rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.18),transparent_10%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.10),transparent_52%)] blur-xl" />
        <div className="absolute bottom-[10rem] left-[-6%] right-[-6%] h-[16rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.08),transparent_60%)]" />
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="account-page-north-star" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1680px] flex-col gap-6">
        <NeroaPortalNavigation currentPath="/neroa/account" tone="dark" />

        <section className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(160deg,rgba(8,12,16,0.66)_0%,rgba(6,9,13,0.54)_100%)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 border-b border-white/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
                Account Portal
              </p>
              <p className="text-sm leading-7 text-slate-300">
                Account navigation and project board entry in one clean Neroa portal.
              </p>
            </div>
            {selectedPlanLabel ? (
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-200">
                Selected Plan: {selectedPlanLabel}
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-3" aria-label="Account portal sections">
            {accountTabs.map((tab) => {
              const active = tab === activeTab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={active}
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                    active
                      ? "border-teal-300/42 bg-teal-300/10 text-teal-100 shadow-[0_0_28px_rgba(45,212,191,0.12)]"
                      : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-teal-300/28 hover:text-slate-100"
                  ].join(" ")}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(148,163,184,0.03)_100%)] p-6">
            {renderPanel(activeTab, selectedPlanLabel)}
          </div>
        </section>
      </div>
    </main>
  );
}
