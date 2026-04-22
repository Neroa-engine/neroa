"use client";

import Link from "next/link";
import { APP_ROUTES } from "@/lib/routes";

const accountNavItems = [
  {
    href: APP_ROUTES.dashboard,
    label: "Resume Project",
    summary: "Smart entry back into the active project's next room"
  },
  {
    href: APP_ROUTES.projects,
    label: "Projects",
    summary: "Open workspaces and active builds"
  },
  {
    href: APP_ROUTES.billing,
    label: "Billing",
    summary: "Plans, upgrades, and purchases"
  },
  {
    href: APP_ROUTES.usage,
    label: "Usage",
    summary: "Credits, limits, and capacity"
  },
  {
    href: APP_ROUTES.profile,
    label: "Profile",
    summary: "Identity and session details"
  },
  {
    href: APP_ROUTES.settings,
    label: "Settings",
    summary: "Account controls and sign-out"
  }
] as const;

function isActivePath(currentPath: string, href: string) {
  if (href === APP_ROUTES.dashboard) {
    return currentPath === APP_ROUTES.dashboard;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function AccountNav({
  currentPath,
  compact = false
}: {
  currentPath: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <nav className="flex flex-wrap gap-2">
        {accountNavItems.map((item) => {
          const active = isActivePath(currentPath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-slate-950 text-white shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
                  : "border border-slate-200/70 bg-white/76 text-slate-600 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className="floating-plane sticky top-24 rounded-[30px] p-4">
      <div className="floating-wash rounded-[30px]" />
      <div className="relative space-y-3">
        <div className="rounded-[22px] border border-slate-200/75 bg-white/86 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Signed-in command center
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Keep the signed-in account surfaces in one visible navigation layer.
          </p>
        </div>
        {accountNavItems.map((item) => {
          const active = isActivePath(currentPath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-[22px] border px-4 py-4 transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
                  : "border-slate-200/70 bg-white/86 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/70"
              }`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className={`mt-1 text-xs leading-6 ${active ? "text-slate-200" : "text-slate-500"}`}>
                {item.summary}
              </p>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
