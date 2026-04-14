"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  archiveWorkspace,
  deleteWorkspace,
  duplicateWorkspace,
  registerWorkspaceAssets,
  renameWorkspace
} from "@/app/workspace/actions";
import { PremiumButton, PrimaryPanel, SecondaryPanel } from "@/components/workspace/premium-lane-ui";

export type DashboardBoardProject = {
  id: string;
  title: string;
  description: string | null;
  route: string;
  templateLabel: string;
  statusLabel: string;
  currentPhaseLabel: string | null;
  currentPhaseSummary: string | null;
  leadingLaneTitle: string | null;
  laneCount: number;
  assetCount: number;
  lastUpdatedLabel: string;
  activeAiStack: string[];
  recentOutputs: string[];
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

function inferAssetKind(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (file.type.includes("pdf") || extension === "pdf") {
    return "PDF";
  }

  if (file.type.startsWith("image/")) {
    return "Image";
  }

  if (file.type.includes("sheet") || ["csv", "xlsx", "xls"].includes(extension)) {
    return "Spreadsheet";
  }

  if (["doc", "docx", "txt", "md"].includes(extension)) {
    return "Document";
  }

  return "Input";
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

function ProjectActionButton({
  children,
  variant = "ghost",
  formAction,
  disabled = false
}: {
  children: string;
  variant?: "cta" | "ghost" | "quiet";
  formAction?: (formData: FormData) => Promise<void>;
  disabled?: boolean;
}) {
  return (
    <PremiumButton formAction={formAction} variant={variant} disabled={disabled} className="px-4 py-2 text-sm">
      {children}
    </PremiumButton>
  );
}

export default function DashboardBoard({
  projects,
  archivedProjects
}: DashboardBoardProps) {
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [assetWorkspaceId, setAssetWorkspaceId] = useState(projects[0]?.id ?? "");
  const [selectedAssets, setSelectedAssets] = useState<
    Array<{
      id: string;
      name: string;
      kind: string;
      sizeLabel: string | null;
      addedAt: string;
    }>
  >([]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === assetWorkspaceId) ?? null,
    [assetWorkspaceId, projects]
  );

  return (
    <div className="space-y-6">
      <PrimaryPanel
        title="Open engines"
        subtitle="Engine board"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/start" className="button-primary">
              New Engine
            </Link>
            <a href="#assets-inputs" className="button-secondary">
              Upload Assets
            </a>
          </div>
        }
      >
        {projects.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {projects.map((project) => {
              const renameOpen = renameProjectId === project.id;

              return (
                <section key={project.id} className="premium-surface rounded-[28px] p-5">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="premium-pill text-slate-500">{project.templateLabel}</span>
                          <span className="premium-pill text-cyan-700">{project.statusLabel}</span>
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                          {project.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {project.description || "No engine summary added yet."}
                        </p>
                      </div>

                      <Link href={project.route} className="button-secondary">
                        Open
                      </Link>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Current phase
                          </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">
                          {project.currentPhaseLabel ?? "Not set"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {project.currentPhaseSummary
                            ? `${project.currentPhaseSummary}${
                                project.leadingLaneTitle ? ` Leading lane: ${project.leadingLaneTitle}.` : ""
                              }`
                              : project.leadingLaneTitle
                                ? `Leading lane: ${project.leadingLaneTitle}`
                              : "Naroa will identify the leading phase as the engine sharpens."}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Lanes
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{project.laneCount}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Assets
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{project.assetCount}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Last updated
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{project.lastUpdatedLabel}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Active AI stack
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.activeAiStack.map((item) => (
                          <span key={item} className="premium-pill text-slate-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Output snapshot
                      </p>
                      <div className="mt-3 space-y-2">
                        {project.recentOutputs.length > 0 ? (
                          project.recentOutputs.map((item) => (
                            <div
                              key={item}
                              className="rounded-[20px] bg-white/75 px-4 py-3 text-sm leading-6 text-slate-600"
                            >
                              {item}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-[20px] bg-white/75 px-4 py-3 text-sm leading-6 text-slate-500">
                            Outputs will begin appearing here as Naroa and the lane stack generate engine artifacts.
                          </div>
                        )}
                      </div>
                    </div>

                    {renameOpen ? (
                      <form action={renameWorkspace} className="flex flex-col gap-3 rounded-[22px] bg-white/72 p-4">
                        <input type="hidden" name="workspaceId" value={project.id} />
                        <input type="hidden" name="returnTo" value="/dashboard" />
                        <input
                          name="name"
                          value={renameValue}
                          onChange={(event) => setRenameValue(event.target.value)}
                          className="input"
                          placeholder="Rename engine"
                        />
                        <div className="flex flex-wrap gap-3">
                          <PremiumButton variant="cta" disabled={!renameValue.trim()}>
                            Save rename
                          </PremiumButton>
                          <PremiumButton
                            type="button"
                            variant="quiet"
                            onClick={() => {
                              setRenameProjectId(null);
                              setRenameValue("");
                            }}
                          >
                            Cancel
                          </PremiumButton>
                        </div>
                      </form>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <PremiumButton
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setRenameProjectId(project.id);
                          setRenameValue(project.title);
                        }}
                      >
                        Rename
                      </PremiumButton>

                      <form>
                        <input type="hidden" name="workspaceId" value={project.id} />
                        <input type="hidden" name="returnTo" value="/dashboard" />
                        <ProjectActionButton formAction={duplicateWorkspace}>
                          Duplicate
                        </ProjectActionButton>
                      </form>

                      <form>
                        <input type="hidden" name="workspaceId" value={project.id} />
                        <input type="hidden" name="returnTo" value="/dashboard" />
                        <ProjectActionButton formAction={archiveWorkspace}>
                          Archive
                        </ProjectActionButton>
                      </form>

                      <form>
                        <input type="hidden" name="workspaceId" value={project.id} />
                        <input type="hidden" name="returnTo" value="/dashboard" />
                        <ProjectActionButton formAction={deleteWorkspace} variant="quiet">
                          Delete
                        </ProjectActionButton>
                      </form>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white/72 px-6 py-10 text-center">
            <p className="text-2xl font-semibold text-slate-950">No open engines yet</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Create a new engine to start the board and let Naroa coordinate the first execution phase.
            </p>
            <div className="mt-6">
              <Link href="/start" className="button-primary">
                New Engine
              </Link>
            </div>
          </div>
        )}
      </PrimaryPanel>

      <div id="assets-inputs" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <PrimaryPanel title="Assets & inputs" subtitle="Upload engine context">
          <form action={registerWorkspaceAssets} className="space-y-5">
            <input type="hidden" name="workspaceId" value={assetWorkspaceId} />
            <input type="hidden" name="returnTo" value="/dashboard#assets-inputs" />
            <input
              type="hidden"
              name="assetPayload"
              value={JSON.stringify(selectedAssets)}
            />

            <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Engine
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

              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Files
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setSelectedAssets(
                      files.map((file) => ({
                        id: `${file.name}-${file.size}-${file.lastModified}`,
                        name: file.name,
                        kind: inferAssetKind(file),
                        sizeLabel: formatSize(file.size),
                        addedAt: new Date().toISOString()
                      }))
                    );
                  }}
                  className="input file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300/12 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700"
                />
              </label>
            </div>

            <div className="rounded-[24px] bg-white/72 px-5 py-5">
              <p className="text-sm font-semibold text-slate-950">Supported inputs</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Logos, PDFs, plans, notes, screenshots, spreadsheets, and other reference files can be attached to the board and tied to the selected engine.
              </p>

              {selectedAssets.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {selectedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between gap-3 rounded-[18px] bg-white/80 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">{asset.name}</p>
                        <p className="mt-1 text-slate-500">
                          {asset.kind}
                          {asset.sizeLabel ? ` - ${asset.sizeLabel}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[20px] bg-white/80 px-4 py-4 text-sm leading-6 text-slate-500">
                  Choose files to register them as engine inputs.
                </div>
              )}
            </div>

            <PremiumButton variant="cta" disabled={!assetWorkspaceId || selectedAssets.length === 0}>
              Upload Assets
            </PremiumButton>
          </form>
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
              No tracked assets yet for this engine.
            </p>
          )}
        </SecondaryPanel>
      </div>

      {archivedProjects.length > 0 ? (
        <SecondaryPanel title="Archived engines">
          <div className="space-y-3">
            {archivedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between gap-4 rounded-[22px] bg-white/72 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950">{project.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{project.templateLabel}</p>
                </div>
                <span className="premium-pill text-slate-500">Archived</span>
              </div>
            ))}
          </div>
        </SecondaryPanel>
      ) : null}
    </div>
  );
}
