"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PublicAccountMenuProps = {
  initialEmail?: string;
  tone?: "light" | "dark";
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

export function PublicAccountMenu({
  initialEmail,
  tone = "light"
}: PublicAccountMenuProps) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState(initialEmail ?? null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const firstItemRef = useRef<HTMLAnchorElement | null>(null);
  const initials = useMemo(() => deriveInitials(userEmail), [userEmail]);
  const displayName = useMemo(() => deriveDisplayName(userEmail), [userEmail]);
  const darkTone = tone === "dark";
  const focusRingClassName =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(161,127,255,0.42)]";
  const menuItemClassName = `micro-glow rounded-[20px] px-4 py-3 text-sm font-medium ${focusRingClassName} ${
    darkTone
      ? "border border-[rgba(161,131,255,0.16)] bg-[linear-gradient(135deg,rgba(61,33,129,0.28),rgba(15,24,38,0.82))] text-[rgba(240,234,255,0.86)] hover:border-[rgba(181,155,255,0.26)] hover:bg-[linear-gradient(135deg,rgba(78,40,173,0.32),rgba(15,24,38,0.88))]"
      : "border border-[rgba(122,87,239,0.14)] bg-[linear-gradient(135deg,rgba(103,48,218,0.08),rgba(255,255,255,0.82))] text-slate-700 hover:border-[rgba(122,87,239,0.22)] hover:bg-[linear-gradient(135deg,rgba(103,48,218,0.12),rgba(255,255,255,0.92))]"
  }`;

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
        className={`button-ghost relative h-12 w-12 shrink-0 rounded-full px-0 py-0 text-sm ${focusRingClassName} ${
          darkTone
            ? "border-[rgba(161,131,255,0.16)] bg-[rgba(10,17,30,0.78)] text-[rgba(244,248,255,0.92)] shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
            : ""
        }`}
      >
        <span
          className={`pointer-events-none absolute inset-[5px] rounded-full ${
            darkTone
              ? "bg-[radial-gradient(circle_at_top_left,rgba(168,136,255,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(103,48,218,0.18),transparent_42%),linear-gradient(180deg,rgba(26,18,45,0.96),rgba(10,16,29,0.92))]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(168,136,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(103,48,218,0.14),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.72))]"
          }`}
        />
        <span
          className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold tracking-[0.08em] ${
            darkTone
              ? "border border-[rgba(181,155,255,0.22)] bg-[linear-gradient(135deg,rgba(162,116,255,0.26),rgba(103,48,218,0.2),rgba(125,70,243,0.24))] text-[rgba(247,250,255,0.96)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              : "border border-white/70 bg-[linear-gradient(135deg,rgba(162,116,255,0.2),rgba(103,48,218,0.14),rgba(125,70,243,0.18))] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]"
          }`}
        >
          {initials}
        </span>
      </button>

      {open ? (
        <div
          className={`absolute right-0 top-[calc(100%+0.8rem)] z-[100] w-[min(88vw,320px)] rounded-[28px] p-4 backdrop-blur-2xl ${
            darkTone
              ? "border border-[rgba(161,131,255,0.18)] bg-[rgba(8,14,25,0.9)] shadow-[0_30px_80px_rgba(0,0,0,0.42)]"
              : "border border-slate-200/80 bg-white/90 shadow-[0_24px_72px_rgba(15,23,42,0.16)]"
          }`}
        >
          <div
            className={`rounded-[22px] p-4 ${
              darkTone
                ? "border border-[rgba(161,131,255,0.14)] bg-[linear-gradient(180deg,rgba(18,28,45,0.94),rgba(10,16,28,0.9))]"
                : "border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.68))]"
            }`}
          >
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${darkTone ? "text-[#d6c5ff]" : "text-[#6b35d8]"}`}>
              Account
            </p>
            <p className={`mt-3 text-base font-semibold ${darkTone ? "text-[rgba(246,250,255,0.98)]" : "text-slate-950"}`}>
              {displayName}
            </p>
            <p className={`mt-1 text-sm ${darkTone ? "text-[rgba(186,201,223,0.72)]" : "text-slate-500"}`}>
              {userEmail}
            </p>
          </div>

          <div className="mt-3 grid gap-2" role="menu" aria-label="Account menu">
            <Link
              ref={firstItemRef}
              href="/projects/resume"
              role="menuitem"
              className={menuItemClassName}
            >
              Resume Project
            </Link>
            <Link
              href="/profile"
              role="menuitem"
              className={menuItemClassName}
            >
              Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              className={menuItemClassName}
            >
              Account
            </Link>
            <Link
              href="/billing"
              role="menuitem"
              className={menuItemClassName}
            >
              Billing
            </Link>
            <Link
              href="/usage"
              role="menuitem"
              className={menuItemClassName}
            >
              Usage / Credits
            </Link>
            <Link
              href="/projects"
              role="menuitem"
              className={menuItemClassName}
            >
              Projects
            </Link>
          </div>

          <form method="post" action="/auth/sign-out" className="mt-3">
            <button
              type="submit"
              className={`button-quiet w-full justify-between rounded-[20px] px-4 py-3 text-sm ${focusRingClassName} ${
                darkTone ? "text-[rgba(228,236,248,0.82)]" : "text-slate-600"
              }`}
            >
              <span>Sign out</span>
              <span
                className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                  darkTone ? "text-[rgba(161,177,203,0.62)]" : "text-slate-400"
                }`}
              >
                Exit
              </span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
