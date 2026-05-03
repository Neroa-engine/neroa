"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const selectedPlanLabels = {
  free: "Free Project Preview",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  managed: "Managed path"
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

const unavailableValue = "Not available yet";

const creditTopOffOptions = [
  "200 credits / $60",
  "500 credits / $150",
  "1,000 credits / $300",
  "2,000 credits / $600"
] as const;

const balanceRows = [
  { label: "Available credits", value: unavailableValue },
  { label: "Used this month", value: unavailableValue },
  { label: "Remaining credits", value: unavailableValue },
  { label: "Top-off credits", value: unavailableValue }
] as const;

const usageSummaryRows = [
  { label: "Monthly credits used", value: "Pending credit ledger" },
  { label: "Year-to-date credits used", value: "Pending credit ledger" },
  { label: "Lifetime credits used", value: "Pending credit ledger" }
] as const;

function BillingCard({
  title,
  children,
  accent = false
}: {
  title: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <article
      className={[
        "rounded-[1.5rem] border p-5 backdrop-blur",
        accent
          ? "border-teal-300/24 bg-[linear-gradient(160deg,rgba(8,16,18,0.76)_0%,rgba(5,11,13,0.92)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
          : "border-white/10 bg-black/25"
      ].join(" ")}
    >
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}

function BillingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

function tabSlug(tab: AccountTab) {
  return tab.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderPanel(
  activeTab: AccountTab,
  selectedPlanLabel: string | null,
  panelId: string,
  labelledById: string
) {
  if (activeTab === "Billing / Usage") {
    return (
      <section
        id={panelId}
        role="tabpanel"
        aria-labelledby={labelledById}
        tabIndex={0}
        className="space-y-5"
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
            Billing / Usage
          </p>
          <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">Billing / Usage</h1>
          <p className="max-w-3xl text-sm leading-8 text-slate-300">
            Review your current plan, Build Credits, usage summaries, and credit top-off guidance
            without implying live billing is already connected.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <BillingCard title="Current Plan" accent>
            <BillingRow label="Plan" value={selectedPlanLabel ?? unavailableValue} />
            <BillingRow label="Included Build Credits" value={unavailableValue} />
            <BillingRow label="Billing cycle" value={unavailableValue} />
            <BillingRow label="Plan status" value={unavailableValue} />
            <p className="text-sm leading-7 text-slate-300">
              Choose or adjust your plan from the pricing page.
            </p>
            <div>
              <Link
                href="/neroa/pricing"
                aria-label="Change plan from pricing"
                className="inline-flex rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
              >
                Change Plan
              </Link>
            </div>
          </BillingCard>

          <BillingCard title="Current Credit Balance">
            {balanceRows.map((row) => (
              <BillingRow key={row.label} label={row.label} value={row.value} />
            ))}
            <p className="text-sm leading-7 text-slate-300">
              Live credit balances will appear here once the credit ledger is connected.
            </p>
          </BillingCard>

          <BillingCard title="Usage Summary">
            {usageSummaryRows.map((row) => (
              <BillingRow key={row.label} label={row.label} value={row.value} />
            ))}
            <p className="text-sm leading-7 text-slate-300">
              Usage totals stay honest here until the credit ledger is ready.
            </p>
          </BillingCard>

          <BillingCard title="Project Credit Usage">
            <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.02] p-4">
              <div className="grid gap-2 border-b border-white/8 pb-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:grid-cols-[1.4fr,1fr,1fr,1fr,0.8fr]">
                <p>Project</p>
                <p>Credits used this month</p>
                <p>Credits used total</p>
                <p>Last activity</p>
                <p>Status</p>
              </div>
              <p className="pt-4 text-sm leading-7 text-slate-300">No project credit usage yet.</p>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Activity time may be shown later as a project insight, but billing remains
              credit-based.
            </p>
          </BillingCard>

          <BillingCard title="Credit Top-Offs">
            <div className="grid gap-3 sm:grid-cols-2">
              {creditTopOffOptions.map((option) => (
                <div
                  key={option}
                  className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm font-medium text-slate-100"
                >
                  {option}
                </div>
              ))}
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Review top-off options on pricing before any purchase flow is connected.
            </p>
            <div>
              <Link
                href="/neroa/pricing"
                aria-label="View credit top-offs on pricing"
                className="inline-flex rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
              >
                View Top-Offs
              </Link>
            </div>
          </BillingCard>

          <BillingCard title="Managed Credits">
            <p className="text-sm leading-7 text-slate-300">
              Managed credits are separate from standard Build Credits.
            </p>
            <p className="text-sm leading-7 text-slate-300">
              Managed credits support higher-touch execution and delivery help.
            </p>
            <p className="text-sm leading-7 text-slate-300">
              Managed balance and usage will appear here once connected.
            </p>
            <div>
              <Link
                href="/neroa/pricing"
                aria-label="View managed build options on pricing"
                className="inline-flex rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
              >
                View Managed Build Options
              </Link>
            </div>
          </BillingCard>
        </div>
      </section>
    );
  }

  if (activeTab === "Account") {
    return (
      <section
        id={panelId}
        role="tabpanel"
        aria-labelledby={labelledById}
        tabIndex={0}
        className="space-y-5"
      >
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
            Profile, preferences, and account access details stay descriptive here so this view does not imply live profile editing or saved account changes.
          </p>
        </div>
      </section>
    );
  }

  if (activeTab === "Contact") {
    return (
      <section
        id={panelId}
        role="tabpanel"
        aria-labelledby={labelledById}
        tabIndex={0}
        className="space-y-5"
      >
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
            aria-label="Contact support at support@neroa.io"
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
    <section
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledById}
      tabIndex={0}
      className="space-y-6"
    >
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
          No next action yet. Start a project or open the Project Portal when you are ready to
          organize roadmap, scope, decisions, evidence, and build readiness.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/neroa/pricing"
            aria-label="Start a project from pricing"
            className="inline-flex rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
          >
            Start a Project
          </Link>
          <Link
            href="/neroa/project"
            aria-label="View the Project Portal"
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
  const activeTabSlug = tabSlug(activeTab);
  const activeTabId = `account-tab-${activeTabSlug}`;
  const activePanelId = `account-panel-${activeTabSlug}`;

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
                Move between your project board, billing guidance, account details, and support
                contact in one Neroa account view.
              </p>
            </div>
            {selectedPlanLabel ? (
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-200">
                Selected Plan: {selectedPlanLabel}
              </div>
            ) : null}
          </div>

          <div
            className="mt-5 flex flex-wrap gap-3"
            role="tablist"
            aria-label="Account portal sections"
          >
            {accountTabs.map((tab) => {
              const active = tab === activeTab;
              const tabId = `account-tab-${tabSlug(tab)}`;
              const panelId = `account-panel-${tabSlug(tab)}`;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  id={tabId}
                  role="tab"
                  aria-selected={active}
                  aria-controls={panelId}
                  aria-label={`Open ${tab}`}
                  tabIndex={active ? 0 : -1}
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
            {renderPanel(activeTab, selectedPlanLabel, activePanelId, activeTabId)}
          </div>
        </section>
      </div>
    </main>
  );
}
