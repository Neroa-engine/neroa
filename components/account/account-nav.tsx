"use client";

import Link from "next/link";
import { APP_ROUTES } from "@/lib/routes";

const accountNavItems = [
  {
    href: APP_ROUTES.projectsResume,
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
  if (href === APP_ROUTES.projectsResume) {
    return currentPath === APP_ROUTES.projectsResume || currentPath === APP_ROUTES.dashboard;
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
                  ? "border border-[rgba(159,214,255,0.24)] bg-[linear-gradient(135deg,rgba(16,28,46,0.98),rgba(10,17,29,0.94))] text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
                  : "border border-[rgba(118,179,232,0.16)] bg-[rgba(8,15,27,0.84)] text-[rgba(221,232,246,0.78)] hover:border-[rgba(150,229,255,0.24)] hover:text-white"
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
        <div className="rounded-[22px] border border-[rgba(118,179,232,0.18)] bg-[linear-gradient(180deg,rgba(9,16,28,0.94),rgba(6,11,20,0.9))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Signed-in command center
          </p>
          <p className="mt-3 text-sm leading-7 text-[rgba(205,218,236,0.78)]">
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
                  ? "border-[rgba(159,214,255,0.24)] bg-[linear-gradient(135deg,rgba(16,28,46,0.98),rgba(10,17,29,0.94))] text-white shadow-[0_22px_48px_rgba(0,0,0,0.28)]"
                  : "border-[rgba(118,179,232,0.16)] bg-[rgba(8,15,27,0.88)] text-[rgba(233,241,252,0.86)] hover:border-[rgba(150,229,255,0.24)] hover:bg-[rgba(10,19,33,0.94)]"
              }`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p
                className={`mt-1 text-xs leading-6 ${
                  active ? "text-[rgba(214,226,241,0.78)]" : "text-[rgba(180,196,218,0.72)]"
                }`}
              >
                {item.summary}
              </p>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
