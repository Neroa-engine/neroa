import type { ReactNode } from "react";
import type {
  CommandCenterAnalyzerPanel,
  CommandCenterChangeImpactReview,
  CommandCenterBrandSystemPanel,
  CommandCenterBrowserPanel,
  CommandCenterDecisionInbox,
  CommandCenterDesignPreviewArchitecture,
  CommandCenterDesignLibraryPanel,
  CommandCenterListPanel,
  CommandCenterProductionStatusPanel,
  CommandCenterPromptRunnerPanel,
  CommandCenterRoomState,
  CommandCenterStateBand,
  CommandCenterTaskQueuePanel,
  CommandCenterTruthSource
} from "@/lib/workspace/command-center-summary";
import type { LiveViewSession } from "@/lib/live-view/types";
import { isBrowserRuntimeReadyForPreview } from "@/lib/workspace/browser-runtime-bridge";
import {
  formatCommandCenterPreviewSurfaceTarget,
  listCommandCenterDensityModes,
  listCommandCenterPreviewSurfaceTargets
} from "@/lib/workspace/command-center-design-preview";
import {
  updateCommandCenterBrandSystem,
  updateCommandCenterTask,
  updateCommandCenterApprovedDesignPackage,
  updateCommandCenterPreviewState
} from "@/app/workspace/[workspaceId]/command-center/actions";
import { CommandCenterBrowserRuntimePanel } from "@/components/workspace/command-center-browser-runtime-panel";
import { CommandCenterPanel, CommandCenterSourceBadge } from "@/components/workspace/command-center-ui";
import { CommandCenterPopoverBar } from "@/components/workspace/command-center-popover-bar";
import { DecisionItemCard } from "@/components/workspace/command-center-decision-inbox";
import { ChangeImpactItemCard } from "@/components/workspace/command-center-change-impact-review";
import { CommandCenterSmartOperatorSurface } from "@/components/workspace/command-center-smart-operator-surface";

function truthToneClasses(source: CommandCenterTruthSource) {
  if (source === "future-system") {
    return "border-amber-300/35 bg-amber-50/80 text-amber-700";
  }

  if (source === "preview-control-truth") {
    return "border-violet-300/35 bg-violet-100/70 text-violet-700";
  }

  if (source === "real-project-truth") {
    return "border-emerald-300/35 bg-emerald-50/80 text-emerald-700";
  }

  return "border-cyan-300/35 bg-cyan-300/12 text-cyan-700";
}

