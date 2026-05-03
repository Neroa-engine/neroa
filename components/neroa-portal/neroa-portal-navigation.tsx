import Link from "next/link";

type NeroaPortalNavigationProps = {
  readonly currentPath: "/neroa/account" | "/neroa/project";
  readonly tone?: "light" | "dark";
  readonly className?: string;
};

const portalLinks = [
  {
    href: "/neroa",
    label: "Home"
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
        "flex flex-col gap-4 border-b px-1 pb-5 pt-2 xl:flex-row xl:items-center xl:justify-between",
        dark
          ? "border-white/10 text-slate-100"
          : "border-stone-300/70 text-stone-900",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cx(
            "inline-flex h-9 w-9 items-center justify-center rounded-sm border text-[0.72rem] font-semibold uppercase tracking-[0.3em]",
            dark
              ? "border-teal-300/32 bg-teal-300/10 text-teal-100"
              : "border-stone-300 bg-white/80 text-stone-700"
          )}
          aria-hidden="true"
        >
          NS
        </span>
        <Link
          href="/neroa"
          className={cx(
            "font-serif text-[2rem] tracking-tight transition",
            dark ? "text-white hover:text-teal-100" : "text-stone-950 hover:text-stone-700"
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
          North Star
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {portalLinks.map((link) => {
          const active = link.href === currentPath;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "border-b pb-2 text-sm font-semibold uppercase tracking-[0.22em] transition",
                dark
                  ? active
                    ? "border-teal-300/70 text-teal-100"
                    : "border-transparent text-slate-300 hover:border-white/25 hover:text-white"
                  : active
                    ? "border-stone-900 text-stone-950"
                    : "border-transparent text-stone-700 hover:border-stone-500 hover:text-stone-950"
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
