"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { PublicAccountMenu } from "@/components/site/public-account-menu";
import { SiteNav } from "@/components/site/site-nav";
import { mainNavItems } from "@/lib/data/site-nav";
import { APP_ROUTES } from "@/lib/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SiteHeaderProps = {
  userEmail?: string;
  ctaHref: string;
  ctaLabel: string;
  showSiteNav?: boolean;
  minimalNavigation?: boolean;
  brandVariant?: "default" | "prominent";
  brandScale?: "default" | "landing";
  tone?: "light" | "dark";
};

function HeaderLink({
  href,
  label,
  active,
  tone = "light",
  className = ""
}: {
  href: string;
  label: string;
  active: boolean;
  tone?: "light" | "dark";
  className?: string;
}) {
  const baseClassName =
    tone === "dark"
      ? `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(161,127,255,0.42)] ${
          active
            ? "border-[rgba(181,155,255,0.28)] bg-[linear-gradient(135deg,rgba(59,33,126,0.42),rgba(12,18,32,0.92))] text-[rgba(247,243,255,0.98)] shadow-[0_18px_42px_rgba(0,0,0,0.28)]"
            : "border-transparent text-[rgba(236,232,250,0.78)] hover:border-[rgba(181,155,255,0.18)] hover:bg-[rgba(56,31,120,0.18)] hover:text-white"
        }`
      : `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(161,127,255,0.28)] ${
          active
            ? "border-[rgba(122,87,239,0.2)] bg-[linear-gradient(135deg,rgba(103,48,218,0.12),rgba(125,70,243,0.08))] text-[#2d174d] shadow-[0_10px_24px_rgba(73,35,170,0.1)]"
            : "border-transparent text-slate-600 hover:bg-[rgba(103,48,218,0.08)] hover:text-[#2d174d]"
        }`;

  return (
    <Link
      href={href}
      className={`${baseClassName} ${className}`.trim()}
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
  minimalNavigation = false,
  brandVariant = "default",
  brandScale = "landing",
  tone = "light"
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
    ? { href: "/projects", label: "Project Board" }
    : { href: "/auth", label: "Sign in" };
  const showAccountButton =
    accountButton.href !== ctaHref || accountButton.label !== ctaLabel;
  const showAvatarButton = isAuthenticated;
  const ctaClassName =
    ctaLabel === "Start your build" ||
    ctaLabel === "Open Strategy Room" ||
    ctaHref === "/start" ||
    ctaHref === APP_ROUTES.roadmap
      ? "button-primary px-5 py-2.5 text-sm"
      : "button-secondary px-5 py-2.5 text-sm";
  const homeNavItem = mainNavItems.find((item) => item.label === "Home");
  const resolvedHomeHref = homeNavItem?.href ?? "/";
  const homeActive = pathname === resolvedHomeHref;
  const homeAccentClassName =
    tone === "dark" ? "!text-[#d5c6ff] hover:!text-[#f3edff]" : "";
  const projectBoardAccentClassName =
    isAuthenticated
      ? "!text-[#d5c6ff] hover:!text-[#f3edff]"
      : "";
  const logoLinkClassName = `neroa-brand-link neroa-site-header-brand-link ${
    brandVariant === "prominent" ? "neroa-brand-link-prominent" : ""
  }`;
  const logoClassName = `neroa-site-header-logo ${
    brandVariant === "prominent" ? "neroa-site-header-logo-prominent" : ""
  } ${brandScale === "landing" ? "neroa-site-header-logo-landing" : ""}`.trim();
  const minimalNavClassName = `floating-nav neroa-nav-pane mx-auto flex w-full max-w-[56rem] flex-wrap items-center justify-center gap-2.5 rounded-[28px] px-3 py-2.5 sm:px-4 lg:gap-3 lg:px-5 lg:py-[1.640625rem]`;

  const homeLink = homeNavItem ? (
    <HeaderLink
      href={resolvedHomeHref}
      label={homeNavItem.label}
      active={homeActive}
      tone={tone}
      className={homeAccentClassName}
    />
  ) : null;

  const accountLink = showAccountButton ? (
    <Link
      className={`button-quiet px-4 py-2.5 text-sm ${projectBoardAccentClassName}`.trim()}
      href={accountButton.href}
      prefetch
    >
      {accountButton.label}
    </Link>
  ) : null;

  const primaryCtaLink = (
    <Link className={ctaClassName} href={ctaHref} prefetch>
      {ctaLabel}
    </Link>
  );

  return (
    <header className="shell sticky top-0 z-40 pt-0 pb-3">
      <div className="neroa-header-row">
        <Link href="/" className={logoLinkClassName} aria-label="NEROA home">
          <Logo
            variant={brandVariant}
            tone={tone}
            presentation="header"
            scale={brandScale}
            className={logoClassName}
          />
        </Link>

        {minimalNavigation ? (
          <div className={minimalNavClassName}>
            <nav className="flex w-full flex-wrap items-center justify-evenly gap-2.5 lg:flex-nowrap lg:gap-3">
              {primaryCtaLink}
              {homeLink}
              {accountLink}
              {showSiteNav ? <SiteNav authenticated={isAuthenticated} tone={tone} /> : null}
              {showAvatarButton ? (
                <PublicAccountMenu initialEmail={resolvedEmail ?? undefined} tone={tone} />
              ) : null}
            </nav>
          </div>
        ) : (
          <div className="floating-nav neroa-nav-pane mx-auto flex w-full max-w-[56rem] flex-wrap items-center justify-between gap-2.5 rounded-[28px] px-3 py-2.5 sm:px-4 lg:flex-nowrap lg:gap-3 lg:px-5 lg:py-[1.640625rem]">
            <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2.5 lg:justify-start lg:gap-3">
              {primaryCtaLink}
            </nav>

            <div className="flex min-w-0 flex-wrap items-center justify-center gap-2.5 lg:justify-end">
              {homeLink}
              {accountLink}
              {showSiteNav ? <SiteNav authenticated={isAuthenticated} tone={tone} /> : null}
              {showAvatarButton ? (
                <PublicAccountMenu initialEmail={resolvedEmail ?? undefined} tone={tone} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
