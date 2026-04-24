"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { buildAuthRedirectPath } from "@/lib/auth/routes";
import { PublicActionLink } from "@/components/site/public-action-link";
import {
  authenticatedUtilityNavItems,
  publicUtilityNavItems,
  siteNavItems
} from "@/lib/data/site-nav";

type SiteNavProps = {
  className?: string;
  authenticated?: boolean;
  tone?: "light" | "dark";
};

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 22 22"
      className="h-[18px] w-[18px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 6.5H17.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M4.5 11H17.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M4.5 15.5H14"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.5 10H13.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="m10.5 7 3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteNav({
  className = "",
  authenticated = false,
  tone = "light"
}: SiteNavProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<Record<string, string>>({});
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const panelId = useId();
  const utilityItems = authenticated ? authenticatedUtilityNavItems : publicUtilityNavItems;
  const navigationItems = siteNavItems.map((item) =>
    item.label === "Projects" && !authenticated
      ? {
          ...item,
          href: buildAuthRedirectPath({ nextPath: item.href })
        }
      : item
  );
  const darkTone = tone === "dark";
  const focusRingClassName =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(161,127,255,0.42)]";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const panelWidth = Math.min(472, window.innerWidth - 32);
      const maxHeight = Math.max(360, Math.min(window.innerHeight * 0.88, window.innerHeight - 24));
      const top = Math.max(12, Math.min(rect.bottom + 14, window.innerHeight - maxHeight - 12));
      const left = Math.max(16, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 16));

      setPanelStyle({
        top: `${top}px`,
        left: `${left}px`,
        width: `${panelWidth}px`,
        maxHeight: `${maxHeight}px`
      });
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        window.setTimeout(() => buttonRef.current?.focus(), 0);
        return;
      }

      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    updatePosition();
    window.setTimeout(() => firstLinkRef.current?.focus(), 0);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className={`button-ghost relative z-30 h-12 w-12 px-0 py-0 text-sm ${focusRingClassName} ${
          darkTone
            ? "border-[rgba(161,131,255,0.16)] bg-[rgba(10,17,30,0.78)] text-[rgba(244,248,255,0.92)] shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
            : ""
        }`}
      >
        <MenuIcon />
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <>
                  <motion.button
                    type="button"
                    aria-label="Close site navigation"
                    className={`fixed inset-0 z-[120] ${
                      darkTone ? "bg-slate-950/45 backdrop-blur-[8px]" : "bg-slate-950/10 backdrop-blur-[4px]"
                    }`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  />

                  <motion.div
                    ref={panelRef}
                    id={panelId}
                    role="dialog"
                    aria-modal="true"
                    initial={{
                      opacity: 0,
                      y: prefersReducedMotion ? 0 : -10,
                      scale: prefersReducedMotion ? 1 : 0.985
                    }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: prefersReducedMotion ? 0 : -8,
                      scale: prefersReducedMotion ? 1 : 0.985
                    }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: "easeOut" }}
                    style={panelStyle}
                    className={`fixed z-[130] flex flex-col overflow-hidden rounded-[34px] p-4 backdrop-blur-2xl ${
                      darkTone
                        ? "border border-[rgba(161,131,255,0.16)] bg-[rgba(7,13,24,0.88)] shadow-[0_32px_96px_rgba(0,0,0,0.5)]"
                        : "border border-slate-200/85 bg-white/88 shadow-[0_28px_90px_rgba(15,23,42,0.16)]"
                    }`}
                  >
                    <div
                      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] p-5 sm:p-6 ${
                        darkTone
                          ? "bg-[linear-gradient(180deg,rgba(14,22,38,0.96),rgba(8,13,24,0.92))]"
                          : "bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.6))]"
                      }`}
                    >
                      <div
                        className={`pointer-events-none absolute inset-0 ${
                          darkTone
                            ? "bg-[radial-gradient(circle_at_top_left,rgba(168,136,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(103,48,218,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_34%)]"
                            : "bg-[radial-gradient(circle_at_top_left,rgba(168,136,255,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(103,48,218,0.12),transparent_34%)]"
                        }`}
                      />

                      <div className="relative flex min-h-0 flex-1 flex-col">
                        <div className={`shrink-0 pb-5 ${darkTone ? "border-b border-[rgba(161,131,255,0.14)]" : "border-b border-slate-200/70"}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${darkTone ? "text-[#d6c5ff]" : "text-[#6b35d8]"}`}>
                                Explore NEROA
                              </p>
                              <p className={`mt-3 max-w-md text-sm leading-7 ${darkTone ? "text-[rgba(204,217,236,0.78)]" : "text-slate-600"}`}>
                                Move through the live product pages, understand the build paths, and jump into the right next step when you are ready.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setOpen(false)}
                              className={`button-quiet px-3 py-2 text-sm ${
                                darkTone ? "text-[rgba(228,236,248,0.82)]" : ""
                              }`}
                            >
                              Close
                            </button>
                          </div>

                          {utilityItems.length > 0 ? (
                            <div className="mt-5">
                              <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${darkTone ? "text-[rgba(157,173,198,0.6)]" : "text-slate-400"}`}>
                                Quick access
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {utilityItems.map((item, index) => {
                                  const active = item.href === "/"
                                    ? pathname === "/"
                                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                                  return (
                                    <Link
                                      key={item.href}
                                      ref={index === 0 ? firstLinkRef : undefined}
                                      href={item.href}
                                      className={
                                        darkTone
                                          ? `rounded-full border px-3 py-2 text-xs font-medium transition ${focusRingClassName} ${
                                              active
                                                ? "border-[rgba(181,155,255,0.28)] bg-[linear-gradient(135deg,rgba(103,48,218,0.22),rgba(24,16,44,0.88))] text-[rgba(247,250,255,0.98)]"
                                                : "border-[rgba(161,131,255,0.12)] bg-[linear-gradient(135deg,rgba(61,33,129,0.22),rgba(13,22,36,0.78))] text-[rgba(225,219,245,0.76)] hover:border-[rgba(181,155,255,0.24)] hover:bg-[linear-gradient(135deg,rgba(78,40,173,0.28),rgba(16,26,42,0.9))] hover:text-[rgba(247,250,255,0.98)]"
                                            }`
                                          : `rounded-full border px-3 py-2 text-xs font-medium transition ${focusRingClassName} ${
                                              active
                                                ? "border-[rgba(122,87,239,0.22)] bg-[linear-gradient(135deg,rgba(103,48,218,0.12),rgba(125,70,243,0.08))] text-slate-950"
                                                : "border-[rgba(122,87,239,0.12)] bg-white/78 text-slate-600 hover:border-[rgba(122,87,239,0.24)] hover:bg-[linear-gradient(135deg,rgba(103,48,218,0.08),rgba(255,255,255,0.92))] hover:text-slate-950"
                                            }`
                                      }
                                    >
                                      {item.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="thin-scrollbar mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                        <div className="grid gap-3 pb-1">
                            {navigationItems.map((item, index) => {
                              const isStartEntryLink = item.href.startsWith("/start");
                              const cardClassName =
                                darkTone
                                  ? `micro-glow rounded-[24px] border border-[rgba(161,131,255,0.14)] bg-[linear-gradient(135deg,rgba(61,33,129,0.22),rgba(13,22,36,0.82))] px-4 py-4 transition hover:border-[rgba(181,155,255,0.24)] hover:bg-[linear-gradient(135deg,rgba(78,40,173,0.28),rgba(16,26,42,0.92))] ${focusRingClassName}`
                                  : `micro-glow rounded-[24px] border border-[rgba(122,87,239,0.14)] bg-[linear-gradient(135deg,rgba(103,48,218,0.08),rgba(255,255,255,0.78))] px-4 py-4 transition hover:border-[rgba(122,87,239,0.22)] hover:bg-[linear-gradient(135deg,rgba(103,48,218,0.12),rgba(255,255,255,0.92))] ${focusRingClassName}`;

                              if (isStartEntryLink) {
                                return (
                                  <PublicActionLink
                                    key={item.href}
                                    href={item.href}
                                    label={item.label}
                                    className={cardClassName}
                                    initialAuthenticated={authenticated}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p className={`text-sm font-semibold ${darkTone ? "text-[rgba(246,250,255,0.98)]" : "text-slate-950"}`}>{item.label}</p>
                                        <p className={`mt-1 text-sm leading-6 ${darkTone ? "text-[rgba(197,212,232,0.76)]" : "text-slate-600"}`}>
                                          {item.description}
                                        </p>
                                      </div>
                                      <span
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                                          darkTone
                                            ? "border border-[rgba(161,131,255,0.16)] bg-[rgba(21,15,39,0.92)] text-[#d6c5ff]"
                                            : "border border-[rgba(122,87,239,0.14)] bg-[rgba(255,255,255,0.84)] text-[#6b35d8]"
                                        }`}
                                      >
                                        <ArrowIcon />
                                        <span className="sr-only">View page</span>
                                      </span>
                                    </div>
                                  </PublicActionLink>
                                );
                              }

                              return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cardClassName}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className={`text-sm font-semibold ${darkTone ? "text-[rgba(246,250,255,0.98)]" : "text-slate-950"}`}>{item.label}</p>
                                    <p className={`mt-1 text-sm leading-6 ${darkTone ? "text-[rgba(197,212,232,0.76)]" : "text-slate-600"}`}>
                                      {item.description}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                                      darkTone
                                        ? "border border-[rgba(161,131,255,0.16)] bg-[rgba(21,15,39,0.92)] text-[#d6c5ff]"
                                        : "border border-[rgba(122,87,239,0.14)] bg-[rgba(255,255,255,0.84)] text-[#6b35d8]"
                                    }`}
                                  >
                                    <ArrowIcon />
                                    <span className="sr-only">View page</span>
                                  </span>
                                </div>
                              </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  );
}
