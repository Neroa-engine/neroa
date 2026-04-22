import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { FocusBubbleProvider } from "@/components/marketing/focus-bubble-system";
import { SiteHeader } from "@/components/site-header";
import { PublicFooter } from "@/components/site/public-footer";
import { PublicHelpChat } from "@/components/support/public-help-chat";

function PageAtmosphere({
  variant
}: {
  variant: "marketing" | "board" | "lane";
}) {
  if (variant === "marketing") {
    return (
      <>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_48%)]" />
        <div className="pointer-events-none absolute right-[-10rem] top-[9rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_58%)] blur-3xl" />
        <div className="pointer-events-none absolute left-[-8rem] top-[34rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.12),transparent_58%)] blur-3xl" />
      </>
    );
  }

  if (variant === "board") {
    return (
      <>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_54%)]" />
        <div className="pointer-events-none absolute right-[-10rem] top-[7rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18),transparent_58%)] blur-3xl" />
        <div className="pointer-events-none absolute left-[-8rem] top-[28rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.14),transparent_58%)] blur-3xl" />
      </>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_56%)]" />
      <div className="pointer-events-none absolute left-[-10rem] top-[10rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16),transparent_58%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-[22rem] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.12),transparent_58%)] blur-3xl" />
    </>
  );
}

export function MarketingInfoShell({
  userEmail,
  ctaHref,
  ctaLabel,
  brandVariant = "prominent",
  contentWidth = "default",
  showHelpChat = true,
  children
}: {
  userEmail?: string;
  ctaHref: string;
  ctaLabel: string;
  brandVariant?: "default" | "prominent";
  contentWidth?: "default" | "wide";
  showHelpChat?: boolean;
  children: ReactNode;
}) {
  const contentShellClassName =
    contentWidth === "wide"
      ? "relative mx-auto w-full max-w-[1880px] px-4 pt-4 sm:px-6 lg:px-10 lg:pt-8 xl:px-12"
      : "shell relative pt-4 lg:pt-8";

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden text-slate-900">
      <PageAtmosphere variant="marketing" />
      <SiteHeader
        userEmail={userEmail}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        showSiteNav
        brandVariant={brandVariant}
      />
      <FocusBubbleProvider>
        <div className={contentShellClassName}>{children}</div>
      </FocusBubbleProvider>
      <PublicFooter />
      {showHelpChat ? <PublicHelpChat /> : null}
    </main>
  );
}

export function DashboardBoardShell({
  userEmail,
  ctaHref,
  ctaLabel,
  commandCenterPath,
  children
}: {
  userEmail?: string;
  ctaHref: string;
  ctaLabel: string;
  commandCenterPath?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden pb-16 text-slate-900">
      <PageAtmosphere variant="board" />
      <SiteHeader userEmail={userEmail} ctaHref={ctaHref} ctaLabel={ctaLabel} showSiteNav />
      <section className="shell relative">
        {commandCenterPath ? (
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="hidden xl:block">
              <AccountNav currentPath={commandCenterPath} />
            </div>
            <div className="space-y-4">
              <div className="xl:hidden">
                <AccountNav currentPath={commandCenterPath} compact />
              </div>
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </section>
    </main>
  );
}

export function LaneWorkspaceShell({
  userEmail,
  ctaHref,
  ctaLabel,
  children
}: {
  userEmail?: string;
  ctaHref: string;
  ctaLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden pb-16 text-slate-900">
      <PageAtmosphere variant="lane" />
      <SiteHeader userEmail={userEmail} ctaHref={ctaHref} ctaLabel={ctaLabel} showSiteNav />
      <section className="relative mx-auto w-full max-w-[1880px] px-4 py-2 sm:px-6 xl:px-8">
        {children}
      </section>
    </main>
  );
}
