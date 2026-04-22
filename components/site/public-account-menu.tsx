"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PublicAccountMenuProps = {
  initialEmail?: string;
};

function deriveInitials(email?: string | null) {
  if (!email) {
    return "N";
  }

  const [localPart] = email.split("@");
  const compact = localPart.replace(/[^a-zA-Z0-9]/g, "");

  if (!compact) {
    return "N";
  }

  return compact.slice(0, 2).toUpperCase();
}

function deriveDisplayName(email?: string | null) {
  if (!email) {
    return "NEROA account";
  }

  const [localPart] = email.split("@");

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function PublicAccountMenu({ initialEmail }: PublicAccountMenuProps) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState(initialEmail ?? null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const firstItemRef = useRef<HTMLAnchorElement | null>(null);
  const initials = useMemo(() => deriveInitials(userEmail), [userEmail]);
  const displayName = useMemo(() => deriveDisplayName(userEmail), [userEmail]);

  useEffect(() => {
    let active = true;

    try {
      const supabase = createSupabaseBrowserClient();

      void supabase.auth.getUser().then(({ data }) => {
        if (!active) {
          return;
        }

        setUserEmail(data.user?.email ?? null);
      });

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) {
          return;
        }

        setUserEmail(session?.user?.email ?? null);
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch {
      setUserEmail(initialEmail ?? null);

      return () => {
        active = false;
      };
    }
  }, [initialEmail]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        window.setTimeout(() => buttonRef.current?.focus(), 0);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => firstItemRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!userEmail) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative z-[90]">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? "Close account menu" : "Open account menu"}
        className="button-ghost relative h-12 w-12 shrink-0 rounded-full px-0 py-0 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
      >
        <span className="pointer-events-none absolute inset-[5px] rounded-full bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.72))]" />
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(59,130,246,0.12),rgba(139,92,246,0.16))] text-[12px] font-semibold tracking-[0.08em] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
          {initials}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.8rem)] z-[100] w-[min(88vw,320px)] rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_72px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
          <div className="rounded-[22px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.68))] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Account
            </p>
            <p className="mt-3 text-base font-semibold text-slate-950">{displayName}</p>
            <p className="mt-1 text-sm text-slate-500">{userEmail}</p>
          </div>

          <div className="mt-3 grid gap-2" role="menu" aria-label="Account menu">
            <Link
              ref={firstItemRef}
              href="/dashboard"
              role="menuitem"
              className="micro-glow rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
            >
              Resume Project
            </Link>
            <Link
              href="/start"
              role="menuitem"
              className="micro-glow rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
            >
              Strategy Room
            </Link>
          </div>

          <form method="post" action="/auth/sign-out" className="mt-3">
            <button
              type="submit"
              className="button-quiet w-full justify-between rounded-[20px] px-4 py-3 text-sm text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
            >
              <span>Sign out</span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Exit
              </span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
