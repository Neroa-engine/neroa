"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const projectTabs = [
  "Project & Strategy Room",
  "Project Room",
  "Command Center",
  "QC Room"
] as const;

type ProjectTab = (typeof projectTabs)[number];

const projectRoomCards = [
  {
    title: "Current Project",
    body: "No current project connected yet."
  },
  {
    title: "Roadmap Status",
    body: "Roadmap will appear here once strategy is approved."
  },
  {
    title: "Scope Items",
    body: "Scope items will appear here once project planning begins."
  },
  {
    title: "Decisions",
    body: "No project decisions recorded yet."
  },
  {
    title: "Build Readiness",
    body: "Build readiness will appear here once project planning is approved."
  }
] as const;

const commandCenterCategories = [
  {
    label: "Requests",
    helper: "Use Requests for new work, feature changes, or project needs."
  },
  {
    label: "Revisions",
    helper: "Use Revisions when something needs to be changed, corrected, or refined."
  },
  {
    label: "Next Actions",
    helper: "Use Next Actions to clarify what should happen next."
  },
  {
    label: "Approvals",
    helper: "Use Approvals to approve or hold work before it moves forward."
  },
  {
    label: "Decisions",
    helper: "Use Decisions to record choices that affect scope, design, pricing, or execution."
  }
] as const;

type CommandCenterCategory = (typeof commandCenterCategories)[number];

const customerTaskColumns = [
  "Waiting for Review",
  "Approved",
  "In Progress",
  "Needs Customer Input",
  "Completed"
] as const;

const qcRoomCards = [
  {
    title: "Browser QC",
    body: "QC runtime is not connected yet."
  },
  {
    title: "Evidence",
    body: "Browser evidence will appear here once QC capture is connected."
  },
  {
    title: "Visual Review",
    body: "Visual review will appear here after a QC run."
  },
  {
    title: "Issues Found",
    body: "Inspection results will appear here after a QC run."
  },
  {
    title: "Review Status",
    body: "Review status will appear here after browser checks are connected."
  }
] as const;

