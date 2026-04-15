"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { PublicAccountMenu } from "@/components/site/public-account-menu";
import { SiteNav } from "@/components/site/site-nav";
import { mainNavItems } from "@/lib/data/site-nav";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SiteHeaderProps = {
  userEmail?: string;
  ctaHref: string;
  ctaLabel: string;
  showSiteNav?: boolean;
  brandVariant?: "default" | "prominent";
};

function resolveMainNavHref(href: string, pathname: string) {
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

function HeaderLink({
  href,
  label,
  active
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
        active
          ? "bg-white/82 text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
          : "text-slate-600 hover:bg-white/72 hover:text-slate-950"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader({
  userEmail,
  ctaHref,
  ctaLabel,
  showSiteNav = false,
  brandVariant = "default"
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(userEmail ?? null);

  useEffect(() => {
    let active = true;

    try {
      const supabase = createSupabaseBrowserClient();

      void supabase.auth.getUser().then(({ data }) => {
        if (!active) {
          return;
        }

        setResolvedEmail(data.user?.email ?? null);
      });

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) {
          return;
        }

        setResolvedEmail(session?.user?.email ?? null);
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch {
      setResolvedEmail(userEmail ?? null);

      return () => {
        active = false;
      };
    }
  }, [userEmail]);

  const isAuthenticated = Boolean(resolvedEmail);
  const accountButton = isAuthenticated
    ? { href: "/dashboard", label: "Engine Board" }
    : { href: "/auth", label: "Sign in" };
  const showAccountButton =
    accountButton.href !== ctaHref || accountButton.label !== ctaLabel;
  const ctaClassName =
    ctaLabel === "Start your build" || ctaHref === "/start"
      ? "button-primary text-sm shadow-[0_20px_48px_rgba(59,130,246,0.28)]"
      : "button-secondary";

  return (
    <header className="shell sticky top-0 z-40 py-3">
      <div className="floating-nav flex flex-wrap items-center justify-between gap-4 rounded-[30px] px-4 py-3 sm:px-5 lg:px-6">
        <Link href="/" className="relative z-10 flex-shrink-0">
          <Logo variant={brandVariant} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {mainNavItems.map((item) => {
            const resolvedHref = resolveMainNavHref(item.href, pathname);
            const active = resolvedHref.includes("#")
              ? false
              : pathname === resolvedHref || pathname.startsWith(`${resolvedHref}/`);

            return (
              <HeaderLink
                key={item.href}
                href={resolvedHref}
                label={item.label}
                active={active}
              />
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2.5">
          {showSiteNav ? <SiteNav authenticated={isAuthenticated} /> : null}
          <PublicAccountMenu initialEmail={resolvedEmail ?? undefined} />
          {showAccountButton ? (
            <Link className="button-quiet px-4 py-3 text-sm" href={accountButton.href} prefetch>
              {accountButton.label}
            </Link>
          ) : null}
          <Link className={ctaClassName} href={ctaHref} prefetch>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
