"use client";

import { useRef } from "react";
import { setActiveProjectContext } from "@/app/portal/actions";
import type { ProjectPortalRoomId } from "@/lib/portal/routes";
import type { PortalProjectSummary } from "@/lib/portal/server";

type ActiveProjectSelectControlProps = {
  projects: PortalProjectSummary[];
  activeWorkspaceId?: string | null;
  destination: string;
  returnTo: string;
  label?: string;
  roomId?: ProjectPortalRoomId;
  presentation?: "stacked" | "inline";
};

export function ActiveProjectSelectControl({
  projects,
  activeWorkspaceId,
  destination,
  returnTo,
  label = "Active project",
  roomId,
  presentation = "stacked"
}: ActiveProjectSelectControlProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const inline = presentation === "inline";

  if (projects.length === 0) {
    return null;
  }

  return (
    <form
      ref={formRef}
      action={setActiveProjectContext}
      className={
        inline
          ? "pointer-events-auto relative z-10 shrink-0 flex flex-wrap items-center gap-2"
          : "mt-4 space-y-3"
      }
    >
      <input type="hidden" name="destination" value={destination} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {roomId ? <input type="hidden" name="roomId" value={roomId} /> : null}
      <label
        className={
          inline
            ? "relative z-10 flex min-w-[250px] items-center gap-3"
            : "space-y-2"
        }
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
        <span className="relative z-10 block min-w-[220px] flex-1">
          <select
            name="workspaceId"
            defaultValue={activeWorkspaceId ?? ""}
            required
            aria-label={label}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;

              if (!nextValue || nextValue === activeWorkspaceId) {
                return;
              }

              formRef.current?.requestSubmit();
            }}
            className={
              inline
                ? "min-w-[250px] appearance-none rounded-full border border-slate-200/80 bg-white/92 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white"
                : "input appearance-none pr-10"
            }
          >
            {!activeWorkspaceId ? (
              <option value="" disabled>
                Select a project
              </option>
            ) : null}
            {projects.map((project) => (
              <option key={project.workspaceId} value={project.workspaceId}>
                {project.title}
                {project.customerFacingState === "current" ? "" : ` (${project.statusLabel})`}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            v
          </span>
        </span>
      </label>
    </form>
  );
}
