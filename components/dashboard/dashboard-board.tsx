"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { setActiveProjectContext } from "@/app/portal/actions";
import {
  archiveWorkspace,
  deleteWorkspace,
  duplicateWorkspace,
  renameWorkspace,
  restoreWorkspace
} from "@/app/workspace/actions";
import {
  PremiumButton,
  PrimaryPanel,
  SecondaryPanel
} from "@/components/workspace/premium-lane-ui";
import { APP_ROUTES } from "@/lib/routes";

type WorkspaceAccessMode = "owner" | "member";

export type DashboardBoardProject = {
  id: string;
  title: string;
  description: string | null;
  route: string;
  templateLabel: string;
  statusLabel: string;
  statusTone: "default" | "cyan" | "amber" | "emerald";
  currentPhaseLabel: string | null;
  currentPhaseSummary: string | null;
  phaseTrack: Array<{
    label: string;
    state: "complete" | "current" | "upcoming";
  }>;
  leadingLaneTitle: string | null;
  laneCount: number;
  assetCount: number;
  lastUpdatedLabel: string;
  createdAtLabel: string;
  accessMode: WorkspaceAccessMode;
  likelyDuplicateCount: number;
  productSummary: string | null;
  primaryUserLabel: string | null;
  scopeSnapshot: string[];
  buildEstimateLabel: string | null;
  buildEstimateSummary: string | null;
  projectSystems: Array<{
    label: string;
    status: "planned" | "referenced";
  }>;
  assets: Array<{
    id: string;
    name: string;
    kind: string;
    sizeLabel: string | null;
    addedAt: string;
  }>;
};

type DashboardBoardProps = {
  projects: DashboardBoardProject[];
  archivedProjects: DashboardBoardProject[];
};

type ProjectBoardView = "current" | "archived";

function ProjectActionButton({
  children,
  variant = "ghost",
  disabled = false
}: {
  children: string;
  variant?: "cta" | "ghost" | "quiet";
  disabled?: boolean;
}) {
  return (
    <PremiumButton
      type="submit"
      variant={variant}
      disabled={disabled}
      className="px-4 py-2 text-sm"
    >
      {children}
    </PremiumButton>
  );
}

function ProjectActionForm({
  workspaceId,
  returnTo = APP_ROUTES.projects,
  formAction,
  label,
  variant = "ghost",
  confirmMessage
}: {
  workspaceId: string;
  returnTo?: string;
  formAction: (formData: FormData) => Promise<void>;
  label: string;
  variant?: "cta" | "ghost" | "quiet";
  confirmMessage?: string;
}) {
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <ProjectActionButton variant={variant}>
        {label}
      </ProjectActionButton>
    </form>
  );
}

