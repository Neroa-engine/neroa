"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  resolveCanonicalStartRoute,
  resolvePublicLaunchAction,
  resolvePublicLaunchIntent
} from "@/lib/data/public-launch";
import { storePublicEntryIntent } from "@/lib/front-door/public-entry-intent";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PublicActionLinkProps = {
  href: string;
  label: string;
  className: string;
  prefetch?: boolean;
  forceHardNavigation?: boolean;
  initialAuthenticated?: boolean;
  children?: ReactNode;
};

export function PublicActionLink({
  href,
  label,
  className,
  prefetch,
  forceHardNavigation = false,
  initialAuthenticated,
  children
}: PublicActionLinkProps) {
  const router = useRouter();
  const intent = resolvePublicLaunchIntent(label, href);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(initialAuthenticated);

  useEffect(() => {
    let active = true;

    try {
      const supabase = createSupabaseBrowserClient();

      void supabase.auth.getUser().then(({ data }) => {
        if (!active) {
          return;
        }

        setIsAuthenticated(Boolean(data.user));
      });

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) {
          return;
        }

        setIsAuthenticated(Boolean(session?.user));
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch {
      setIsAuthenticated(initialAuthenticated);

      return () => {
        active = false;
      };
    }
  }, [initialAuthenticated]);

  const resolvedAction = useMemo(
    () => resolvePublicLaunchAction(label, href, { authenticated: isAuthenticated }),
    [href, isAuthenticated, label]
  );
  const fallbackAction = useMemo(() => resolveCanonicalStartRoute(label, href), [href, label]);

  function handleClick() {
    if (intent) {
      storePublicEntryIntent(intent);
    }
  }

  async function handleNavigation(event: MouseEvent<HTMLAnchorElement>) {
    handleClick();

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    let authenticated = isAuthenticated;

    if (typeof authenticated !== "boolean") {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        authenticated = Boolean(data.user);
        setIsAuthenticated(authenticated);
      } catch {
        authenticated = false;
        setIsAuthenticated(false);
      }
    }

    const nextAction = resolvePublicLaunchAction(label, href, { authenticated });
    const targetHref = nextAction.href;

    if (forceHardNavigation) {
      window.location.assign(targetHref);
      return;
    }

    router.push(targetHref);
  }

  if (forceHardNavigation) {
    return (
      <a
        href={resolvedAction.href}
        className={className}
        onClick={handleNavigation}
      >
        {children ?? resolvedAction.label}
      </a>
    );
  }

  return (
    <Link
      href={resolvedAction.href || fallbackAction.href}
      className={className}
      prefetch={prefetch}
      onClick={handleNavigation}
    >
      {children ?? resolvedAction.label}
    </Link>
  );
}
