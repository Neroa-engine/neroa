import { updateCommandCenterChangeReview } from "@/app/workspace/[workspaceId]/command-center/actions";
import type {
  CommandCenterChangeImpactItem,
  CommandCenterChangeImpactReview
} from "@/lib/workspace/command-center-summary";
import { CommandCenterPanel, CommandCenterSourceBadge } from "@/components/workspace/command-center-ui";
import { CommandCenterPopoverBar } from "@/components/workspace/command-center-popover-bar";

function reviewStatusClasses(status: CommandCenterChangeImpactItem["reviewStatus"]) {
  if (status === "follow_up_needed") {
    return "border-rose-200 bg-rose-100 text-rose-800";
  }

  if (status === "acknowledged") {
    return "border-cyan-200 bg-cyan-100 text-cyan-800";
  }

  if (status === "no_longer_relevant") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  return "border-amber-200 bg-amber-100 text-amber-800";
}

function impactClasses(level: CommandCenterChangeImpactItem["impactLevel"]) {
  if (level === "significant") {
    return "border-rose-200 bg-rose-100 text-rose-800";
  }

  if (level === "moderate") {
    return "border-amber-200 bg-amber-100 text-amber-800";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function confidenceLabel(confidence: CommandCenterChangeImpactItem["confidence"]) {
  if (confidence === "high") return "High confidence";
  if (confidence === "medium") return "Medium confidence";
  return "Low confidence";
}

function readinessEffectLabel(effect: CommandCenterChangeImpactItem["readinessEffect"]) {
  if (effect === "more_blocked") return "More blocked";
  if (effect === "review_needed") return "Review needed";
  if (effect === "less_blocked") return "Less blocked";
  return "No change";
}

function decisionEffectLabel(effect: CommandCenterChangeImpactItem["decisionEffect"]) {
  if (effect === "reopen_existing") return "Reopen decision";
  if (effect === "create_new") return "Create decision";
  if (effect === "review_existing") return "Review decision";
  return "No decision change";
}

function changeReviewStatusLabel(status: CommandCenterChangeImpactItem["reviewStatus"]) {
  if (status === "acknowledged") return "Acknowledged";
  if (status === "follow_up_needed") return "Follow-up needed";
  if (status === "no_longer_relevant") return "No longer relevant";
  return "Active review";
}

function highestImpactLabel(level: CommandCenterChangeImpactReview["highestImpactLevel"]) {
  if (!level) {
    return "No active review";
  }

  if (level === "significant") return "Significant";
  if (level === "moderate") return "Moderate";
  return "Light";
}

function compactSummaryChipClasses(tone: "neutral" | "warning" | "critical") {
  if (tone === "critical") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function ReviewActionButtons({ item }: { item: CommandCenterChangeImpactItem }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        name="nextStatus"
        value="acknowledged"
        className="rounded-full border border-cyan-600 bg-cyan-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-cyan-500"
      >
        Acknowledge
      </button>
      <button
        type="submit"
        name="nextStatus"
        value="follow_up_needed"
        className="rounded-full border border-rose-600 bg-rose-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-rose-500"
      >
        Follow-up needed
      </button>
      <button
        type="submit"
        name="nextStatus"
        value="no_longer_relevant"
        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
      >
        No longer relevant
      </button>
    </div>
  );
}

export function ChangeImpactItemCard({
  workspaceId,
  item,
  canManage
}: {
  workspaceId: string;
  item: CommandCenterChangeImpactItem;
  canManage: boolean;
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;
  const canReopenDecision =
    item.relatedDecisionIds.length > 0 &&
    (item.decisionEffect === "reopen_existing" || item.decisionEffect === "review_existing");

  return (
    <CommandCenterPanel dataState={item.dataState} className="rounded-[30px] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${reviewStatusClasses(
                item.reviewStatus
              )}`}
            >
              {changeReviewStatusLabel(item.reviewStatus)}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${impactClasses(
                item.impactLevel
              )}`}
            >
              {item.impactLevel}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
              {confidenceLabel(item.confidence)}
            </span>
            {item.followUpRequired ? (
              <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">
                Follow-up required
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-950">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Readiness effect
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {readinessEffectLabel(item.readinessEffect)}
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Decision relationship
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {decisionEffectLabel(item.decisionEffect)}
          </p>
        </div>
      </div>

      {item.affectedAreas.length > 0 ? (
        <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Affected areas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.affectedAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {item.relatedDecisionTitles.length > 0 ? (
        <div className="mt-4 rounded-[22px] border border-cyan-200 bg-cyan-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Related decisions
          </p>
          <ul className="mt-3 space-y-2">
            {item.relatedDecisionTitles.map((title) => (
              <li key={title} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {item.reviewNote ? (
        <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Review note
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{item.reviewNote}</p>
        </div>
      ) : null}

      {canManage ? (
        <details className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
          <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Update review
          </summary>
          <div className="mt-4 space-y-3">
            <form action={updateCommandCenterChangeReview} className="space-y-4">
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="reviewId" value={item.id} />
              <input type="hidden" name="title" value={item.title} />
              <input type="hidden" name="summary" value={item.summary} />
              <input type="hidden" name="changeType" value={item.changeType} />
              <input type="hidden" name="impactLevel" value={item.impactLevel} />
              <input type="hidden" name="confidence" value={item.confidence} />
              <input type="hidden" name="readinessEffect" value={item.readinessEffect} />
              <input type="hidden" name="decisionEffect" value={item.decisionEffect} />
              <input type="hidden" name="sourceType" value={item.sourceType} />
              <input
                type="hidden"
                name="followUpRequired"
                value={item.followUpRequired ? "true" : "false"}
              />
              <input
                type="hidden"
                name="affectedAreas"
                value={JSON.stringify(item.affectedAreas)}
              />
              <input
                type="hidden"
                name="relatedDecisionIds"
                value={JSON.stringify(item.relatedDecisionIds)}
              />

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Review note
                </span>
                <textarea
                  name="reviewNote"
                  defaultValue={item.reviewNote ?? ""}
                  rows={3}
                  className="input min-h-[96px] resize-y"
                  placeholder="Add a short review note or coordination summary..."
                />
              </label>

              <ReviewActionButtons item={item} />
            </form>

            {canReopenDecision ? (
              <form action={updateCommandCenterChangeReview}>
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="reviewId" value={item.id} />
                <input type="hidden" name="title" value={item.title} />
                <input type="hidden" name="summary" value={item.summary} />
                <input type="hidden" name="changeType" value={item.changeType} />
                <input type="hidden" name="impactLevel" value={item.impactLevel} />
                <input type="hidden" name="confidence" value={item.confidence} />
                <input type="hidden" name="readinessEffect" value={item.readinessEffect} />
                <input type="hidden" name="decisionEffect" value={item.decisionEffect} />
                <input type="hidden" name="sourceType" value={item.sourceType} />
                <input
                  type="hidden"
                  name="followUpRequired"
                  value={item.followUpRequired ? "true" : "false"}
                />
                <input
                  type="hidden"
                  name="affectedAreas"
                  value={JSON.stringify(item.affectedAreas)}
                />
                <input
                  type="hidden"
                  name="relatedDecisionIds"
                  value={JSON.stringify(item.relatedDecisionIds)}
                />
                <input type="hidden" name="reviewNote" value={item.reviewNote ?? ""} />
                <input type="hidden" name="nextStatus" value="follow_up_needed" />
                <button
                  type="submit"
                  name="decisionAction"
                  value="reopen_related"
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                >
                  Reopen linked decision
                </button>
              </form>
            ) : null}
          </div>
        </details>
      ) : (
        <p className="mt-5 text-sm leading-7 text-slate-500">
          Project owners can update review state and reopen linked decisions from this room.
        </p>
      )}
    </CommandCenterPanel>
  );
}

export function CommandCenterChangeImpactReviewPanel({
  workspaceId,
  review,
  canManage,
  detailsOnly = false
}: {
  workspaceId: string;
  review: CommandCenterChangeImpactReview;
  canManage: boolean;
  detailsOnly?: boolean;
}) {
  const activeReviewItems = review.items.filter((item) => item.reviewStatus !== "no_longer_relevant");
  const highestImpactItem =
    review.highestImpactLevel === null
      ? null
      : activeReviewItems.find((item) => item.impactLevel === review.highestImpactLevel) ??
        review.items.find((item) => item.impactLevel === review.highestImpactLevel) ??
        null;

  if (detailsOnly) {
    return (
      <div id="command-center-change-impact" className="space-y-4">
        {activeReviewItems.length > 0 ? (
          activeReviewItems.map((item) => (
            <ChangeImpactItemCard
              key={item.id}
              workspaceId={workspaceId}
              item={item}
              canManage={canManage}
            />
          ))
        ) : review.items.length > 0 ? (
          review.items.map((item) => (
            <ChangeImpactItemCard
              key={item.id}
              workspaceId={workspaceId}
              item={item}
              canManage={canManage}
            />
          ))
        ) : (
          <CommandCenterPanel dataState={review.dataState}>
            <p className="text-sm leading-7 text-slate-500">{review.emptyState}</p>
          </CommandCenterPanel>
        )}
      </div>
    );
  }

  return (
    <div id="command-center-change-impact">
      <CommandCenterPopoverBar
        align="right"
        summaryClassName="min-h-[3.35rem] px-3.5 py-2.5"
        bubbleClassName="max-h-[31rem] overflow-y-auto"
        summary={
          <div className="flex min-h-[1.5rem] flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactSummaryChipClasses(
                "neutral"
              )}`}
            >
              Active review items: {review.activeCount}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactSummaryChipClasses(
                review.highestImpactLevel === "significant"
                  ? "critical"
                  : review.highestImpactLevel === "moderate"
                    ? "warning"
                    : "neutral"
              )}`}
            >
              Highest impact: {highestImpactLabel(review.highestImpactLevel)}
            </span>
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {review.title}
          </p>
          <CommandCenterSourceBadge source={review.source} />
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {highestImpactItem
            ? `${highestImpactItem.title}: ${highestImpactItem.summary}`
            : review.description}
        </p>

        {activeReviewItems.length > 0 ? (
          <div className="mt-4 space-y-4">
            {activeReviewItems.map((item) => (
              <ChangeImpactItemCard
                key={item.id}
                workspaceId={workspaceId}
                item={item}
                canManage={canManage}
              />
            ))}
          </div>
        ) : review.items.length > 0 ? (
          <div className="mt-4 space-y-4">
            {review.items.map((item) => (
              <ChangeImpactItemCard
                key={item.id}
                workspaceId={workspaceId}
                item={item}
                canManage={canManage}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-slate-500">{review.emptyState}</p>
        )}
      </CommandCenterPopoverBar>
    </div>
  );
}
