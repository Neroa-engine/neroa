"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type NeroaPublicNavigationProps = {
  readonly currentPath?:
    | "/neroa"
    | "/neroa/pricing"
    | "/neroa/diy-vs-managed"
    | "/neroa/blog"
    | "/neroa/contact"
    | "/neroa/auth";
  readonly initialSignedIn?: boolean;
  readonly showContactLink?: boolean;
};

type NeroaPublicNavigationLink = {
  href: string;
  label: string;
};

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

export function getNeroaPublicNavigationLinks(args?: {
  isSignedIn?: boolean;
  showContactLink?: boolean;
}): readonly NeroaPublicNavigationLink[] {
  const isSignedIn = args?.isSignedIn ?? false;
  const showContactLink = args?.showContactLink ?? true;
  const baseLinks: NeroaPublicNavigationLink[] = [
    {
      href: "/neroa",
      label: "Home"
    },
    {
      href: "/neroa/pricing",
      label: "Pricing"
    },
    {
      href: "/neroa/diy-vs-managed",
      label: "DIY vs Managed"
    },
    {
      href: "/neroa/blog",
      label: "Blog"
    }
  ];

  if (showContactLink) {
    baseLinks.push({
      href: "/neroa/contact",
      label: "Contact"
    });
  }

  if (isSignedIn) {
    return [
      ...baseLinks,
      {
        href: "/neroa/account",
        label: "Account Portal"
      },
      {
        href: "/neroa/project",
        label: "Project Portal"
      }
    ] as const;
  }

  return [
    ...baseLinks,
    {
      href: "/neroa/auth",
      label: "Sign In"
    }
  ] as const;
}

export function NeroaPublicNavigation({
  currentPath,
  initialSignedIn = false,
  showContactLink = true
}: NeroaPublicNavigationProps) {
  const [isSignedIn, setIsSignedIn] = useState(initialSignedIn);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    async function syncSessionState() {
      const { data, error } = await supabase.auth.getSession();

      if (!active || error) {
        return;
      }

      setIsSignedIn(Boolean(data.session));
    }

    void syncSessionState();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsSignedIn(Boolean(session));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const links = getNeroaPublicNavigationLinks({
    isSignedIn,
    showContactLink
  });

  return (
    <nav
      aria-label="Neroa public navigation"
      className="hidden items-center gap-8 text-sm uppercase tracking-[0.18em] text-white/62 md:flex"
    >
      {links.map((link) => {
        const isCurrent = currentPath === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent ? "page" : undefined}
            className={isCurrent ? "text-teal-100 transition hover:text-white" : "transition hover:text-white"}
          >
            {link.label}
          </Link>
        );
      })}

      {!isSignedIn ? (
        <Link
          href="/neroa/pricing"
          className="inline-flex items-center rounded-full border border-teal-300/45 bg-teal-300/10 px-5 py-3 text-white shadow-[0_0_28px_rgba(45,212,191,0.12)] transition hover:border-teal-200/70 hover:bg-teal-300/16"
        >
          Start Your Project
        </Link>
      ) : null}
    </nav>
  );
}
