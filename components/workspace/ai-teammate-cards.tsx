"use client";

import { useState } from "react";
import AiAvatar from "@/components/workspace/ai-avatar";

type ConnectedAI = {
  id: string;
  provider: "chatgpt" | "claude" | "codex" | "github";
  displayName: string;
  role: string;
  status: "connected" | "available" | "connect_repo";
  avatarSeed: string;
  systemPrompt?: string;
  accent?: string;
  enabled: boolean;
};

const initialTeammates: ConnectedAI[] = [
  {
    id: "chatgpt",
    provider: "chatgpt",
    displayName: "Narua",
    role: "Core Intelligence / Execution",
    status: "connected",
    avatarSeed: "narua-core",
    systemPrompt: "Drives routing, planning, synthesis, and execution guidance across the workspace.",
    accent: "from-cyan-300/18 via-sky-400/10 to-transparent",
    enabled: true
  },
  {
    id: "claude",
    provider: "claude",
    displayName: "Atlas",
    role: "Long-form Reasoning",
    status: "available",
    avatarSeed: "atlas-depth",
    systemPrompt: "Handles deep analysis, synthesis, and long-form reasoning work.",
    accent: "from-fuchsia-300/18 via-violet-400/10 to-transparent",
    enabled: true
  },
  {
    id: "codex",
    provider: "codex",
    displayName: "Forge",
    role: "Code Generation",
    status: "available",
    avatarSeed: "forge-build",
    systemPrompt: "Executes code-oriented tasks and implementation workflows.",
    accent: "from-sky-300/18 via-blue-400/10 to-transparent",
    enabled: true
  },
  {
    id: "github",
    provider: "github",
    displayName: "RepoLink",
    role: "Source Context",
    status: "connect_repo",
    avatarSeed: "repolink-source",
    systemPrompt: "Provides repository state and source-grounded software context.",
    accent: "from-slate-200/12 via-slate-400/8 to-transparent",
    enabled: true
  }
];

function providerLabel(provider: ConnectedAI["provider"]) {
  switch (provider) {
    case "chatgpt":
      return "ChatGPT";
    case "claude":
      return "Claude";
    case "codex":
      return "Codex";
    case "github":
      return "GitHub";
  }
}

function statusLabel(status: ConnectedAI["status"]) {
  switch (status) {
    case "connected":
      return "Connected";
    case "available":
      return "Available";
    case "connect_repo":
      return "Connect Repo";
  }
}

function statusClasses(status: ConnectedAI["status"]) {
  if (status === "connected") {
    return "bg-emerald-400/12 text-emerald-200";
  }

  if (status === "connect_repo") {
    return "bg-cyan-400/12 text-cyan-200";
  }

  return "bg-white/[0.06] text-white/65";
}

function toneClasses(teammate: ConnectedAI) {
  return teammate.accent ?? "from-white/10 to-transparent";
}

export default function AiTeammateCards() {
  const [teammates, setTeammates] = useState(initialTeammates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  function startEdit(teammate: ConnectedAI) {
    setEditingId(teammate.id);
    setDraftName(teammate.displayName);
  }

  function saveEdit(id: string) {
    const nextName = draftName.trim();

    setTeammates((current) =>
      current.map((teammate) =>
        teammate.id === id
          ? {
              ...teammate,
              displayName: nextName || teammate.displayName
            }
          : teammate
      )
    );

    setEditingId(null);
    setDraftName("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftName("");
  }

  return (
    <div className="mt-6 space-y-3">
      {teammates.filter((teammate) => teammate.enabled).map((teammate) => {
        const isEditing = editingId === teammate.id;

        return (
          <article
            key={teammate.id}
            className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.022))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneClasses(teammate)} opacity-100`} />
            <div className="relative flex items-start gap-4">
              <AiAvatar
                provider={teammate.provider}
                displayName={teammate.displayName}
                avatarSeed={teammate.avatarSeed}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/30"
                          placeholder={teammate.displayName}
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(teammate.id)}
                            className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-950"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center justify-center rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/75"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="truncate text-xl font-semibold tracking-tight text-white">
                          {teammate.displayName}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                          Powered by {providerLabel(teammate.provider)}
                        </p>
                      </>
                    )}
                  </div>

                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => startEdit(teammate)}
                      className="inline-flex items-center justify-center rounded-xl bg-white/[0.06] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/[0.1]"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>

                {!isEditing ? (
                  <>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/78">
                        {teammate.role}
                      </span>
                      <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusClasses(teammate.status)}`}>
                        {statusLabel(teammate.status)}
                      </span>
                    </div>

                    {teammate.systemPrompt ? (
                      <p className="mt-3 text-sm leading-6 text-white/50">
                        {teammate.systemPrompt}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