function ProjectPortalOpenForm({
  workspaceId,
  destination,
  label,
  className,
  returnTo = APP_ROUTES.projects
}: {
  workspaceId: string;
  destination: string;
  label: string;
  className: string;
  returnTo?: string;
}) {
  return (
    <form action={setActiveProjectContext}>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="destination" value={destination} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

function ProjectTag({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "cyan" | "amber" | "emerald";
}) {
  const className =
    tone === "cyan"
      ? "premium-pill text-cyan-700"
      : tone === "emerald"
        ? "premium-pill border-emerald-200/80 bg-emerald-50/85 text-emerald-700"
      : tone === "amber"
        ? "premium-pill border-amber-200/80 bg-amber-50/80 text-amber-700"
        : "premium-pill text-slate-500";

  return <span className={className}>{children}</span>;
}

function ProjectMetaGrid({ project }: { project: DashboardBoardProject }) {
  return (
    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Current stage
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">
          {project.currentPhaseLabel ?? "Not set"}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {project.currentPhaseSummary
            ? `${project.currentPhaseSummary}${
                project.leadingLaneTitle ? ` Leading workstream: ${project.leadingLaneTitle}.` : ""
              }`
            : project.leadingLaneTitle
              ? `Leading workstream: ${project.leadingLaneTitle}`
              : "Neroa will identify the leading stage as the project sharpens."}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Primary user
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">
          {project.primaryUserLabel ?? "Still being defined"}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Build estimate
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">
          {project.buildEstimateLabel ?? "Estimate pending"}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {project.buildEstimateSummary ??
            "A scoped build-cost estimate will appear here as the product definition sharpens."}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Last updated
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{project.lastUpdatedLabel}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {project.accessMode === "owner" ? "Owner" : "Shared with you"}
          {" - "}Created {project.createdAtLabel}
        </p>
      </div>
    </div>
  );
}

function ProjectStageTrack({ project }: { project: DashboardBoardProject }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Project progress
        </p>
        {project.currentPhaseLabel ? (
          <p className="text-xs font-medium text-slate-500">
            Current stage: <span className="text-slate-700">{project.currentPhaseLabel}</span>
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {project.phaseTrack.map((stage) => {
          const markerClassName =
            stage.state === "current"
              ? "border-slate-950 bg-slate-950 text-white"
              : stage.state === "complete"
                ? "border-cyan-300/70 bg-cyan-300/14 text-cyan-700"
                : "border-slate-200/80 bg-white/82 text-slate-400";

          return (
            <span
              key={stage.label}
              className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${markerClassName}`}
            >
              {stage.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ProjectSystemsBlock({ project }: { project: DashboardBoardProject }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Platforms & integrations
      </p>
      {project.projectSystems.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {project.projectSystems.map((system) => (
            <span
              key={`${project.id}-${system.label}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              <span className="text-slate-950">{system.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  system.status === "referenced"
                    ? "bg-cyan-300/14 text-cyan-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {system.status === "referenced" ? "Referenced" : "Planned"}
              </span>
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-3 text-sm leading-6 text-slate-500">
          No platforms or integrations are recorded on this project yet.
        </div>
      )}
    </div>
  );
}

function ProjectSummaryBlock({ project }: { project: DashboardBoardProject }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Product summary
      </p>
      <p className="text-sm leading-6 text-slate-600">
        {project.productSummary ??
          project.description ??
          "The product summary will appear here once Neroa has enough scoped build detail."}
      </p>
      <div className="flex flex-wrap gap-2.5">
        <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/72 px-3 py-1.5 text-xs font-medium text-slate-600">
          {project.laneCount} work area{project.laneCount === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/72 px-3 py-1.5 text-xs font-medium text-slate-600">
          {project.assetCount} tracked input{project.assetCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

function ProjectScopeSnapshot({ project }: { project: DashboardBoardProject }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        First build scope
      </p>
      <div className="mt-3">
        {project.scopeSnapshot.length > 0 ? (
          <ul className="space-y-1.5">
            {project.scopeSnapshot.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-500/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-slate-500">
            First-build scope will appear here once the initial product modules are set.
          </p>
        )}
      </div>
    </div>
  );
}

function ProjectManagementBar({
  project,
  onRename
}: {
  project: DashboardBoardProject;
  onRename: (project: DashboardBoardProject) => void;
}) {
  if (project.accessMode !== "owner") {
    return (
      <div className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-500">
        This project was shared with you. You can open it here, but rename, archive, restore, and
        delete stay owner-only.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        <PremiumButton type="button" variant="ghost" onClick={() => onRename(project)}>
          Rename
        </PremiumButton>

        <ProjectActionForm
          workspaceId={project.id}
          formAction={duplicateWorkspace}
          label="Duplicate"
        />

        <ProjectActionForm
          workspaceId={project.id}
          formAction={archiveWorkspace}
          label="Archive"
          variant="ghost"
          confirmMessage={`Archive "${project.title}"? It will leave the main current-project view but stay recoverable.`}
        />

        <PremiumButton type="button" variant="quiet" disabled className="px-4 py-2 text-sm">
          Delete locked
        </PremiumButton>
      </div>
      <p className="text-sm leading-6 text-slate-500">
        Permanent delete stays locked until workspace write behavior is re-verified in live runtime.
        Archive is the safe cleanup path for now.
      </p>
    </div>
  );
}

function RenamePanel({
  workspaceId,
  renameValue,
  onChange,
  onCancel
}: {
  workspaceId: string;
  renameValue: string;
  onChange: (value: string) => void;
  onCancel: () => void;
}) {
  return (
    <form action={renameWorkspace} className="flex flex-col gap-3 rounded-[22px] bg-white/72 p-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="returnTo" value={APP_ROUTES.projects} />
      <input
        name="name"
        value={renameValue}
        onChange={(event) => onChange(event.target.value)}
        className="input"
        placeholder="Rename project"
      />
      <div className="flex flex-wrap gap-3">
        <PremiumButton variant="cta" disabled={!renameValue.trim()}>
          Save rename
        </PremiumButton>
        <PremiumButton type="button" variant="quiet" onClick={onCancel}>
          Cancel
        </PremiumButton>
      </div>
    </form>
  );
}

function FullProjectCard({
  project,
  renameOpen,
  renameValue,
  onRenameStart,
  onRenameChange,
  onRenameCancel
}: {
  project: DashboardBoardProject;
  renameOpen: boolean;
  renameValue: string;
  onRenameStart: (project: DashboardBoardProject) => void;
  onRenameChange: (value: string) => void;
  onRenameCancel: () => void;
}) {
  return (
    <section className="premium-surface rounded-[28px] p-4 xl:p-5">
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.95fr)_minmax(210px,0.7fr)] xl:gap-5">
        <div className="min-w-0 space-y-3.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ProjectTag>{project.templateLabel}</ProjectTag>
              <ProjectTag tone={project.statusTone}>{project.statusLabel}</ProjectTag>
              {project.accessMode === "member" ? <ProjectTag>Shared</ProjectTag> : null}
              {project.likelyDuplicateCount > 1 ? (
                <ProjectTag tone="amber">Likely duplicate</ProjectTag>
              ) : null}
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              {project.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {project.primaryUserLabel
                ? `Built for ${project.primaryUserLabel}.`
                : project.currentPhaseLabel
                  ? `Currently in ${project.currentPhaseLabel.toLowerCase()}.`
                  : "SaaS scope and first-build detail are still being defined."}
            </p>
          </div>

          <ProjectSummaryBlock project={project} />

          <ProjectScopeSnapshot project={project} />

          {project.likelyDuplicateCount > 1 ? (
            <div className="rounded-[20px] border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-800">
              This project shares the same visible title and summary with{" "}
              {project.likelyDuplicateCount - 1} other record
              {project.likelyDuplicateCount > 2 ? "s" : ""}. Archive the extras only if you know
              they are no longer needed.
            </div>
          ) : null}
        </div>

        <div className="min-w-0 space-y-4 border-t border-slate-200/70 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
          <ProjectMetaGrid project={project} />

          <ProjectStageTrack project={project} />

          <ProjectSystemsBlock project={project} />
        </div>

        <div className="min-w-0 space-y-3.5 border-t border-slate-200/70 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
          <ProjectPortalOpenForm
            workspaceId={project.id}
            destination={project.route}
            label="Open"
            className="button-secondary w-full justify-center"
          />

          <ProjectManagementBar project={project} onRename={onRenameStart} />
        </div>

        {renameOpen ? (
          <div className="xl:col-span-3">
            <RenamePanel
              workspaceId={project.id}
              renameValue={renameValue}
              onChange={onRenameChange}
              onCancel={onRenameCancel}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CompactProjectCard({
  project,
  actionLabel,
  primaryAction,
  destructiveAction,
  ownerHint,
  renameOpen,
  renameValue,
  onRenameStart,
  onRenameChange,
  onRenameCancel
}: {
  project: DashboardBoardProject;
  actionLabel: string;
  primaryAction: ReactNode;
  destructiveAction?: ReactNode;
  ownerHint: string;
  renameOpen: boolean;
  renameValue: string;
  onRenameStart: (project: DashboardBoardProject) => void;
  onRenameChange: (value: string) => void;
  onRenameCancel: () => void;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">{project.title}</p>
            <ProjectTag>{project.templateLabel}</ProjectTag>
            <ProjectTag>Archived</ProjectTag>
            {project.accessMode === "member" ? <ProjectTag>Shared</ProjectTag> : null}
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Archived projects stay out of the main view until you restore them.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
            {actionLabel} | Created {project.createdAtLabel}
          </p>
        </div>

        <ProjectPortalOpenForm
          workspaceId={project.id}
          destination={project.route}
          label="Open"
          className="button-secondary"
        />
      </div>

      {renameOpen ? (
        <div className="mt-4">
          <RenamePanel
            workspaceId={project.id}
            renameValue={renameValue}
            onChange={onRenameChange}
            onCancel={onRenameCancel}
          />
        </div>
      ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
        {project.accessMode === "owner" ? (
          <>
            <PremiumButton type="button" variant="ghost" onClick={() => onRenameStart(project)}>
              Rename
            </PremiumButton>
            {primaryAction}
            {destructiveAction}
          </>
        ) : (
          <div className="rounded-[18px] bg-white/75 px-3 py-2 text-sm text-slate-500">
            Owner-only cleanup actions are unavailable on shared projects.
          </div>
        )}
      </div>
      {project.accessMode === "owner" ? (
        <div className="mt-3 rounded-[18px] bg-white/72 px-4 py-3 text-sm leading-6 text-slate-500">
          {ownerHint}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardBoard({
  projects,
  archivedProjects
}: DashboardBoardProps) {
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [projectBoardView, setProjectBoardView] = useState<ProjectBoardView>("current");
  const [assetWorkspaceId, setAssetWorkspaceId] = useState(projects[0]?.id ?? "");

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === assetWorkspaceId) ?? null,
    [assetWorkspaceId, projects]
  );
  const resumeProjectWorkspaceId = selectedProject?.id ?? null;

  function startRename(project: DashboardBoardProject) {
    setRenameProjectId(project.id);
    setRenameValue(project.title);
  }

  function stopRename() {
    setRenameProjectId(null);
    setRenameValue("");
  }

  return (
    <div className="space-y-6">
      <PrimaryPanel
        title="Projects"
        subtitle="Projects"
        action={
          <div className="flex flex-wrap items-center gap-3">
            {resumeProjectWorkspaceId ? (
              <ProjectPortalOpenForm
                workspaceId={resumeProjectWorkspaceId}
                destination={APP_ROUTES.dashboard}
                label="Resume Project"
                className="button-secondary"
              />
            ) : (
              <Link href={APP_ROUTES.projects} className="button-secondary">
                Resume Project
              </Link>
            )}
            <Link href={APP_ROUTES.projectsNew} className="button-primary">
              New Project
            </Link>
            <a href="#assets-inputs" className="button-secondary">
              Upload Assets
            </a>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[24px] bg-white/72 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex w-fit rounded-full border border-slate-200/80 bg-white/86 p-1">
                <button
                  type="button"
                  onClick={() => setProjectBoardView("current")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    projectBoardView === "current"
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  Current ({projects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProjectBoardView("archived")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    projectBoardView === "archived"
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  Archived ({archivedProjects.length})
                </button>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                {projectBoardView === "current"
                  ? "Current projects stay front and center. Archive is the safe cleanup action when a project is no longer active."
                  : "Archived projects stay tucked out of the main view until you need them. Restore brings them back, and permanent delete stays controlled here."}
              </p>
            </div>
          </div>
          {projectBoardView === "current" ? (
            projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <FullProjectCard
                    key={project.id}
                    project={project}
                    renameOpen={renameProjectId === project.id}
                    renameValue={renameValue}
                    onRenameStart={startRename}
                    onRenameChange={setRenameValue}
                    onRenameCancel={stopRename}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] bg-white/72 px-6 py-10 text-center">
                <p className="text-2xl font-semibold text-slate-950">No current projects yet</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Create a new project to start the board and let Neroa coordinate the first execution
                  phase.
                </p>
                <div className="mt-6">
                  <Link href={APP_ROUTES.projectsNew} className="button-primary">
                    New Project
                  </Link>
                </div>
              </div>
            )
          ) : archivedProjects.length > 0 ? (
            <div className="space-y-4">
              {archivedProjects.map((project) => (
                <CompactProjectCard
                  key={project.id}
                  project={{
                    ...project,
                    statusLabel: "Archived"
                  }}
                  actionLabel="Recoverable cleanup state"
                  primaryAction={
                    <ProjectActionForm
                      workspaceId={project.id}
                      formAction={restoreWorkspace}
                      label="Restore"
                      variant="ghost"
                    />
                  }
                  destructiveAction={
                    project.accessMode === "owner" ? (
                      <ProjectActionForm
                        workspaceId={project.id}
                        formAction={deleteWorkspace}
                        label="Delete permanently"
                        variant="quiet"
                        confirmMessage={`Delete "${project.title}" permanently? This cannot be undone.`}
                      />
                    ) : undefined
                  }
                  ownerHint="Restore returns this project to the main current view. Delete permanently stays owner-only and requires confirmation."
                  renameOpen={renameProjectId === project.id}
                  renameValue={renameValue}
                  onRenameStart={startRename}
                  onRenameChange={setRenameValue}
                  onRenameCancel={stopRename}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white/72 px-5 py-5 text-sm leading-7 text-slate-500">
              No archived projects yet.
            </div>
          )}
        </div>
      </PrimaryPanel>

      <div id="assets-inputs" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <PrimaryPanel title="Assets & inputs" subtitle="Tracked project context">
          {projects.length > 0 ? (
            <div className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Project
                  </span>
                  <select
                    value={assetWorkspaceId}
                    onChange={(event) => setAssetWorkspaceId(event.target.value)}
                    className="input"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-[20px] bg-white/78 px-4 py-4 text-sm leading-7 text-slate-600">
                  Select which project's tracked inputs you want to review. New asset uploads are
                  currently gated until the file-storage path is live end to end.
                </div>
              </div>

              <div className="rounded-[24px] bg-white/72 px-5 py-5">
                <p className="text-sm font-semibold text-slate-950">Upload not live yet</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The current control only stages local file metadata and does not persist real file
                  bytes to storage. To keep the Projects portal honest, Neroa now disables this
                  flow until project asset storage is wired end to end.
                </p>
                <div className="mt-4 rounded-[20px] bg-white/80 px-4 py-4 text-sm leading-6 text-slate-500">
                  Existing tracked inputs still appear on the right when they already exist on a
                  project. New uploads are temporarily unavailable.
                </div>
              </div>

              <PremiumButton variant="quiet" disabled>
                Upload not live yet
              </PremiumButton>
            </div>
          ) : (
            <div className="rounded-[24px] bg-white/72 px-5 py-5 text-sm leading-7 text-slate-500">
              Assets attach to current projects only. Restore or create a current project first if
              you want to upload new context.
            </div>
          )}
        </PrimaryPanel>

        <SecondaryPanel title="Tracked inputs">
          {selectedProject && selectedProject.assets.length > 0 ? (
            <div className="space-y-3">
              {selectedProject.assets.map((asset) => (
                <div key={asset.id} className="rounded-[20px] bg-white/75 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">{asset.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {asset.kind}
                    {asset.sizeLabel ? ` - ${asset.sizeLabel}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-slate-500">
              No tracked assets yet for this project.
            </p>
          )}
        </SecondaryPanel>
      </div>
    </div>
  );
}
