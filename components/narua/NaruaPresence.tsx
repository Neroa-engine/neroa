"use client";

import type { ReactNode } from "react";
import AiAvatar from "@/components/workspace/ai-avatar";

type NaruaPresenceProps = {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
  chips?: string[];
  actions?: ReactNode;
  supportingContent?: ReactNode;
  variant?: "hero" | "panel" | "compact";
  avatarSeed?: string;
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function stageClasses(variant: NonNullable<NaruaPresenceProps["variant"]>) {
  if (variant === "compact") {
    return "min-h-[180px] rounded-[28px] p-4";
  }

  if (variant === "panel") {
    return "min-h-[220px] rounded-[30px] p-5";
  }

  return "min-h-[300px] rounded-[34px] p-6 xl:min-h-[340px]";
}

function avatarSize(variant: NonNullable<NaruaPresenceProps["variant"]>) {
  if (variant === "compact") {
    return "lg" as const;
  }

  if (variant === "panel") {
    return "xl" as const;
  }

  return "2xl" as const;
}

export default function NaruaPresence({
  eyebrow,
  title,
  description,
  status = "Neroa Core Online",
  chips = [],
  actions,
  supportingContent,
  variant = "hero",
  avatarSeed = "narua-core"
}: NaruaPresenceProps) {
  const heroVariant = variant === "hero";

  return (
    <section
      className={joinClasses(
        "premium-surface-strong overflow-hidden",
        heroVariant ? "p-6 xl:p-8" : "p-5"
      )}
    >
      <div
        className={joinClasses(
          "grid items-center gap-6",
          heroVariant
            ? "xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]"
            : "lg:grid-cols-[220px_minmax(0,1fr)]"
        )}
      >
        <div
          className={joinClasses(
            "relative isolate overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.78),rgba(6,9,19,0.92))]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_90px_rgba(0,0,0,0.38)]",
            stageClasses(variant)
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.26),transparent_34%),radial-gradient(circle_at_70%_76%,rgba(139,92,246,0.24),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-[12%] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute inset-[20%] rounded-full border border-cyan-300/12" />
          <div className="pointer-events-none absolute inset-[28%] rounded-full border border-violet-300/10" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <span className="premium-pill border-white/10 bg-white/[0.05] text-slate-200">
                Neroa Presence
              </span>
              <span className="premium-pill border-cyan-300/18 bg-cyan-300/[0.08] text-cyan-100">
                {status}
              </span>
            </div>

            <div className="flex flex-1 items-center justify-center py-6">
              <AiAvatar
                provider="narua"
                displayName="Neroa"
                avatarSeed={avatarSeed}
                size={avatarSize(variant)}
                emphasis="hero"
              />
            </div>

            <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                Execution layer active
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                Persistent engine memory
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/78">
            {eyebrow}
          </p>
          <h2
            className={joinClasses(
              "mt-4 max-w-4xl font-semibold tracking-[-0.04em] text-white",
              heroVariant ? "text-4xl leading-[0.95] xl:text-5xl 2xl:text-[4.2rem]" : "text-3xl"
            )}
          >
            {title}
          </h2>
          <p
            className={joinClasses(
              "mt-4 max-w-3xl text-slate-300",
              heroVariant ? "text-base leading-8 xl:text-lg" : "text-sm leading-7"
            )}
          >
            {description}
          </p>

          {chips.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="premium-pill border-white/10 bg-white/[0.05] px-4 py-2 text-slate-200"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
          {supportingContent ? <div className="mt-6">{supportingContent}</div> : null}
        </div>
      </div>
    </section>
  );
}
