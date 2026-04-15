"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  authenticatedUtilityNavItems,
  publicUtilityNavItems,
  siteNavItems
} from "@/lib/data/site-nav";

type SiteNavProps = {
  className?: string;
  authenticated?: boolean;
};

function resolveSiteNavHref(href: string, pathname: string) {
  if (href === "/pricing") {
    if (
      pathname.startsWith("/diy-build") ||
      pathname.startsWith("/diy") ||
      pathname.startsWith("/pricing/diy")
    ) {
      return "/pricing/diy";
    }

    if (pathname.startsWith("/managed-build") || pathname.startsWith("/pricing/managed")) {
      return "/pricing/managed";
    }
  }

  return href;
}

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

export function SiteNav({ className = "", authenticated = false }: SiteNavProps) {
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
        className="button-ghost relative z-30 h-12 w-12 px-0 py-0 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
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
                    className="fixed inset-0 z-[120] bg-slate-950/10 backdrop-blur-[4px]"
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
                    className="fixed z-[130] flex flex-col overflow-hidden rounded-[34px] border border-slate-200/85 bg-white/88 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl"
                  >
                    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.6))] p-5 sm:p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_34%)]" />

                      <div className="relative flex min-h-0 flex-1 flex-col">
                        <div className="shrink-0 border-b border-slate-200/70 pb-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                                Explore Neroa
                              </p>
                              <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                                Move through the live public product pages, understand the AI system, and jump into the right build path when you are ready.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setOpen(false)}
                              className="button-quiet px-3 py-2 text-sm"
                            >
                              Close
                            </button>
                          </div>

                          {utilityItems.length > 0 ? (
                            <div className="mt-5">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
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
                                      className={`rounded-full border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
                                        active
                                          ? "border-cyan-200/80 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.1))] text-slate-950"
                                          : "border-slate-200/70 bg-white/78 text-slate-600 hover:border-cyan-300/40 hover:bg-white/92 hover:text-slate-950"
                                      }`}
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
                            {siteNavItems.map((item, index) => {
                              const resolvedHref = resolveSiteNavHref(item.href, pathname);

                              return (
                              <Link
                                key={item.href}
                                href={resolvedHref}
                                className="micro-glow rounded-[24px] border border-slate-200/75 bg-white/72 px-4 py-4 transition hover:border-cyan-300/45 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                      {item.description}
                                    </p>
                                  </div>
                                  <span className="text-sm font-medium text-cyan-700">Open</span>
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