function PillCard({
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

function RoomTile({
  title,
  body
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
    </article>
  );
}

function CategoryPill({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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

function TaskLaneCard({ title }: { title: string }) {
  return (
    <article className="min-w-[14rem] flex-1 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-300">No tasks yet.</p>
    </article>
  );
}

function CommandCenterPanel() {
  const [activeCategory, setActiveCategory] = useState<CommandCenterCategory>(
    commandCenterCategories[0]
  );
  const [commandDraft, setCommandDraft] = useState("");
  const [commandNotice, setCommandNotice] = useState("");

  function handleCommandSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommandNotice(
      "Command capture is not connected yet. This chat will later create project tasks and review items."
    );
  }

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
          Command Center
        </p>
        <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">Command Center</h1>
        <p className="max-w-3xl text-sm leading-8 text-slate-300">
          Send requests, review decisions, track revisions, and keep project execution organized.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {commandCenterCategories.map((category) => (
          <CategoryPill
            key={category.label}
            label={category.label}
            active={category.label === activeCategory.label}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </div>

      <PillCard title="Project Command Chat" accent>
        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-5">
          <div className="space-y-4">
            <div className="rounded-[1.15rem] border border-teal-300/18 bg-teal-300/[0.08] px-4 py-4 text-sm leading-7 text-slate-100">
              Use this space to tell Neroa what you need changed, reviewed, approved, or clarified.
              Your command will later be organized into customer-facing tasks and internal
              execution work.
            </div>
            <p className="text-sm leading-7 text-slate-300">{activeCategory.helper}</p>
            <form className="space-y-4" onSubmit={handleCommandSubmit}>
              <label
                htmlFor="project-command-chat-input"
                className="block text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/62"
              >
                Type a request, revision, approval note, or project question...
              </label>
              <textarea
                id="project-command-chat-input"
                name="project-command-chat-input"
                rows={8}
                value={commandDraft}
                onChange={(event) => setCommandDraft(event.target.value)}
                placeholder="Type a request, revision, approval note, or project question..."
                className="min-h-[16rem] w-full rounded-[1.25rem] border border-white/10 bg-[#05090d]/90 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500"
                aria-label="Type a request, revision, approval note, or project question"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex rounded-full border border-teal-300/34 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-300/52 hover:bg-teal-300/14"
                >
                  Send Command
                </button>
                {commandNotice ? (
                  <p className="text-sm leading-7 text-slate-300">{commandNotice}</p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </PillCard>

      <PillCard title="Customer Tasks">
        <div className="space-y-4">
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            Customer-visible tasks will appear here after commands are reviewed and organized.
          </p>
          <div className="flex flex-col gap-4 xl:flex-row">
            {customerTaskColumns.map((column) => (
              <TaskLaneCard key={column} title={column} />
            ))}
          </div>
        </div>
      </PillCard>
    </section>
  );
}

function tabSlug(tab: ProjectTab) {
  return tab.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderProjectPanel(
  activeTab: ProjectTab,
  panelId: string,
  labelledById: string
) {
  if (activeTab === "Project Room") {
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
            Project Room
          </p>
          <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">Project Room</h1>
          <p className="max-w-3xl text-sm leading-8 text-slate-300">
            Review the current project structure, roadmap status, scope items, and build
            readiness.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {projectRoomCards.map((card, index) => (
            <PillCard key={card.title} title={card.title} accent={index === 0}>
              <p className="text-sm leading-7 text-slate-300">{card.body}</p>
            </PillCard>
          ))}
        </div>
      </section>
    );
  }

  if (activeTab === "Command Center") {
    return (
      <section
        id={panelId}
        role="tabpanel"
        aria-labelledby={labelledById}
        tabIndex={0}
        className="space-y-5"
      >
        <CommandCenterPanel />
      </section>
    );
  }

  if (activeTab === "QC Room") {
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
            QC Room
          </p>
          <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">QC Room</h1>
          <p className="max-w-3xl text-sm leading-8 text-slate-300">
            Review browser checks, visual evidence, QA notes, and inspection results.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {qcRoomCards.map((card, index) => (
            <PillCard key={card.title} title={card.title} accent={index === 0}>
              <p className="text-sm leading-7 text-slate-300">{card.body}</p>
            </PillCard>
          ))}
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
      className="space-y-5"
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
          Project &amp; Strategy Room
        </p>
        <h1 className="font-serif text-3xl text-slate-50 sm:text-[2.5rem]">
          Project &amp; Strategy Room
        </h1>
        <p className="max-w-3xl text-sm leading-8 text-slate-300">
          Shape the project, clarify the roadmap, and prepare scope before execution begins.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(18rem,23rem)]">
        <PillCard title="Strategy Notes" accent>
          <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <div className="space-y-4">
              <div className="max-w-3xl rounded-[1.15rem] border border-teal-300/18 bg-teal-300/[0.07] px-4 py-4 text-sm leading-7 text-slate-100">
                Tell Neroa what you want to build, who it is for, and what the end result should
                accomplish.
              </div>
              <label
                htmlFor="project-strategy-notes"
                className="block text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/62"
              >
                Describe your project...
              </label>
              <textarea
                id="project-strategy-notes"
                name="project-strategy-notes"
                rows={8}
                className="min-h-[14rem] w-full rounded-[1.25rem] border border-white/10 bg-black/25 px-4 py-4 text-sm leading-7 text-white outline-none"
                aria-label="Describe your project"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled
                  className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                >
                  Save Strategy Notes
                </button>
                <p className="text-sm leading-7 text-slate-300">
                  Strategy note saving will appear here once project planning save-back is
                  connected.
                </p>
              </div>
            </div>
          </div>
        </PillCard>

        <PillCard title="Room Focus">
          <RoomTile
            title="Project Shape"
            body="Use this room to capture the project direction before roadmap and scope move forward."
          />
          <RoomTile
            title="Roadmap Clarity"
            body="Roadmap notes will become visible here once strategy direction is approved."
          />
          <RoomTile
            title="Scope Readiness"
            body="Scope guidance will appear here after project planning begins."
          />
        </PillCard>
      </div>
    </section>
  );
}

export function NeroaProjectPortalSurface() {
  const [activeTab, setActiveTab] = useState<ProjectTab>("Project & Strategy Room");
  const activeTabSlug = tabSlug(activeTab);
  const activeTabId = `project-tab-${activeTabSlug}`;
  const activePanelId = `project-panel-${activeTabSlug}`;

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
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="project-page-north-star" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1680px] flex-col gap-6">
        <NeroaPortalNavigation currentPath="/neroa/project" tone="dark" />

        <section className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(160deg,rgba(8,12,16,0.66)_0%,rgba(6,9,13,0.54)_100%)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 border-b border-white/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/78">
                Project Portal
              </p>
              <p className="text-sm leading-7 text-slate-300">
                Move between project planning, project structure, execution review, and QC review
                in one Neroa project view.
              </p>
            </div>
          </div>

          <div
            className="mt-5 flex flex-wrap gap-3"
            role="tablist"
            aria-label="Project portal sections"
          >
            {projectTabs.map((tab) => {
              const active = tab === activeTab;
              const tabId = `project-tab-${tabSlug(tab)}`;
              const panelId = `project-panel-${tabSlug(tab)}`;

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
            {renderProjectPanel(activeTab, activePanelId, activeTabId)}
          </div>
        </section>
      </div>
    </main>
  );
}
