"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VIEWPORT_GUTTER = 16;
const BUBBLE_OFFSET = 10;

type BubbleLayout = {
  top: number;
  left: number;
  ready: boolean;
  transformOrigin: string;
};

export function CommandCenterPopoverBar({
  summary,
  summaryAction,
  children,
  tone = "light",
  align = "left",
  className = "",
  summaryClassName = "",
  bubbleClassName = ""
}: {
  summary: ReactNode;
  summaryAction?: ReactNode;
  children: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "right";
  className?: string;
  summaryClassName?: string;
  bubbleClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [bubbleLayout, setBubbleLayout] = useState<BubbleLayout | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleId = useId().replace(/:/g, "");

  const updateBubbleLayout = useCallback(() => {
    if (!open || !triggerRef.current || !bubbleRef.current || typeof window === "undefined") {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const bubbleRect = bubbleRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const bubbleWidth = bubbleRect.width;
    const bubbleHeight = bubbleRect.height;

    let left = align === "right" ? triggerRect.right - bubbleWidth : triggerRect.left;
    left = Math.max(VIEWPORT_GUTTER, Math.min(left, viewportWidth - bubbleWidth - VIEWPORT_GUTTER));

    let top = triggerRect.bottom + BUBBLE_OFFSET;
    let transformOrigin = `${align === "right" ? "right" : "left"} top`;

    const fitsBelow = triggerRect.bottom + BUBBLE_OFFSET + bubbleHeight <= viewportHeight - VIEWPORT_GUTTER;
    const fitsAbove = triggerRect.top - BUBBLE_OFFSET - bubbleHeight >= VIEWPORT_GUTTER;

    if (!fitsBelow && fitsAbove) {
      top = triggerRect.top - bubbleHeight - BUBBLE_OFFSET;
      transformOrigin = `${align === "right" ? "right" : "left"} bottom`;
    } else {
      top = Math.max(
        VIEWPORT_GUTTER,
        Math.min(top, viewportHeight - bubbleHeight - VIEWPORT_GUTTER)
      );
    }

    setBubbleLayout({
      top,
      left,
      ready: true,
      transformOrigin
    });
  }, [align, open]);

  useEffect(() => {
    if (!open) {
      setBubbleLayout(null);
      return;
    }

    setBubbleLayout({
      top: 0,
      left: 0,
      ready: false,
      transformOrigin: `${align === "right" ? "right" : "left"} top`
    });
  }, [align, open]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updateBubbleLayout();
    const frame = window.requestAnimationFrame(updateBubbleLayout);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open, updateBubbleLayout]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedTrigger = rootRef.current?.contains(target);
      const clickedBubble = bubbleRef.current?.contains(target);

      if (!clickedTrigger && !clickedBubble) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateBubbleLayout);
    window.addEventListener("scroll", updateBubbleLayout, true);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updateBubbleLayout()) : null;
    if (triggerRef.current) {
      resizeObserver?.observe(triggerRef.current);
    }
    if (bubbleRef.current) {
      resizeObserver?.observe(bubbleRef.current);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateBubbleLayout);
      window.removeEventListener("scroll", updateBubbleLayout, true);
      resizeObserver?.disconnect();
    };
  }, [open, updateBubbleLayout]);

  const summaryToneClasses =
    tone === "dark"
      ? "border-white/12 bg-white/6 text-white shadow-[0_18px_40px_rgba(2,6,23,0.22)]"
      : "border-slate-200/70 bg-white/88 text-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.08)]";

  const bubbleToneClasses =
    tone === "dark"
      ? "border-slate-800 bg-slate-950 text-slate-100 ring-1 ring-black/5 shadow-[0_30px_80px_rgba(2,6,23,0.58)]"
      : "border-slate-200 bg-white text-slate-950 ring-1 ring-slate-900/5 shadow-[0_28px_70px_rgba(15,23,42,0.18)]";

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      <div className="flex items-start gap-2">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={bubbleId}
          aria-haspopup="dialog"
          onClick={() => setOpen((value) => !value)}
          className={`w-full cursor-pointer rounded-[18px] border px-4 py-3 text-left transition ${summaryToneClasses} ${summaryClassName}`}
        >
          {summary}
        </button>
        {summaryAction ? <div className="shrink-0">{summaryAction}</div> : null}
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-[160]">
              <div
                id={bubbleId}
                ref={bubbleRef}
                role="dialog"
                aria-modal="false"
                style={{
                  left: bubbleLayout?.left ?? 0,
                  top: bubbleLayout?.top ?? 0,
                  maxHeight: `calc(100vh - ${VIEWPORT_GUTTER * 2}px)`,
                  transformOrigin: bubbleLayout?.transformOrigin
                }}
                className={`pointer-events-auto fixed w-[min(34rem,calc(100vw-2.5rem))] rounded-[24px] border p-4 ${
                  bubbleToneClasses
                } ${bubbleLayout?.ready ? "visible" : "invisible"} ${bubbleClassName}`}
              >
                <button
                  type="button"
                  aria-label="Close details"
                  onClick={() => setOpen(false)}
                  className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                    tone === "dark"
                      ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                      : "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  Close
                </button>
                <div className="pr-14">{children}</div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
