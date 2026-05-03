"use client";

import { type ReactNode, useState } from "react";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const adminSections = [
  {
    label: "Dashboard",
    heading: "Admin Dashboard",
    subheading:
      "Monitor Neroa operations, users, projects, support, credits, content, QC, and system readiness."
  },
  {
    label: "Users",
    heading: "Users",
    emptyState: "User records will appear here once admin user management is connected.",
    sections: ["User Directory", "Account Status", "Plan Path", "Last Activity"]
  },
  {
    label: "Projects",
    heading: "Projects",
    emptyState: "Project records will appear here once project tracking is connected.",
    sections: ["Project List", "Project Status", "Owner", "Next Action"]
  },
  {
    label: "Support Requests",
    heading: "Support Requests",
    emptyState:
      "Support requests will appear here once the contact form is connected to support tracking.",
    sections: ["New Requests", "In Review", "Waiting on Customer", "Resolved"]
  },
  {
    label: "Billing / Credits",
    heading: "Billing / Credits",
    emptyState:
      "Billing and credit data will appear here once the credit ledger and billing system are connected.",
    sections: ["Plan Overview", "Build Credits", "Managed Credits", "Top-Offs", "Usage Review"]
  },
  {
    label: "Credit Usage",
    heading: "Credit Usage",
    subheading:
      "Review platform credit consumption, customer usage patterns, and credit-governor readiness once the ledger is connected.",
    emptyState: "Credit usage data will appear here once the credit ledger is connected.",
    secondaryEmptyState:
      "Waived and platform-covered credits will appear here once execution accounting is connected.",
    sections: [
      "Credits Used Today",
      "Monthly Credits Used",
      "Year-to-Date Credits Used",
      "Lifetime Credits Used",
      "Managed Credits Used",
      "Top-Off Credits Purchased",
      "Waived / Platform-Covered Credits",
      "Project Credit Usage",
      "High-Usage Accounts"
    ]
  },
  {
    label: "System Health",
    heading: "System Health",
    emptyState: "System health signals will appear here once monitoring is connected.",
    sections: [
      "Auth",
      "Database",
      "Vercel Deployment",
      "Hosted Browser",
      "QC Capture",
      "Background Jobs",
      "Error Monitoring",
      "Queue Health"
    ]
  },
  {
    label: "Content / Blog",
    heading: "Content / Blog",
    emptyState: "Blog publishing tools will appear here once admin content management is connected.",
    sections: ["Blog Posts", "Drafts", "Published", "Content Review"]
  },
  {
    label: "QC / Evidence",
    heading: "QC / Evidence",
    emptyState: "QC evidence will appear here once hosted browser capture is connected.",
    sections: [
      "Evidence Library",
      "QC Runs",
      "Visual Reviews",
      "Issues Found",
      "Browser Capture Status"
    ]
  },
  {
    label: "Settings",
    heading: "Settings",
    emptyState: "Admin settings will appear here once role-based admin controls are connected.",
    sections: [
      "Admin Access",
      "Platform Settings",
      "Notifications",
      "Audit Trail",
      "Integration Settings"
    ]
  }
] as const;

type AdminSection = (typeof adminSections)[number];
type AdminSectionLabel = AdminSection["label"];

const dashboardCards = [
  "Users",
  "Active Projects",
  "Support Requests",
  "Credit Usage",
  "QC Runs",
  "System Health",
  "System Alerts"
] as const;