function renderList(
  items: string[],
  emptyState: string,
  dotClass = "bg-cyan-500",
  textClass = "text-slate-700",
  emptyClass = "text-slate-500"
) {
  if (items.length === 0) {
    return <p className={`text-sm leading-7 ${emptyClass}`}>{emptyState}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-3 text-sm leading-7 ${textClass}`}>
          <span className={`mt-2 h-1.5 w-1.5 rounded-full ${dotClass}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const BRAND_COLOR_FALLBACKS = {
  primary: "#0F172A",
  secondary: "#475569",
  accent: "#0EA5E9",
  background: "#F8FAFC",
  text: "#111827"
} as const;

function resolveBrandColorPreview(
  value: string | null | undefined,
  fallback: keyof typeof BRAND_COLOR_FALLBACKS
) {
  if (value && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
    return value;
  }

  return BRAND_COLOR_FALLBACKS[fallback];
}

function BrandAssetReferenceCard({
  label,
  asset
}: {
  label: string;
  asset:
    | {
        name: string;
        sizeLabel: string | null;
      }
    | undefined;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">
        {asset ? asset.name : "No file attached yet"}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {asset?.sizeLabel
          ? `${asset.sizeLabel} tracked in the current brand profile.`
          : "Add a file here to attach it to the brand profile for this workspace."}
      </p>
    </div>
  );
}

function BrandColorField({
  label,
  tone,
  value,
  fallback
}: {
  label: string;
  tone: "primary" | "secondary" | "accent" | "background" | "text";
  value: string | null;
  fallback: keyof typeof BRAND_COLOR_FALLBACKS;
}) {
  const previewColor = resolveBrandColorPreview(value, fallback);

  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="h-5 w-5 rounded-full border border-slate-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45)]"
            style={{ backgroundColor: previewColor }}
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            {label}
          </p>
        </div>
        <input
          type="color"
          name={`${tone}ColorPicker`}
          defaultValue={previewColor}
          className="h-10 w-10 cursor-pointer rounded-[12px] border border-slate-200 bg-white p-1"
        />
      </div>
      <input
        type="text"
        name={`${tone}ColorValue`}
        defaultValue={value ?? previewColor}
        className="input mt-3 border-slate-200 bg-white text-slate-950"
        placeholder={previewColor}
      />
    </div>
  );
}

function CommandCenterBrandControlsTrigger({
  workspaceId,
  brandSystem,
  canManage
}: {
  workspaceId: string;
  brandSystem: CommandCenterBrandSystemPanel;
  canManage: boolean;
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;
  const logoAsset = brandSystem.assets.find((asset) => asset.kind === "brand_logo");
  const iconAsset = brandSystem.assets.find((asset) => asset.kind === "brand_icon");
  const referenceAsset = brandSystem.assets.find((asset) => asset.kind === "brand_reference");

  return (
    <CommandCenterPopoverBar
      className="!w-auto"
      align="right"
      summaryClassName="!w-auto !border-transparent !bg-[linear-gradient(135deg,#38bdf8,#3b82f6_52%,#8b5cf6)] px-4 py-3 text-sm font-semibold !text-slate-50 !shadow-[0_20px_52px_rgba(59,130,246,0.34)] hover:!brightness-[1.04]"
      bubbleClassName="!w-[min(78rem,calc(100vw-3rem))] max-h-[min(88vh,58rem)] overflow-y-auto !rounded-[28px] !border-slate-300 !bg-white !shadow-[0_42px_110px_rgba(15,23,42,0.28)] !ring-1 !ring-slate-950/10"
      summary={<span>Open Brand Controls</span>}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Brand controls
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Adjust the brand profile Neroa should protect across preview packages and later implementation work.
          </p>
        </div>
        <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700">
          Preview state
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Identity: {brandSystem.currentIdentity}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Colorway: {brandSystem.currentColorway}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Assets: {brandSystem.assetState}
        </span>
        {brandSystem.motto ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            Motto saved
          </span>
        ) : null}
      </div>

      {canManage ? (
        <form
          action={updateCommandCenterBrandSystem}
          className="mt-5 space-y-5"
        >
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="returnTo" value={returnTo} />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <BrandAssetReferenceCard label="Logo upload" asset={logoAsset} />
            <BrandAssetReferenceCard label="Icon upload" asset={iconAsset} />
            <BrandAssetReferenceCard label="Reference image" asset={referenceAsset} />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Logo file
              </span>
              <input
                type="file"
                name="logoFile"
                accept="image/*"
                className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
              />
            </label>
            <label className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Icon file
              </span>
              <input
                type="file"
                name="iconFile"
                accept="image/*"
                className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
              />
            </label>
            <label className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Reference image
              </span>
              <input
                type="file"
                name="referenceImageFile"
                accept="image/*"
                className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <BrandColorField
              label="Primary"
              tone="primary"
              value={brandSystem.colors.primary}
              fallback="primary"
            />
            <BrandColorField
              label="Secondary"
              tone="secondary"
              value={brandSystem.colors.secondary}
              fallback="secondary"
            />
            <BrandColorField
              label="Accent"
              tone="accent"
              value={brandSystem.colors.accent}
              fallback="accent"
            />
            <BrandColorField
              label="Background"
              tone="background"
              value={brandSystem.colors.background}
              fallback="background"
            />
            <BrandColorField
              label="Text"
              tone="text"
              value={brandSystem.colors.text}
              fallback="text"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Identity mode
              </span>
              <input
                type="text"
                name="identityMode"
                defaultValue={brandSystem.currentIdentity}
                className="input mt-3 border-slate-200 bg-white text-slate-950"
                placeholder="Wordmark, symbol, combined lockup..."
              />
            </label>
            <label className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Brand motto / positioning line
              </span>
              <input
                type="text"
                name="motto"
                defaultValue={brandSystem.motto ?? ""}
                className="input mt-3 border-slate-200 bg-white text-slate-950"
                placeholder="AI-powered tokenomics clarity"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Typography preference
              </span>
              <input
                type="text"
                name="typographyPreference"
                defaultValue={brandSystem.typographyPreference ?? ""}
                className="input mt-3 border-slate-200 bg-white text-slate-950"
                placeholder="Modern serif + clean sans"
              />
            </label>
            <label className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Visual mood
              </span>
              <input
                type="text"
                name="visualMood"
                defaultValue={brandSystem.visualMood ?? ""}
                className="input mt-3 border-slate-200 bg-white text-slate-950"
                placeholder="Premium, direct, cinematic..."
              />
            </label>
            <label className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Button style preference
              </span>
              <input
                type="text"
                name="buttonStylePreference"
                defaultValue={brandSystem.buttonStylePreference ?? ""}
                className="input mt-3 border-slate-200 bg-white text-slate-950"
                placeholder="Rounded glass, bold solid, minimal..."
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs leading-6 text-slate-600">
              Brand uploads are recorded as attached workspace asset references here, and the saved brand profile stays separate from source-code styling truth.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#command-center-design-library"
                className="rounded-[16px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:border-slate-300 hover:bg-slate-50"
              >
                Open full design controls
              </a>
              <button
                type="submit"
                className="rounded-[16px] border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(15,23,42,0.16)] transition hover:bg-slate-800"
              >
                Save brand controls
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Brand motto
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {brandSystem.motto ?? "No motto saved yet."}
              </p>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Brand assets
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{brandSystem.assetState}</p>
            </div>
          </div>
          <p className="text-xs leading-6 text-slate-600">
            Brand controls stay owner-scoped here. The current brand profile is still visible so the operator workflow remains clear.
          </p>
        </div>
      )}
    </CommandCenterPopoverBar>
  );
}

function formatDensityModeLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function queueStateClasses(state: CommandCenterPromptRunnerPanel["queue"][number]["queueState"]) {
  if (state === "next") {
    return "border-cyan-300/35 bg-cyan-300/12 text-cyan-700";
  }

  if (state === "queued") {
    return "border-amber-300/35 bg-amber-50/80 text-amber-700";
  }

  return "border-slate-200 bg-white/82 text-slate-500";
}

function queueStateLabel(state: CommandCenterPromptRunnerPanel["queue"][number]["queueState"]) {
  if (state === "next") {
    return "Next";
  }

  if (state === "queued") {
    return "Queued";
  }

  return "Waiting";
}

function promptExecutionLevelClasses(
  level: CommandCenterPromptRunnerPanel["queue"][number]["executionLevel"] | null
) {
  if (level === "Very High") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (level === "High") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (level === "Medium") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function PromptExecutionLevelGuide() {
  return (
    <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Execution Level Guide
      </p>
      <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        <p>
          <span className="font-semibold text-slate-950">Low</span> - lightweight check or
          simple update
        </p>
        <p>
          <span className="font-semibold text-slate-950">Medium</span> - focused task with
          moderate reasoning
        </p>
        <p>
          <span className="font-semibold text-slate-950">High</span> - important build, review,
          or coordination task needing strong reasoning
        </p>
        <p>
          <span className="font-semibold text-slate-950">Very High</span> - critical or complex
          task needing the deepest reasoning and highest care
        </p>
      </div>
    </div>
  );
}

function taskStatusClasses(status: CommandCenterTaskQueuePanel["nextTasks"][number]["status"]) {
  if (status === "active") {
    return "border-cyan-300/35 bg-cyan-300/12 text-cyan-700";
  }

  if (status === "in_review") {
    return "border-amber-300/35 bg-amber-50/80 text-amber-700";
  }

  if (status === "waiting_on_decision") {
    return "border-rose-300/35 bg-rose-50/80 text-rose-700";
  }

  if (status === "ready") {
    return "border-emerald-300/35 bg-emerald-50/80 text-emerald-700";
  }

  return "border-slate-200 bg-white/82 text-slate-500";
}

function taskStatusLabel(status: CommandCenterTaskQueuePanel["nextTasks"][number]["status"]) {
  if (status === "in_review") {
    return "In review";
  }

  if (status === "waiting_on_decision") {
    return "Waiting on answer";
  }

  if (status === "ready") {
    return "Ready";
  }

  if (status === "active") {
    return "Active";
  }

  if (status === "completed") {
    return "Completed";
  }

  return "Queued";
}

function compactControlChipClasses(tone: "neutral" | "warning" | "critical") {
  if (tone === "critical") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function CompactStatusSummaryCard({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[2.4rem] flex-col justify-center gap-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <div className="flex min-h-[1.25rem] flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const EXECUTION_USAGE_SUMMARY_FIELDS = [
  { label: "Credits Remaining", value: "4,820", tone: "available" },
  { label: "Next Step Estimate", value: "45", tone: "usage" },
  { label: "Estimated Credits to Finish", value: "620", tone: "usage" },
  { label: "Credits Used So Far", value: "180", tone: "usage" },
  { label: "Credits Used Today", value: "45", tone: "usage" }
] as const;

function executionUsageMetricClasses(
  tone: (typeof EXECUTION_USAGE_SUMMARY_FIELDS)[number]["tone"]
) {
  if (tone === "available") {
    return {
      row: "border-teal-200/24 bg-emerald-300/10",
      label: "text-teal-50/92",
      value: "text-emerald-100"
    };
  }

  return {
    row: "border-red-200/24 bg-red-300/10",
    label: "text-red-50/92",
    value: "text-red-100"
  };
}

function taskSourceLabel(sourceType: CommandCenterTaskQueuePanel["nextTasks"][number]["sourceType"]) {
  if (sourceType === "customer_request") {
    return "Customer request";
  }

  if (sourceType === "decision_follow_up") {
    return "Decision follow-up";
  }

  if (sourceType === "change_review_follow_up") {
    return "Change review";
  }

  if (sourceType === "roadmap_follow_up") {
    return "Roadmap follow-up";
  }

  return "Signal cleanup";
}

function taskActionOptions(status: CommandCenterTaskQueuePanel["nextTasks"][number]["status"]) {
  if (status === "active") {
    return [
      { label: "Review", nextStatus: "in_review" },
      { label: "Complete", nextStatus: "completed" }
    ] as const;
  }

  if (status === "in_review") {
    return [
      { label: "Mark ready", nextStatus: "ready" },
      { label: "Complete", nextStatus: "completed" }
    ] as const;
  }

  if (status === "waiting_on_decision") {
    return [
      { label: "Mark review", nextStatus: "in_review" },
      { label: "Mark ready", nextStatus: "ready" }
    ] as const;
  }

  if (status === "completed") {
    return [{ label: "Reopen", nextStatus: "queued" }] as const;
  }

  if (status === "ready") {
    return [
      { label: "Go active", nextStatus: "active" },
      { label: "Review", nextStatus: "in_review" }
    ] as const;
  }

  return [
    { label: "Mark ready", nextStatus: "ready" },
    { label: "Go active", nextStatus: "active" }
  ] as const;
}

function TaskStatusActions({
  workspaceId,
  task
}: {
  workspaceId: string;
  task: CommandCenterTaskQueuePanel["nextTasks"][number];
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {taskActionOptions(task.status).map((action) => (
        <form key={action.nextStatus} action={updateCommandCenterTask}>
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="mutation" value="set_status" />
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="title" value={task.title} />
          <input type="hidden" name="request" value={task.request} />
          <input type="hidden" name="roadmapArea" value={task.roadmapArea} />
          <input type="hidden" name="sourceType" value={task.sourceType} />
          <input type="hidden" name="nextStatus" value={action.nextStatus} />
          <button
            type="submit"
            className="rounded-full border border-slate-200 bg-white/82 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
          >
            {action.label}
          </button>
        </form>
      ))}
    </div>
  );
}

function TaskRow({
  task,
  compact = false,
  actionContent
}: {
  task: CommandCenterTaskQueuePanel["nextTasks"][number];
  compact?: boolean;
  actionContent?: ReactNode;
}) {
  return (
    <details
      className={`group rounded-[18px] border border-slate-200/70 bg-slate-50/80 ${
        compact ? "px-2.5 py-2" : "px-4 py-3.5"
      }`}
    >
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <p className={`font-semibold text-slate-950 ${compact ? "text-xs" : "text-sm"}`}>
            {task.promptRunId}
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 transition group-open:text-cyan-700">
            {compact ? "Open" : "Details"}
          </span>
        </div>
      </summary>

      <div className="mt-2 rounded-[22px] border border-slate-200/70 bg-white/92 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${taskStatusClasses(
                  task.status
                )}`}
              >
                {taskStatusLabel(task.status)}
              </span>
              <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {task.roadmapArea}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-950">{task.title}</p>
          </div>

          <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {task.promptRunId}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {taskSourceLabel(task.sourceType)}
          </span>
          <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Supports {task.roadmapArea}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">{task.request}</p>
        {actionContent ? <div className="mt-3">{actionContent}</div> : null}
      </div>
    </details>
  );
}

function renderHiddenPreviewControlFields(
  architecture: CommandCenterDesignPreviewArchitecture,
  source = "browser_preview_panel"
) {
  const controls = architecture.previewState.selectedControls;
  const surfaceTargets =
    controls.surfaceTargets.length > 0 ? controls.surfaceTargets : ["command_center"];

  return (
    <>
      <input type="hidden" name="designMode" value={controls.designMode ?? ""} />
      <input type="hidden" name="colorway" value={controls.colorway ?? ""} />
      <input type="hidden" name="buttonStyle" value={controls.buttonStyle ?? ""} />
      <input type="hidden" name="typographyStyle" value={controls.typographyStyle ?? ""} />
      <input type="hidden" name="densityMode" value={controls.densityMode ?? ""} />
      <input type="hidden" name="layoutPreset" value={controls.layoutPreset ?? ""} />
      <input type="hidden" name="roomPreset" value={controls.roomPreset ?? ""} />
      <input type="hidden" name="notes" value={architecture.previewState.notes ?? ""} />
      <input type="hidden" name="source" value={source} />
      {surfaceTargets.map((target) => (
        <input key={target} type="hidden" name="surfaceTargets" value={target} />
      ))}
    </>
  );
}

function CommandCenterPreviewUtilityButton({
  label,
  title,
  body,
  tone = "default"
}: {
  label: string;
  title: string;
  body: string;
  tone?:
    | "default"
    | "warning"
    | "muted"
    | "primary"
    | "review"
    | "record"
    | "qc"
    | "blocked";
}) {
  const summaryClassName =
    tone === "primary"
      ? "!w-auto !min-h-0 whitespace-nowrap rounded-full border-sky-300/65 bg-[linear-gradient(135deg,#38bdf8,#4f46e5)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_16px_36px_rgba(59,130,246,0.28)]"
      : tone === "review"
        ? "!w-auto !min-h-0 whitespace-nowrap rounded-full border-amber-300/50 bg-amber-400/16 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100"
        : tone === "record"
          ? "!w-auto !min-h-0 whitespace-nowrap rounded-full border-fuchsia-300/45 bg-fuchsia-400/14 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100"
          : tone === "qc"
            ? "!w-auto !min-h-0 whitespace-nowrap rounded-full border-teal-300/45 bg-teal-400/14 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-100"
            : tone === "warning"
              ? "!w-auto !min-h-0 whitespace-nowrap rounded-full border-amber-300/35 bg-amber-300/12 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100"
              : tone === "blocked"
                ? "!w-auto !min-h-0 whitespace-nowrap rounded-full border-white/16 bg-[#152338] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-100"
                : tone === "muted"
                  ? "!w-auto !min-h-0 whitespace-nowrap rounded-full border-white/14 bg-[#121b2c] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300"
                  : "!w-auto !min-h-0 whitespace-nowrap rounded-full border-white/18 bg-[#17243b] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-100";
  const titleClassName =
    tone === "primary"
      ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200"
      : tone === "review"
        ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200"
        : tone === "record"
          ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-fuchsia-200"
          : tone === "qc"
            ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-200"
            : tone === "warning"
              ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200"
              : tone === "blocked"
                ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100"
                : tone === "muted"
                  ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
                  : "text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200";

  return (
    <CommandCenterPopoverBar
      tone="dark"
      className="!w-auto"
      summaryClassName={summaryClassName}
      bubbleClassName="w-[min(24rem,calc(100vw-2.5rem))]"
      summary={<span>{label}</span>}
    >
      <div>
        <p className={titleClassName}>{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{body}</p>
      </div>
    </CommandCenterPopoverBar>
  );
}

function CommandCenterSmartOperatorTopStripView({
  workspaceId,
  projectId,
  browserStatus,
  designPreviewArchitecture,
  brandSystem,
  roomState,
  projectTitle,
  initialLiveViewSession,
  roadmapLabel,
  activePhase,
  canManage
}: {
  workspaceId: string;
  projectId: string;
  browserStatus: CommandCenterBrowserPanel;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  brandSystem: CommandCenterBrandSystemPanel;
  roomState: CommandCenterRoomState;
  projectTitle: string;
  initialLiveViewSession: LiveViewSession | null;
  roadmapLabel: string;
  activePhase: CommandCenterStateBand;
  canManage: boolean;
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;
  const previewState = designPreviewArchitecture.previewState;
  const previewMutation = previewState.state === "inactive" ? "start_preview" : "update_preview";
  const previewLabel = previewState.state === "inactive" ? "Stage preview" : "Refresh preview";
  const projectPictureIssues = roomState.issues.slice(0, 3);
  const browserReady = isBrowserRuntimeReadyForPreview(browserStatus.runtimeState);
  const previewUnavailableBody =
    browserStatus.runtimeState === "awaiting_bind"
      ? "Preview controls are waiting for the Live View extension heartbeat. Open Browser and keep the Live View window active until the runtime turns Connected."
      : browserStatus.runtimeState === "session_stale" ||
          browserStatus.runtimeState === "reconnect_needed"
        ? "The last live session is no longer fresh enough for trustworthy preview work. Reconnect Browser before staging preview changes."
        : browserStatus.runtimeState === "error"
          ? "The current browser session hit an error, so preview controls stay paused until Browser reconnects cleanly."
          : "Open Browser first. Design Library preview stays blocked until a real connected live session exists.";
  const pendingRuntimeToolsBody =
    browserStatus.runtimeState === "connected" || browserStatus.runtimeState === "preview_active"
      ? "Live inspection is active and Design Library can use this same session, but Review, QC, and Record stay in the pending-tool lane until fresh bind is consistently stable and their producer paths are truly live."
      : browserStatus.runtimeState === "awaiting_bind"
        ? "Smart Operator is still waiting for the first real bind on this session. Inspect traffic alone is not enough to promote Review, QC, or Record into primary operator controls yet."
        : browserStatus.runtimeState === "session_stale" ||
            browserStatus.runtimeState === "reconnect_needed"
          ? "This room still has prior browser context, but it should not be treated as current operator truth. Review, QC, and Record stay secondary until Browser reconnects cleanly."
          : browserStatus.runtimeState === "error"
            ? "A browser/runtime error is still blocking trustworthy browser-side tools. Keep Review, QC, and Record in the pending lane until Browser recovers."
            : "Browser is not connected yet, so Review, QC, and Record stay as pending runtime tools rather than live operator actions.";

  return (
    <div className="flex flex-wrap items-start gap-2.5 rounded-[22px] border border-white/12 bg-[#0b1628]/92 px-3.5 py-3.5 shadow-[0_22px_56px_rgba(2,6,23,0.22)]">
      <div className="min-w-[15rem] flex-[1.2_1_18rem]">
        <CommandCenterBrowserRuntimePanel
          workspaceId={workspaceId}
          projectId={projectId}
          projectTitle={projectTitle}
          initialBrowserStatus={browserStatus}
          initialLiveViewSession={initialLiveViewSession}
          presentation="chat"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canManage && browserReady ? (
          <form action={updateCommandCenterPreviewState}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="mutation" value={previewMutation} />
            {renderHiddenPreviewControlFields(
              designPreviewArchitecture,
              "command_center_smart_operator_strip"
            )}
            <button
              type="submit"
              className="rounded-full border border-sky-300/70 bg-[linear-gradient(135deg,#38bdf8,#4f46e5)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_38px_rgba(59,130,246,0.3)] transition hover:brightness-[1.06]"
            >
              {previewLabel}
            </button>
          </form>
        ) : canManage ? (
          <CommandCenterPreviewUtilityButton
            label="Preview blocked"
            title="Preview needs Browser"
            body={previewUnavailableBody}
            tone="blocked"
          />
        ) : (
          <CommandCenterPreviewUtilityButton
            label={previewLabel}
            title="Preview controls"
            body="Preview session changes stay owner-scoped in this room. The control stays visible here so the operator workflow is still clear."
            tone="blocked"
          />
        )}

        <CommandCenterPreviewUtilityButton
          label="Pending tools"
          title="Review / QC / Record"
          body={pendingRuntimeToolsBody}
          tone="muted"
        />
        <CommandCenterBrandControlsTrigger
          workspaceId={workspaceId}
          brandSystem={brandSystem}
          canManage={canManage}
        />
      </div>

      <CommandCenterPopoverBar
        tone="dark"
        className="min-w-[15rem] flex-[0.85_1_16rem]"
        align="right"
        summaryClassName="!min-h-[4.35rem] px-3.5 py-3"
        bubbleClassName="w-[min(26rem,calc(100vw-2.5rem))]"
        summary={
          <CompactStatusSummaryCard label="Current project">
            <p className="text-sm font-semibold leading-5 text-white">{projectTitle}</p>
            <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
              {roadmapLabel}
            </span>
          </CompactStatusSummaryCard>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Current project
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {projectTitle} · {activePhase.label}
            </p>
          </div>
          <CommandCenterSourceBadge source={roomState.source} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
            Roadmap: {roadmapLabel}
          </span>
          <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
            Project picture
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-200">{roomState.body}</p>

        {projectPictureIssues.length > 0 ? (
          <div className="mt-4 rounded-[18px] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Review focus
            </p>
            <div className="mt-3">
              {renderList(
                projectPictureIssues,
                "No extra review issues are standing out right now.",
                "bg-amber-400",
                "text-slate-200",
                "text-slate-400"
              )}
            </div>
          </div>
        ) : null}
      </CommandCenterPopoverBar>
    </div>
  );
}

function CommandCenterDesignPreviewChatControlView({
  workspaceId,
  designLibrary,
  designPreviewArchitecture,
  canManage
}: {
  workspaceId: string;
  designLibrary: CommandCenterDesignLibraryPanel;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  canManage: boolean;
}) {
  const surfaceTargetOptions = listCommandCenterPreviewSurfaceTargets();
  const densityModes = listCommandCenterDensityModes();
  const selectedTargets =
    designLibrary.targetedSurfaceTargets.length > 0
      ? designLibrary.targetedSurfaceTargets
      : ["command_center"];
  const previewMutation =
    designLibrary.previewState === "inactive" ? "start_preview" : "update_preview";
  const returnTo = `/workspace/${workspaceId}/command-center`;
  const runtimeReady = designLibrary.runtimeReady;
  const summaryPrimaryLine = canManage
    ? runtimeReady
      ? "Open preview controls"
      : designLibrary.runtimeState === "awaiting_bind"
        ? "Waiting for browser bind"
        : designLibrary.runtimeState === "reconnect_needed" ||
            designLibrary.runtimeState === "session_stale"
          ? "Reconnect browser first"
          : designLibrary.runtimeState === "error"
            ? "Browser runtime error"
            : "Open Browser first"
    : runtimeReady
      ? "Owner access required"
      : designLibrary.runtimeState === "awaiting_bind"
        ? "Waiting for browser bind"
        : designLibrary.runtimeState === "reconnect_needed" ||
            designLibrary.runtimeState === "session_stale"
          ? "Reconnect browser first"
          : designLibrary.runtimeState === "error"
            ? "Browser runtime error"
            : designLibrary.ctaLabel;
  const summaryDetail =
    !runtimeReady && designLibrary.runtimeState === "awaiting_bind"
      ? `${designLibrary.statusLabel} - Inspect-only until the first real bind lands`
      : !runtimeReady && designLibrary.runtimeState === "reconnect_needed"
        ? `${designLibrary.statusLabel} - Prior session context only`
        : `${designLibrary.statusLabel} - ${designLibrary.runtimeTargetLabel}`;

  return (
    <div id="command-center-design-library">
      <CommandCenterPopoverBar
        tone="dark"
        className="!w-auto"
        align="right"
        summaryClassName="!w-auto rounded-[16px] border-white/18 bg-[#15233a] px-4 py-3 text-left shadow-[0_18px_40px_rgba(2,6,23,0.26)]"
        bubbleClassName="w-[min(40rem,calc(100vw-2.5rem))] max-h-[min(78vh,52rem)] overflow-y-auto"
        summary={
            <div className="min-w-[13.5rem]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Design Library
              </p>
              <span className="rounded-full border border-violet-300/40 bg-violet-400/16 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-100">
                Open
              </span>
              </div>
            <p className="mt-1 text-sm font-semibold text-white">{summaryPrimaryLine}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {summaryDetail}
            </p>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {designLibrary.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{designLibrary.detail}</p>
            </div>
            <CommandCenterSourceBadge source={designLibrary.source} />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[18px] border border-white/14 bg-[#101a2c]/92 px-4 py-4 shadow-[0_18px_36px_rgba(2,6,23,0.2)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Current saved mode
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {designLibrary.currentTruthLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {designLibrary.currentTruthDetail}
              </p>
            </div>

            <div className="rounded-[18px] border border-white/14 bg-[#101a2c]/92 px-4 py-4 shadow-[0_18px_36px_rgba(2,6,23,0.2)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Preview lifecycle
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {designLibrary.previewStateLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Active mode: {designLibrary.activeModeLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Package: {designLibrary.approvedPackageLabel}
              </p>
            </div>

            <div className="rounded-[18px] border border-white/14 bg-[#101a2c]/92 px-4 py-4 shadow-[0_18px_36px_rgba(2,6,23,0.2)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Live session target
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {designLibrary.runtimeTargetLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {designLibrary.runtimeTargetDetail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {designLibrary.controlAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-white/16 bg-[#142136] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-100"
              >
                {area}
              </span>
            ))}
            {designLibrary.targetedSurfaces.map((surface) => (
              <span
                key={surface}
                className="rounded-full border border-violet-300/40 bg-violet-400/16 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-100"
              >
                {surface}
              </span>
            ))}
          </div>

          <div className="rounded-[18px] border border-violet-300/30 bg-violet-400/14 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200">
              Preview package flow
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Preview stays temporary, approval creates a package, and implementation only happens later when source code is updated.
            </p>
          </div>

          {!runtimeReady ? (
            <div className="rounded-[20px] border border-amber-300/30 bg-amber-500/10 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                Live session required
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {designLibrary.runtimeTargetDetail}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use the Browser Runtime control first. Inspect traffic alone does not unlock Design Library preview or package actions until that same live session is truly connected.
              </p>
            </div>
          ) : canManage ? (
            <div className="space-y-3">
              <details className="group rounded-[20px] border border-white/14 bg-[#101a2c]/92 px-4 py-4">
                <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Adjust staged preview
                </summary>

                <form action={updateCommandCenterPreviewState} className="mt-4 space-y-4">
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="mutation" value={previewMutation} />
                <input type="hidden" name="source" value="command_center_chat_preview_control" />

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Design mode
                    </span>
                    <select
                      name="designMode"
                      defaultValue={designLibrary.selectedControls.designMode ?? ""}
                      className="input"
                    >
                      <option value="">Current source styling</option>
                      {designLibrary.highlightedModes.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                          {mode.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Density mode
                    </span>
                    <select
                      name="densityMode"
                      defaultValue={designLibrary.selectedControls.densityMode ?? ""}
                      className="input"
                    >
                      <option value="">Default density</option>
                      {densityModes.map((mode) => (
                        <option key={mode} value={mode}>
                          {formatDensityModeLabel(mode)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Colorway
                    </span>
                    <input
                      type="text"
                      name="colorway"
                      defaultValue={designLibrary.selectedControls.colorway ?? ""}
                      className="input"
                      placeholder="Executive slate, obsidian glow..."
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Button style
                    </span>
                    <input
                      type="text"
                      name="buttonStyle"
                      defaultValue={designLibrary.selectedControls.buttonStyle ?? ""}
                      className="input"
                      placeholder="Pill, raised, minimal..."
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Typography style
                    </span>
                    <input
                      type="text"
                      name="typographyStyle"
                      defaultValue={designLibrary.selectedControls.typographyStyle ?? ""}
                      className="input"
                      placeholder="Luxury serif, operator sans..."
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Layout preset
                    </span>
                    <input
                      type="text"
                      name="layoutPreset"
                      defaultValue={designLibrary.selectedControls.layoutPreset ?? ""}
                      className="input"
                      placeholder="Wide command grid, editorial..."
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Room preset
                    </span>
                    <input
                      type="text"
                      name="roomPreset"
                      defaultValue={designLibrary.selectedControls.roomPreset ?? ""}
                      className="input"
                      placeholder="Royal Command, Terra Signal..."
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Preview notes
                    </span>
                    <textarea
                      name="notes"
                      defaultValue={designLibrary.previewNotes ?? ""}
                      rows={3}
                      className="input min-h-[96px] resize-y"
                      placeholder="Add preview intent or rationale..."
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Target surfaces
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {surfaceTargetOptions.map((target) => (
                      <label
                        key={target}
                        className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-200"
                      >
                        <input
                          type="checkbox"
                          name="surfaceTargets"
                          value={target}
                          defaultChecked={selectedTargets.includes(target)}
                          className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
                        />
                        <span>{formatCommandCenterPreviewSurfaceTarget(target)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-300/18"
                >
                  {designLibrary.previewState === "inactive"
                    ? "Start preview session"
                    : "Update staged preview"}
                </button>
                </form>
              </details>

              <details className="group rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
                <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Package lifecycle controls
                </summary>
                <div className="mt-4">
                  <PackageLifecycleActions
                    workspaceId={workspaceId}
                    architecture={designPreviewArchitecture}
                    canManage={canManage}
                  />
                </div>
              </details>
            </div>
          ) : (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm leading-6 text-slate-300">
                Project owners can open preview controls and approve packages from this same Design Library entry once the live browser session is connected.
              </p>
            </div>
          )}
        </div>
      </CommandCenterPopoverBar>
    </div>
  );
}

function PreviewStateActionBar({
  workspaceId,
  architecture,
  canManage
}: {
  workspaceId: string;
  architecture: CommandCenterDesignPreviewArchitecture;
  canManage: boolean;
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;
  const previewState = architecture.previewState;

  if (!canManage) {
    return (
      <p className="mt-5 text-sm leading-7 text-slate-500">
        Project owners can stage, stale, and reset preview sessions from this room.
      </p>
    );
  }

  const startOrUpdateMutation =
    previewState.state === "inactive" ? "start_preview" : "update_preview";
  const startOrUpdateLabel =
    previewState.state === "inactive" ? "Start preview session" : "Refresh staged preview";

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <form action={updateCommandCenterPreviewState}>
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="mutation" value={startOrUpdateMutation} />
        {renderHiddenPreviewControlFields(architecture, "browser_preview_panel")}
        <button
          type="submit"
          className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 transition hover:bg-cyan-300/18"
        >
          {startOrUpdateLabel}
        </button>
      </form>

      {previewState.state !== "inactive" ? (
        <>
          {previewState.state !== "stale_after_code_change" ? (
            <form action={updateCommandCenterPreviewState}>
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="mutation" value="mark_preview_stale" />
              <button
                type="submit"
                className="rounded-full border border-amber-300/35 bg-amber-50/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 transition hover:bg-amber-100"
              >
                Mark stale preview
              </button>
            </form>
          ) : null}

          <form action={updateCommandCenterPreviewState}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="mutation" value="reset_preview" />
            <button
              type="submit"
              className="rounded-full border border-slate-200 bg-white/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
            >
              Reset preview
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}

function PackageLifecycleActions({
  workspaceId,
  architecture,
  canManage
}: {
  workspaceId: string;
  architecture: CommandCenterDesignPreviewArchitecture;
  canManage: boolean;
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;
  const previewState = architecture.previewState;
  const approvedPackage = architecture.approvedPackage;
  const hasPackage = approvedPackage.status !== "none";

  if (!canManage) {
    return (
      <p className="mt-5 text-sm leading-7 text-slate-500">
        Project owners can approve preview packages, update lifecycle state, and clear stale
        package state from this room.
      </p>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      <form action={updateCommandCenterApprovedDesignPackage} className="space-y-4">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <input type="hidden" name="returnTo" value={returnTo} />

        <label className="block space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Implementation intent
          </span>
          <textarea
            name="implementationIntent"
            defaultValue={
              architecture.approvedPackage.implementationIntent ??
              "Implement the approved preview state in source code without treating browser preview as the styling truth."
            }
            rows={3}
            className="input min-h-[96px] resize-y"
            placeholder="Describe what Codex should implement later..."
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Caution notes
            </span>
            <textarea
              name="cautionNotes"
              defaultValue={architecture.approvedPackage.cautionNotes.join("\n")}
              rows={4}
              className="input min-h-[112px] resize-y"
              placeholder="One caution note per line..."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Affected zones
            </span>
            <textarea
              name="affectedZones"
              defaultValue={architecture.approvedPackage.affectedZones.join("\n")}
              rows={4}
              className="input min-h-[112px] resize-y"
              placeholder="One UI zone per line..."
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="mutation"
            value={hasPackage ? "update_package" : "create_from_preview"}
            className="rounded-full border border-violet-300/35 bg-violet-100/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 transition hover:bg-violet-100"
          >
            {hasPackage ? "Update package notes" : "Approve preview package"}
          </button>

          {!hasPackage && previewState.state !== "inactive" ? (
            <span className="self-center text-xs leading-6 text-slate-500">
              Approval creates a structured package; it does not implement source code.
            </span>
          ) : null}
        </div>
      </form>

      {hasPackage ? (
        <div className="flex flex-wrap gap-2">
          {approvedPackage.status === "failed" ? (
            <form action={updateCommandCenterApprovedDesignPackage}>
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="mutation" value="mark_approved_for_implementation" />
              <button
                type="submit"
                className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 transition hover:bg-cyan-300/18"
              >
                Mark ready again
              </button>
            </form>
          ) : null}

          {approvedPackage.status === "approved_for_implementation" ? (
            <form action={updateCommandCenterApprovedDesignPackage}>
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="mutation" value="mark_sent_to_codex" />
              <button
                type="submit"
                className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 transition hover:bg-cyan-300/18"
              >
                Mark sent to Codex
              </button>
            </form>
          ) : null}

          {approvedPackage.status === "sent_to_codex" ? (
            <>
              <form action={updateCommandCenterApprovedDesignPackage}>
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="mutation" value="mark_implemented" />
                <button
                  type="submit"
                  className="rounded-full border border-emerald-300/35 bg-emerald-50/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 transition hover:bg-emerald-100"
                >
                  Mark implemented
                </button>
              </form>
              <form action={updateCommandCenterApprovedDesignPackage}>
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="mutation" value="mark_failed" />
                <button
                  type="submit"
                  className="rounded-full border border-rose-300/35 bg-rose-50/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700 transition hover:bg-rose-100"
                >
                  Mark failed
                </button>
              </form>
            </>
          ) : null}

          {approvedPackage.status !== "superseded" ? (
            <form action={updateCommandCenterApprovedDesignPackage}>
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="mutation" value="mark_superseded" />
              <button
                type="submit"
                className="rounded-full border border-amber-300/35 bg-amber-50/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 transition hover:bg-amber-100"
              >
                Supersede package
              </button>
            </form>
          ) : null}

          <form action={updateCommandCenterApprovedDesignPackage}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="mutation" value="clear_package" />
            <button
              type="submit"
              className="rounded-full border border-slate-200 bg-white/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
            >
              Clear package state
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function CommandCenterAnalyzerPanelView({
  workspaceId,
  projectId,
  analyzer,
  changeImpactReview,
  roomState,
  executionReadiness,
  blockers,
  decisionInbox,
  taskQueue,
  browserStatus,
  designPreviewArchitecture,
  designLibrary,
  brandSystem,
  projectTitle,
  initialLiveViewSession,
  activePhase,
  canManage
}: {
  workspaceId: string;
  projectId: string;
  analyzer: CommandCenterAnalyzerPanel;
  changeImpactReview: CommandCenterChangeImpactReview;
  roomState: CommandCenterRoomState;
  executionReadiness: CommandCenterStateBand;
  blockers: CommandCenterListPanel;
  decisionInbox: CommandCenterDecisionInbox;
  taskQueue: CommandCenterTaskQueuePanel;
  browserStatus: CommandCenterBrowserPanel;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  designLibrary: CommandCenterDesignLibraryPanel;
  brandSystem: CommandCenterBrandSystemPanel;
  projectTitle: string;
  initialLiveViewSession: LiveViewSession | null;
  activePhase: CommandCenterStateBand;
  canManage: boolean;
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;
  const openDecisionItems = decisionInbox.items.filter(
    (item) => item.status !== "resolved" && item.status !== "deferred"
  );
  const activeReviewItems = changeImpactReview.items.filter(
    (item) => item.reviewStatus !== "no_longer_relevant"
  );
  const visibleDecisionItems = openDecisionItems.slice(0, 3);
  const visibleReviewItems = activeReviewItems.slice(0, 3);
  const highestImpactLabel =
    changeImpactReview.highestImpactLevel === "significant"
      ? "Significant"
      : changeImpactReview.highestImpactLevel === "moderate"
        ? "Moderate"
        : changeImpactReview.highestImpactLevel === "light"
          ? "Light"
          : "No active review";
  const decisionModeContent =
    visibleDecisionItems.length > 0 ? (
      <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-1">
        {visibleDecisionItems.map((item) => (
          <DecisionItemCard
            key={item.id}
            workspaceId={workspaceId}
            item={item}
            canManage={canManage}
          />
        ))}
      </div>
    ) : (
      <div className="rounded-[18px] border border-white/12 bg-white/4 px-4 py-4">
        <p className="text-sm leading-6 text-slate-300">
          No unresolved decisions need attention right now.
        </p>
      </div>
    );
  const reviewModeContent =
    visibleReviewItems.length > 0 ? (
      <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-1">
        {visibleReviewItems.map((item) => (
          <ChangeImpactItemCard
            key={item.id}
            workspaceId={workspaceId}
            item={item}
            canManage={canManage}
          />
        ))}
      </div>
    ) : (
      <div className="rounded-[18px] border border-white/12 bg-white/4 px-4 py-4">
        <p className="text-sm leading-6 text-slate-300">
          No active review items need operator follow-up right now.
        </p>
      </div>
    );

  return (
    <CommandCenterPanel dataState={analyzer.dataState}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {analyzer.title}
        </p>
        <CommandCenterSourceBadge source={analyzer.source} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${truthToneClasses(analyzer.source)}`}>
          {analyzer.statusLabel}
        </span>
        <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Request intake
        </span>
        <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {analyzer.flowSummary}
        </span>
      </div>

      <div className="mt-4 rounded-[28px] border border-slate-950 bg-slate-950 px-5 py-5 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {analyzer.intakeTitle}
            </p>
            <p className="mt-2 text-[1.08rem] font-semibold leading-8 text-white">
              {analyzer.currentAnalysis}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              {analyzer.intakeDescription}
            </p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
            Customer request bridge
          </span>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.42fr_0.58fr]">
          <div className="space-y-3">
            <CommandCenterSmartOperatorTopStripView
              workspaceId={workspaceId}
              projectId={projectId}
              browserStatus={browserStatus}
              designPreviewArchitecture={designPreviewArchitecture}
              brandSystem={brandSystem}
              roomState={roomState}
              projectTitle={projectTitle}
              initialLiveViewSession={initialLiveViewSession}
              roadmapLabel={taskQueue.currentRoadmapArea ?? activePhase.label}
              activePhase={activePhase}
              canManage={canManage}
            />

            <CommandCenterSmartOperatorSurface
              workspaceId={workspaceId}
              returnTo={returnTo}
              canManage={canManage}
              availableRoadmapAreas={taskQueue.availableRoadmapAreas}
              createTaskAction={updateCommandCenterTask}
              decisionCount={decisionInbox.openCount}
              reviewCount={changeImpactReview.activeCount}
              decisionContent={decisionModeContent}
              reviewContent={reviewModeContent}
              utilityTray={
                <CommandCenterDesignPreviewChatControlView
                  workspaceId={workspaceId}
                  designLibrary={designLibrary}
                  designPreviewArchitecture={designPreviewArchitecture}
                  canManage={canManage}
                />
              }
            />
          </div>

          <div className="space-y-2.5">
            <CommandCenterPopoverBar
              align="right"
              summaryClassName="min-h-[4rem] px-3.5 py-3"
              bubbleClassName="max-h-[24rem] overflow-y-auto"
              summary={
                <CompactStatusSummaryCard label="Active review">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactControlChipClasses(
                      "neutral"
                    )}`}
                  >
                    Active review items: {changeImpactReview.activeCount}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactControlChipClasses(
                      changeImpactReview.highestImpactLevel === "significant"
                        ? "critical"
                        : changeImpactReview.highestImpactLevel === "moderate"
                          ? "warning"
                          : "neutral"
                    )}`}
                  >
                    Highest impact: {highestImpactLabel}
                  </span>
                </CompactStatusSummaryCard>
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Active review
                </p>
                <CommandCenterSourceBadge source={changeImpactReview.source} />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">
                {activeReviewItems.length > 0
                  ? activeReviewItems
                      .slice(0, 2)
                      .map((item) => item.title)
                      .join(" • ")
                  : changeImpactReview.description}
              </p>

              <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Why the impact is {highestImpactLabel.toLowerCase()}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {activeReviewItems[0]?.summary ?? changeImpactReview.description}
                </p>
              </div>

              <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Active review items
                </p>
                <div className="mt-3">
                  {renderList(
                    activeReviewItems.map((item) => item.title).slice(0, 4),
                    changeImpactReview.emptyState,
                    "bg-rose-500",
                    "text-slate-700",
                    "text-slate-500"
                  )}
                </div>
              </div>
            </CommandCenterPopoverBar>

            <CommandCenterPopoverBar
              align="right"
              summaryClassName="min-h-[4rem] px-3.5 py-3"
              bubbleClassName="max-h-[24rem] overflow-y-auto"
              summary={
                <CompactStatusSummaryCard label="Decision inbox">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactControlChipClasses(
                      "neutral"
                    )}`}
                  >
                    Open decisions: {decisionInbox.openCount}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactControlChipClasses(
                      decisionInbox.blockingOpenCount > 0 ? "critical" : "neutral"
                    )}`}
                  >
                    Blocking decisions: {decisionInbox.blockingOpenCount}
                  </span>
                </CompactStatusSummaryCard>
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Decision review
                </p>
                <CommandCenterSourceBadge source={decisionInbox.source} />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">{executionReadiness.detail}</p>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Open decisions
                  </p>
                  <div className="mt-3">
                    {renderList(
                      openDecisionItems.map((item) => item.title).slice(0, 4),
                      decisionInbox.emptyState,
                      "bg-cyan-500",
                      "text-slate-700",
                      "text-slate-500"
                    )}
                  </div>
                </div>

                <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Blocking decisions
                  </p>
                  <div className="mt-3">
                    {renderList(
                      blockers.items,
                      blockers.emptyState,
                      "bg-rose-500",
                      "text-slate-700",
                      "text-slate-500"
                    )}
                  </div>
                </div>
              </div>
            </CommandCenterPopoverBar>

            <div className="rounded-[18px] border border-cyan-300/20 bg-cyan-300/8 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                Next operator move
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{analyzer.recommendation}</p>
            </div>

            <div className="rounded-[18px] border border-white/12 bg-white/6 px-4 py-3 shadow-[0_16px_36px_rgba(2,6,23,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Execution Usage
                </p>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                  Operator flow
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {EXECUTION_USAGE_SUMMARY_FIELDS.map((item) => {
                  const toneClasses = executionUsageMetricClasses(item.tone);

                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between gap-4 rounded-[14px] border px-3 py-2 ${toneClasses.row}`}
                    >
                      <span className={`text-[11px] leading-5 ${toneClasses.label}`}>
                        {item.label}
                      </span>
                      <span className={`text-sm font-semibold ${toneClasses.value}`}>
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommandCenterPanel>
  );
}

export function CommandCenterPromptRunnerPanelView({
  promptRunner
}: {
  promptRunner: CommandCenterPromptRunnerPanel;
}) {
  return (
    <CommandCenterPanel
      dataState={promptRunner.dataState}
      className="h-full w-full max-w-none rounded-[24px] p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {promptRunner.title}
        </p>
        <div className="flex items-center gap-2">
          <CommandCenterPopoverBar
            className="!w-auto"
            align="right"
            summaryClassName="!flex !h-9 !w-9 !min-h-0 !items-center !justify-center rounded-[14px] border-slate-200/80 bg-white text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            bubbleClassName="w-[min(24rem,calc(100vw-2.5rem))]"
            summary={<span>NC?</span>}
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Prompt meaning
                </p>
                <CommandCenterSourceBadge source={promptRunner.source} />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">{promptRunner.scopeLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{promptRunner.detail}</p>

              <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {promptRunner.namingGuide.prefixLabel}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-700">
                  {promptRunner.namingGuide.trackLabels.map((item) => (
                    <li key={item.code}>
                      <span className="font-semibold text-slate-950">{item.code}</span> ={" "}
                      {item.meaning}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {promptRunner.namingGuide.sequenceHint}
                </p>
              </div>
            </div>
          </CommandCenterPopoverBar>
          <CommandCenterSourceBadge source={promptRunner.source} />
        </div>
      </div>

      <div className="mt-2 max-h-[21rem] space-y-2 overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-1.5">
          {promptRunner.statusPills.map((pill) => (
            <span
              key={pill}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                pill === "Ready next" || pill === "Queued"
                  ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-700"
                  : pill === "Signal first"
                  ? "border-amber-300/35 bg-amber-50/80 text-amber-700"
                  : "border-slate-200 bg-white/82 text-slate-500"
              }`}
            >
              {pill}
            </span>
          ))}
          <span className="rounded-full border border-slate-200 bg-white/82 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Internal execution path
          </span>
        </div>

        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
          {promptRunner.bridgeLabel}
        </p>

        <CommandCenterPopoverBar
          summaryClassName="!rounded-[16px] !border-slate-200/70 !bg-white/76 !px-2.5 !py-2"
          bubbleClassName="w-[min(25rem,calc(100vw-2.5rem))]"
          summary={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Current prompt
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {promptRunner.runId ?? promptRunner.statusLabel}
                </p>
              </div>
              {promptRunner.upcomingRunId ? (
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Next
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-950">
                    {promptRunner.upcomingRunId}
                  </p>
                </div>
              ) : null}
            </div>
          }
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Prompt detail
              </p>
              <CommandCenterSourceBadge source={promptRunner.source} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Prompt ID
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {promptRunner.runId ?? "Not staged yet"}
                </p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Execution Level
                </p>
                <div className="mt-2">
                  {promptRunner.currentExecutionLevel ? (
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${promptExecutionLevelClasses(
                        promptRunner.currentExecutionLevel
                      )}`}
                    >
                      {promptRunner.currentExecutionLevel}
                    </span>
                  ) : (
                    <span className="text-sm leading-6 text-slate-600">
                      A level appears once a prompt is staged.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Prompt scope
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{promptRunner.scopeLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{promptRunner.detail}</p>
            </div>

            <PromptExecutionLevelGuide />
          </div>
        </CommandCenterPopoverBar>

        <div className="rounded-[16px] border border-slate-200/70 bg-white/76 px-2.5 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Next 5 prompts
          </p>

          {promptRunner.queue.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {promptRunner.queue.map((item) => (
                <CommandCenterPopoverBar
                  key={item.runId}
                  summaryClassName="!rounded-[12px] !border-slate-200/70 !bg-slate-50/80 !px-2 !py-1.5"
                  bubbleClassName="w-[min(25rem,calc(100vw-2.5rem))]"
                  summary={
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-slate-950">{item.runId}</p>
                          <span className="rounded-full border border-slate-200 bg-white/82 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {item.roadmapArea}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${queueStateClasses(
                          item.queueState
                        )}`}
                      >
                        {queueStateLabel(item.queueState)}
                      </span>
                    </div>
                  }
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Prompt detail
                      </p>
                      <CommandCenterSourceBadge source={promptRunner.source} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Prompt ID
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{item.runId}</p>
                      </div>
                      <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Execution Level
                        </p>
                        <div className="mt-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${promptExecutionLevelClasses(
                              item.executionLevel
                            )}`}
                          >
                            {item.executionLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Supports task
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.taskTitle}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                        Supports {item.roadmapArea}
                      </p>
                    </div>

                    <PromptExecutionLevelGuide />
                  </div>
                </CommandCenterPopoverBar>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No follow-up prompts are staged beyond the current operator run yet.
            </p>
          )}
        </div>
      </div>
    </CommandCenterPanel>
  );
}

export function CommandCenterTaskQueuePanelView({
  workspaceId,
  taskQueue,
  canManage
}: {
  workspaceId: string;
  taskQueue: CommandCenterTaskQueuePanel;
  canManage: boolean;
}) {
  return (
    <CommandCenterPanel
      dataState={taskQueue.dataState}
      className="h-full w-full max-w-none rounded-[24px] p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {taskQueue.title}
        </p>
        <CommandCenterSourceBadge source={taskQueue.source} />
      </div>

      <div className="mt-2 max-h-[21rem] space-y-2 overflow-y-auto pr-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Leading task
          </p>
          {taskQueue.currentTask ? (
            <div className="mt-2">
              <TaskRow
                task={taskQueue.currentTask}
                compact
                actionContent={
                  canManage ? (
                    <TaskStatusActions workspaceId={workspaceId} task={taskQueue.currentTask} />
                  ) : null
                }
              />
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              No task is leading the room yet.
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Next 5 tasks
          </p>
          {taskQueue.nextTasks.length > 0 ? (
            <div className="mt-2 space-y-2">
              {taskQueue.nextTasks.map((task) => (
                <TaskRow key={task.id} task={task} compact />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              No follow-up tasks are queued yet.
            </p>
          )}
        </div>

        <details className="rounded-[18px] border border-slate-200/70 bg-white/72 px-3 py-3">
          <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            More task states
          </summary>
          <div className="mt-3 space-y-3">
            <div className="rounded-[16px] border border-rose-200/70 bg-rose-50/70 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                Waiting on answers
              </p>
              {taskQueue.waitingOnDecision.length > 0 ? (
                <div className="mt-2.5 space-y-2">
                  {taskQueue.waitingOnDecision.map((task) => (
                    <TaskRow key={task.id} task={task} compact />
                  ))}
                </div>
              ) : (
                <p className="mt-2.5 text-sm leading-6 text-slate-500">
                  No current tasks are waiting on unanswered decisions.
                </p>
              )}
            </div>

            <div className="rounded-[16px] border border-emerald-200/70 bg-emerald-50/70 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Cleared recently
              </p>
              {taskQueue.recentlyCleared.length > 0 ? (
                <div className="mt-2.5 space-y-2">
                  {taskQueue.recentlyCleared.map((task) => (
                    <TaskRow key={task.id} task={task} compact />
                  ))}
                </div>
              ) : (
                <p className="mt-2.5 text-sm leading-6 text-slate-500">
                  Nothing has been cleared recently enough to show here yet.
                </p>
              )}
            </div>
          </div>
        </details>
      </div>
    </CommandCenterPanel>
  );
}

export function CommandCenterProductionStatusPanelView({
  productionStatus
}: {
  productionStatus: CommandCenterProductionStatusPanel;
}) {
  return (
    <CommandCenterPanel dataState={productionStatus.dataState}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {productionStatus.title}
        </p>
        <CommandCenterSourceBadge source={productionStatus.source} />
      </div>

      <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Current production posture
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {productionStatus.label}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{productionStatus.detail}</p>
      </div>
    </CommandCenterPanel>
  );
}

export function CommandCenterBrowserBrandTopStripView({
  workspaceId,
  browserStatus,
  designPreviewArchitecture,
  brandSystem,
  canManage
}: {
  workspaceId: string;
  browserStatus: CommandCenterBrowserPanel;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  brandSystem: CommandCenterBrandSystemPanel;
  canManage: boolean;
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;
  const previewState = designPreviewArchitecture.previewState;
  const startOrUpdateMutation =
    previewState.state === "inactive" ? "start_preview" : "update_preview";
  const startOrUpdateLabel =
    previewState.state === "inactive" ? "Stage preview" : "Refresh preview";

  return (
    <CommandCenterPanel dataState={browserStatus.dataState} className="rounded-[28px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:border-r xl:border-slate-200/70 xl:pr-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Browser preview
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {browserStatus.statusLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{browserStatus.detail}</p>
            </div>
            <CommandCenterSourceBadge source={browserStatus.source} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {canManage ? (
              <form action={updateCommandCenterPreviewState}>
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="mutation" value={startOrUpdateMutation} />
                {renderHiddenPreviewControlFields(
                  designPreviewArchitecture,
                  "command_center_browser_strip"
                )}
                <button type="submit" className="button-secondary text-sm">
                  {startOrUpdateLabel}
                </button>
              </form>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-full border border-slate-200 bg-white/82 px-4 py-3 text-sm font-medium text-slate-400"
              >
                Preview controls need owner access
              </button>
            )}

            {["Review", "Record", "QC"].map((action) => (
              <button
                key={action}
                type="button"
                disabled
                className="rounded-full border border-slate-200 bg-white/82 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="xl:min-w-[24rem] xl:max-w-[30rem]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Brand controls
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {brandSystem.statusLabel}
              </p>
            </div>
            <CommandCenterBrandControlsTrigger
              workspaceId={workspaceId}
              brandSystem={brandSystem}
              canManage={canManage}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
              Identity Mode: {brandSystem.currentIdentity}
            </span>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
              Colorway: {brandSystem.currentColorway}
            </span>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
              Brand Assets: {brandSystem.assetState}
            </span>
          </div>
        </div>
      </div>
    </CommandCenterPanel>
  );
}

export function CommandCenterBrowserPanelView({
  workspaceId,
  projectId,
  projectTitle,
  browserStatus,
  initialLiveViewSession
}: {
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  browserStatus: CommandCenterBrowserPanel;
  initialLiveViewSession: LiveViewSession | null;
}) {
  return (
    <CommandCenterBrowserRuntimePanel
      workspaceId={workspaceId}
      projectId={projectId}
      projectTitle={projectTitle}
      initialBrowserStatus={browserStatus}
      initialLiveViewSession={initialLiveViewSession}
      presentation="chat"
    />
  );
}

export function CommandCenterDesignLibraryPanelView({
  workspaceId,
  designLibrary,
  designPreviewArchitecture,
  canManage
}: {
  workspaceId: string;
  designLibrary: CommandCenterDesignLibraryPanel;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  canManage: boolean;
}) {
  const surfaceTargetOptions = listCommandCenterPreviewSurfaceTargets();
  const densityModes = listCommandCenterDensityModes();
  const selectedTargets =
    designLibrary.targetedSurfaceTargets.length > 0
      ? designLibrary.targetedSurfaceTargets
      : ["command_center"];
  const previewMutation =
    designLibrary.previewState === "inactive" ? "start_preview" : "update_preview";
  const returnTo = `/workspace/${workspaceId}/command-center`;

  return (
    <div id="command-center-design-library">
      <CommandCenterPanel dataState={designLibrary.dataState}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {designLibrary.title}
        </p>
        <CommandCenterSourceBadge source={designLibrary.source} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-950">{designLibrary.statusLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{designLibrary.detail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {designLibrary.ctaLabel}
          </span>
          <span className="rounded-full border border-violet-200/70 bg-violet-100/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">
            {designLibrary.approvalCtaLabel}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Current saved mode
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
            {designLibrary.currentTruthLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {designLibrary.currentTruthDetail}
          </p>
        </div>
        <div className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Preview lifecycle
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
            {designLibrary.previewStateLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Active mode: {designLibrary.activeModeLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Targeting: {designLibrary.targetedSurfaces.join(", ")}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Package: {designLibrary.approvedPackageLabel}
          </p>
        </div>
        <div className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Live session target
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
            {designLibrary.runtimeTargetLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {designLibrary.runtimeTargetDetail}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {designLibrary.controlAreas.map((area) => (
          <span
            key={area}
            className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"
          >
            {area}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-[20px] border border-violet-200/60 bg-violet-100/45 px-4 py-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700">
          Preview package flow
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Preview stays temporary, approval creates a package, and implementation only happens later when source code is updated.
        </p>
      </div>

      {canManage ? (
        <div className="mt-5 space-y-3">
          <details className="group rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
            <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Adjust staged preview
            </summary>

            <form action={updateCommandCenterPreviewState} className="mt-4 space-y-4">
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="mutation" value={previewMutation} />
              <input type="hidden" name="source" value="command_center_design_library" />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Design mode
                  </span>
                  <select
                    name="designMode"
                    defaultValue={designLibrary.selectedControls.designMode ?? ""}
                    className="input"
                  >
                    <option value="">Current source styling</option>
                    {designLibrary.highlightedModes.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Density mode
                  </span>
                  <select
                    name="densityMode"
                    defaultValue={designLibrary.selectedControls.densityMode ?? ""}
                    className="input"
                  >
                    <option value="">Default density</option>
                    {densityModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {formatDensityModeLabel(mode)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Colorway
                  </span>
                  <input
                    type="text"
                    name="colorway"
                    defaultValue={designLibrary.selectedControls.colorway ?? ""}
                    className="input"
                    placeholder="Executive slate, obsidian glow..."
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Button style
                  </span>
                  <input
                    type="text"
                    name="buttonStyle"
                    defaultValue={designLibrary.selectedControls.buttonStyle ?? ""}
                    className="input"
                    placeholder="Pill, raised, minimal..."
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Typography style
                  </span>
                  <input
                    type="text"
                    name="typographyStyle"
                    defaultValue={designLibrary.selectedControls.typographyStyle ?? ""}
                    className="input"
                    placeholder="Luxury serif, operator sans..."
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Layout preset
                  </span>
                  <input
                    type="text"
                    name="layoutPreset"
                    defaultValue={designLibrary.selectedControls.layoutPreset ?? ""}
                    className="input"
                    placeholder="Wide command grid, editorial..."
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Room preset
                  </span>
                  <input
                    type="text"
                    name="roomPreset"
                    defaultValue={designLibrary.selectedControls.roomPreset ?? ""}
                    className="input"
                    placeholder="Royal Command, Terra Signal..."
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Preview notes
                  </span>
                  <textarea
                    name="notes"
                    defaultValue={designLibrary.previewNotes ?? ""}
                    rows={3}
                    className="input min-h-[96px] resize-y"
                    placeholder="Add preview intent or rationale..."
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Target surfaces
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {surfaceTargetOptions.map((target) => (
                    <label
                      key={target}
                      className="flex items-center gap-3 rounded-[18px] border border-slate-200/70 bg-white/72 px-4 py-3 text-sm leading-6 text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="surfaceTargets"
                        value={target}
                        defaultChecked={selectedTargets.includes(target)}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
                      />
                      <span>{formatCommandCenterPreviewSurfaceTarget(target)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 transition hover:bg-cyan-300/18"
              >
                {designLibrary.previewState === "inactive"
                  ? "Start preview session"
                  : "Update staged preview"}
              </button>
            </form>
          </details>

          <details className="group rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
            <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Package lifecycle controls
            </summary>
            <div className="mt-4">
              <PackageLifecycleActions
                workspaceId={workspaceId}
                architecture={designPreviewArchitecture}
                canManage={canManage}
              />
            </div>
          </details>
        </div>
      ) : (
        <PackageLifecycleActions
          workspaceId={workspaceId}
          architecture={designPreviewArchitecture}
          canManage={canManage}
        />
      )}
      </CommandCenterPanel>
    </div>
  );
}

export function CommandCenterBrandSystemPanelView({
  brandSystem
}: {
  brandSystem: CommandCenterBrandSystemPanel;
}) {
  return (
    <CommandCenterPanel dataState={brandSystem.dataState}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {brandSystem.title}
        </p>
        <CommandCenterSourceBadge source={brandSystem.source} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-950">{brandSystem.statusLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{brandSystem.detail}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {brandSystem.ctaLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Identity mode
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{brandSystem.currentIdentity}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Colorway
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{brandSystem.currentColorway}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Brand assets
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{brandSystem.assetState}</p>
        </div>
      </div>
    </CommandCenterPanel>
  );
}
