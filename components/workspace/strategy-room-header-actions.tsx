"use client";

import { useFormStatus } from "react-dom";
import {
  approveStrategyScope,
  saveStrategyRevision
} from "@/app/workspace/[workspaceId]/strategy-room/actions";

type StrategyRoomHeaderActionsProps = {
  workspaceId: string;
  approvalAllowed: boolean;
};

function StrategyRoomActionButton({
  idleLabel,
  pendingLabel,
  className,
  disabled = false
}: {
  idleLabel: string;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function StrategyRoomHeaderActions({
  workspaceId,
  approvalAllowed
}: StrategyRoomHeaderActionsProps) {
  const returnTo = `/workspace/${workspaceId}/strategy-room`;

  return (
    <div className="relative z-10 flex flex-wrap items-center gap-3">
      <form action={saveStrategyRevision} className="shrink-0">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="saveMode" value="chat_checkpoint" />
        <StrategyRoomActionButton
          idleLabel="Save revision"
          pendingLabel="Saving revision..."
          className="rounded-full border border-white/10 bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-70"
        />
      </form>

      <form action={approveStrategyScope} className="shrink-0">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <StrategyRoomActionButton
          idleLabel="Approve roadmap scope"
          pendingLabel="Approving roadmap scope..."
          disabled={!approvalAllowed}
          className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        />
      </form>
    </div>
  );
}
