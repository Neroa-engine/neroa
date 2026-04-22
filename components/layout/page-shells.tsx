import type { ReactNode } from "react";
import { FrontDoorHeader } from "@/components/front-door/front-door-header";

export function MarketingInfoShell({
  userEmail,
  ctaHref,
  ctaLabel,
  contentWidth = "default",
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
    <main className="homepage-root relative isolate min-h-screen overflow-x-hidden text-white">
      <div className="homepage-atmosphere homepage-atmosphere-cyan" />
      <div className="homepage-atmosphere homepage-atmosphere-violet" />
      <div className="homepage-atmosphere homepage-atmosphere-blue" />
      <FrontDoorHeader userEmail={userEmail} ctaHref={ctaHref} ctaLabel={ctaLabel} />
      <div className={contentShellClassName}>{children}</div>
    </main>
  );
}