function AdminPill({
  tabId,
  panelId,
  label,
  active,
  onClick
}: {
  tabId: string;
  panelId: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      id={tabId}
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      aria-pressed={active}
      tabIndex={active ? 0 : -1}
      className={[
        "rounded-full border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition",
        active
          ? "border-teal-300/42 bg-teal-300/12 text-teal-100 shadow-[0_0_24px_rgba(45,212,191,0.14)]"
          : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-teal-300/24 hover:text-slate-100"
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function sectionSlug(label: AdminSectionLabel) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function SurfaceCard({
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

function SectionTile({ title }: { title: string }) {
  return (
    <article className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
    </article>
  );
}

function renderDashboard(panelId: string, labelledById: string) {
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
          Dashboard
        </p>
        <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">Admin Dashboard</h1>
        <p className="max-w-3xl text-sm leading-8 text-slate-300">
          Monitor Neroa operations, users, projects, support, credits, content, QC, and system
          readiness.
        </p>
      </div>

      <SurfaceCard title="Admin Metrics" accent>
        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-5">
          <p className="text-sm leading-7 text-slate-300">
            Admin metrics will appear here once admin data sources are connected.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-400">No live admin metrics connected yet.</p>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {dashboardCards.map((card, index) => (
          <SurfaceCard key={card} title={card} accent={index === 0}>
            <p className="text-sm leading-7 text-slate-300">
              Admin metrics will appear here once admin data sources are connected.
            </p>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}

function renderSection(section: AdminSection, panelId: string, labelledById: string) {
  if (section.label === "Dashboard") {
    return renderDashboard(panelId, labelledById);
  }

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
          {section.label}
        </p>
        <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">{section.heading}</h1>
        {"subheading" in section && section.subheading ? (
          <p className="max-w-3xl text-sm leading-8 text-slate-300">{section.subheading}</p>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {section.sections.map((item, index) => (
          <SurfaceCard key={item} title={item} accent={index === 0}>
            <p className="text-sm leading-7 text-slate-300">{section.emptyState}</p>
            {"secondaryEmptyState" in section && section.secondaryEmptyState && index === 0 ? (
              <p className="text-sm leading-7 text-slate-400">{section.secondaryEmptyState}</p>
            ) : null}
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {section.sections.map((item) => (
          <SectionTile key={`${section.label}-${item}`} title={item} />
        ))}
      </div>
    </section>
  );
}

export function NeroaAdminPortalSurface() {
  const [activeSection, setActiveSection] = useState<AdminSectionLabel>("Dashboard");
  const currentSection =
    adminSections.find((section) => section.label === activeSection) ?? adminSections[0];
  const activeSectionSlug = sectionSlug(activeSection);
  const activeTabId = `admin-tab-${activeSectionSlug}`;
  const activePanelId = `admin-panel-${activeSectionSlug}`;
  const warningId = "admin-portal-warning";
  const helperId = "admin-portal-helper";

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
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="admin-page-north-star" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1680px] flex-col gap-6">
        <NeroaPortalNavigation currentPath="/neroa/admin" includeAdminPortal tone="dark" />

        <section className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(160deg,rgba(8,12,16,0.66)_0%,rgba(6,9,13,0.54)_100%)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 border-b border-white/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
                Admin Portal
              </p>
              <p id={warningId} className="max-w-3xl text-sm leading-7 text-slate-300">
                Admin access control is not connected yet. This shell is for internal portal
                structure only.
              </p>
              <p id={helperId} className="max-w-3xl text-sm leading-7 text-slate-400">
                Role-based admin access will be added later.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/25 px-5 py-4 text-sm leading-7 text-slate-300">
              Internal testing route: <span className="font-mono text-slate-100">/neroa/admin</span>
            </div>
          </div>

          <div
            className="mt-5 flex flex-wrap gap-3"
            role="tablist"
            aria-label="Admin portal sections"
            aria-describedby={`${warningId} ${helperId}`}
          >
            {adminSections.map((section) => {
              const slug = sectionSlug(section.label);
              const tabId = `admin-tab-${slug}`;
              const panelId = `admin-panel-${slug}`;

              return (
                <AdminPill
                  key={section.label}
                  tabId={tabId}
                  panelId={panelId}
                  label={section.label}
                  active={section.label === activeSection}
                  onClick={() => setActiveSection(section.label)}
                />
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(148,163,184,0.03)_100%)] p-6">
            {renderSection(currentSection, activePanelId, activeTabId)}
          </div>
        </section>
      </div>
    </main>
  );
}
