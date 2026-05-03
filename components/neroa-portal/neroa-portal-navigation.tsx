import Link from "next/link";

type NeroaPortalNavigationProps = {
  readonly currentPath: "/neroa/account" | "/neroa/project" | "/neroa/admin";
  readonly includeAdminPortal?: boolean;
  readonly tone?: "light" | "dark";
  readonly className?: string;
};

const basePortalLinks = [
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

const adminPortalLink = {
  href: "/neroa/admin",
  label: "Admin Portal"
} as const;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function NorthStarIcon({
  className = ""
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.8 11.8 8.2 18.2 10l-6.4 1.8L10 18.2l-1.8-6.4L1.8 10l6.4-1.8L10 1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function NeroaPortalNavigation({
  currentPath,
  includeAdminPortal = false,
  tone = "light",
  className = ""
}: NeroaPortalNavigationProps) {
  const dark = tone === "dark";
  const portalLinks = includeAdminPortal ? [...basePortalLinks, adminPortalLink] : basePortalLinks;

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
        <Link href="/neroa" className="flex items-center gap-3 text-white">
          <NorthStarIcon
            className={cx("h-5 w-5", dark ? "text-teal-200/86" : "text-stone-700")}
          />
          <span
            className={cx(
              "font-serif text-[2.15rem] tracking-tight transition",
              dark ? "text-white hover:text-teal-100" : "text-stone-950 hover:text-stone-700"
            )}
          >
            Neroa
          </span>
        </Link>
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
