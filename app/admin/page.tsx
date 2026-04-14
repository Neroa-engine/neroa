import { redirect } from "next/navigation";
import { DashboardBoardShell } from "@/components/layout/page-shells";
import { requireUser } from "@/lib/auth";
import { getAdminOperationsOverview } from "@/lib/platform/foundation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default async function AdminPage() {
  const { user, access } = await requireUser({ nextPath: "/admin" });

  if (!access.isAdmin) {
    redirect("/dashboard?error=Admin access required.");
  }

  const supabase = createSupabaseServerClient();
  const overview = await getAdminOperationsOverview({
    supabase
  }).catch((error) => ({
    available: false as const,
    reason: error instanceof Error ? error.message : "Unable to load admin operations."
  }));

  return (
    <DashboardBoardShell
      userEmail={user.email ?? undefined}
      ctaHref="/dashboard"
      ctaLabel="Engine Board"
    >
      <div className="space-y-6">
        <section className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 xl:px-8">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                Platform operations
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                Watch the platform, project mix, and entitlement pressure from one internal view.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                This is the first internal operations layer for Neroa. It shows active workspaces,
                framework choices, build-session state, plan mismatch pressure, and gated attempts
                without exposing admin flags in the public product.
              </p>
            </div>
          </div>
        </section>

        {!overview.available ? (
          <section className="premium-surface rounded-[28px] p-6">
            <p className="text-lg font-semibold text-slate-950">Phase 2 migration still needs to run</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{overview.reason}</p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 xl:grid-cols-4">
              <div className="premium-surface rounded-[28px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Active workspaces
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{overview.counts.activeWorkspaces}</p>
              </div>
              <div className="premium-surface rounded-[28px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Recent build sessions
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{overview.counts.buildSessions}</p>
              </div>
              <div className="premium-surface rounded-[28px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Recent recommendations
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{overview.counts.recentRecommendations}</p>
              </div>
              <div className="premium-surface rounded-[28px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Gated attempts
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{overview.counts.gatedAttempts}</p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="premium-surface rounded-[32px] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Framework selections
                </p>
                <div className="mt-5 space-y-3">
                  {overview.recentFrameworkSelections.length > 0 ? (
                    overview.recentFrameworkSelections.map((item) => (
                      <div
                        key={`${item.workspace_id}-${item.framework_id}-${item.created_at}`}
                        className="rounded-[22px] border border-slate-200/70 bg-white/80 px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {item.framework_label ?? item.framework_id}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              Workspace {item.workspace_id} · {item.build_category ?? "unknown category"}
                            </p>
                          </div>
                          <span className="premium-pill text-cyan-700">
                            {item.recommended_tier_id ?? "tier pending"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">
                          Complexity score: {item.complexity_score ?? "n/a"} · {formatDate(item.created_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-slate-500">
                      No framework selections have been persisted yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="premium-surface rounded-[32px] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Tier mismatches
                </p>
                <div className="mt-5 space-y-3">
                  {overview.tierMismatches.length > 0 ? (
                    overview.tierMismatches.map((item) => (
                      <div
                        key={`${item.userId}-${item.workspaceId}-${item.createdAt}`}
                        className="rounded-[22px] border border-amber-300/30 bg-amber-50/70 px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-amber-900">
                          User {item.userId.slice(0, 8)} needs tier review
                        </p>
                        <p className="mt-2 text-sm leading-6 text-amber-800">
                          Selected: {item.selectedPlanId ?? "none"} · Recommended: {item.recommendedTierId}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-amber-700">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-slate-500">
                      No tier mismatches are currently flagged.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="premium-surface rounded-[32px] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Build sessions
                </p>
                <div className="mt-5 space-y-3">
                  {overview.recentBuildSessions.length > 0 ? (
                    overview.recentBuildSessions.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[22px] border border-slate-200/70 bg-white/80 px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold text-slate-950">
                            {item.stage} · {item.status}
                          </p>
                          <span className="premium-pill text-slate-500">{formatDate(item.created_at)}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Workspace {item.workspace_id}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-slate-500">
                      No build sessions have been recorded yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="premium-surface rounded-[32px] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Platform events
                </p>
                <div className="mt-5 space-y-3">
                  {overview.recentPlatformEvents.length > 0 ? (
                    overview.recentPlatformEvents.map((item, index) => (
                      <div
                        key={`${item.event_type}-${item.created_at}-${index}`}
                        className="rounded-[22px] border border-slate-200/70 bg-white/80 px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold text-slate-950">{item.event_type}</p>
                          <span className="premium-pill text-slate-500">{item.severity}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.workspace_id ? `Workspace ${item.workspace_id}` : "Platform-wide"} · {formatDate(item.created_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-slate-500">
                      No platform events are stored yet.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardBoardShell>
  );
}
