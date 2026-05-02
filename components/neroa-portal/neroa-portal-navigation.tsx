import Link from "next/link";

type NeroaPortalNavigationProps = {
  readonly currentPath: "/neroa" | "/neroa/account" | "/neroa/project";
  readonly tone?: "light" | "dark";
  readonly className?: string;
};

const portalLinks = [
  {
    href: "/neroa",
    label: "Front Door"
  },
  {
    href: "/neroa/account",
    label: "Account Portal"
  },
  {
    href: "/neroa/project",
    label: "Project Portal"
  }
] as const;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function NeroaPortalNavigation({
  currentPath,
  tone = "light",
  className = ""
}: NeroaPortalNavigationProps) {
  const dark = tone === "dark";

  return (
    <nav
      aria-label="Neroa portal navigation"
      className={cx(
        "flex flex-col gap-4 rounded-[1.7rem] border px-5 py-4 backdrop-blur xl:flex-row xl:items-center xl:justify-between",
        dark
          ? "border-slate-300/10 bg-white/5 text-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
          : "border-stone-300/70 bg-white/85 text-stone-900 shadow-[0_22px_60px_rgba(120,94,46,0.08)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/neroa"
          className={cx(
            "text-sm font-semibold uppercase tracking-[0.34em] transition",
            dark ? "text-teal-200 hover:text-teal-100" : "text-amber-800 hover:text-stone-950"
          )}
        >
          Neroa
        </Link>
        <span
          className={cx(
            "text-[11px] font-semibold uppercase tracking-[0.24em]",
            dark ? "text-slate-400" : "text-stone-500"
          )}
        >
          Clean Portal
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {portalLinks.map((link) => {
          const active = link.href === currentPath;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                dark
                  ? active
                    ? "border-teal-300/40 bg-teal-300/10 text-teal-100"
                    : "border-slate-400/20 bg-white/5 text-slate-300 hover:border-teal-300/40 hover:text-teal-100"
                  : active
                    ? "border-stone-900 bg-stone-900 text-stone-50"
                    : "border-stone-300 bg-white/80 text-stone-700 hover:border-stone-500 hover:text-stone-950"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
