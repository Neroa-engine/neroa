"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { PublicAccountMenu } from "@/components/site/public-account-menu";
import { PublicActionLink } from "@/components/site/public-action-link";
import { SiteNav } from "@/components/site/site-nav";
import { mainNavItems } from "@/lib/data/site-nav";
import { APP_ROUTES, isPricingPath } from "@/lib/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SiteHeaderProps = {
  userEmail?: string;
  ctaHref: string;
  ctaLabel: string;
  showSiteNav?: boolean;
  brandVariant?: "default" | "prominent";
};

function HeaderLink({
  href,
  label,
  active,
  forceHardNavigation = false
}: {
  href: string;
  label: string;
  active: boolean;
  forceHardNavigation?: boolean;
}) {
  const className = `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
    active
      ? "bg-white/82 text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
      : "text-slate-600 hover:bg-white/72 hover:text-slate-950"
  }`;

  if (forceHardNavigation) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
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
  const utilityButtons = isAuthenticated
    ? [
        { href: APP_ROUTES.projectsResume, label: "Resume Project" },
        { href: APP_ROUTES.projects, label: "Projects" }
      ]
    : [{ href: APP_ROUTES.auth, label: "Sign in" }];
  const visibleUtilityButtons = utilityButtons.filter(
    (button) => button.href !== ctaHref || button.label !== ctaLabel
  );
  const forceHardNavigation = pathname.startsWith("/start");
  const ctaClassName =
    ctaLabel === "Start a project" ||
    ctaLabel === "Start with NEROA" ||
    ctaHref === APP_ROUTES.roadmap ||
    ctaHref === "/#intake-chat" ||
    ctaHref === APP_ROUTES.start
      ? "button-primary text-sm shadow-[0_20px_48px_rgba(59,130,246,0.28)]"
      : "button-secondary";
  const brandAnchorClassName =
    brandVariant === "prominent" ? "-ml-3 sm:-ml-4 lg:-ml-5" : "-ml-1 sm:-ml-2";

  return (
    <header className="shell sticky top-0 z-40 py-3">
      <div className="floating-nav flex flex-wrap items-center justify-between gap-4 rounded-[30px] px-4 py-3 sm:px-5 lg:px-6">
        {forceHardNavigation ? (
          <a href="/" className={`relative z-10 flex-shrink-0 ${brandAnchorClassName}`}>
            <Logo variant={brandVariant} />
          </a>
        ) : (
          <Link href="/" className={`relative z-10 flex-shrink-0 ${brandAnchorClassName}`}>
            <Logo variant={brandVariant} />
          </Link>
        )}

        <nav className="hidden items-center gap-1 lg:flex">
          {mainNavItems.map((item) => {
            const active = item.href.includes("#")
              ? false
              : item.href === APP_ROUTES.pricing
                ? isPricingPath(pathname)
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <HeaderLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={active}
                forceHardNavigation={forceHardNavigation}
              />
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2.5">
          {showSiteNav ? <SiteNav authenticated={isAuthenticated} /> : null}
          <PublicAccountMenu initialEmail={resolvedEmail ?? undefined} />
          {visibleUtilityButtons.map((button) =>
            forceHardNavigation ? (
              <a key={button.href} className="button-quiet px-4 py-3 text-sm" href={button.href}>
                {button.label}
              </a>
            ) : (
              <Link
                key={button.href}
                className="button-quiet px-4 py-3 text-sm"
                href={button.href}
                prefetch
              >
                {button.label}
              </Link>
            )
          )}
          <PublicActionLink
            className={ctaClassName}
            href={ctaHref}
            label={ctaLabel}
            prefetch
            forceHardNavigation={forceHardNavigation}
            initialAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </header>
  );
}
