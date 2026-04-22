import Link from "next/link";
import { Logo } from "@/components/logo";

type FrontDoorHeaderProps = {
  userEmail?: string;
  ctaHref: string;
  ctaLabel: string;
};

export function FrontDoorHeader({
  userEmail,
  ctaHref,
  ctaLabel
}: FrontDoorHeaderProps) {
  return (
    <header className="shell py-6">
      <div className="panel flex items-center justify-between px-5 py-4">
        <Logo />
        <div className="flex items-center gap-3">
          {userEmail ? (
            <span className="hidden text-sm text-slate-500 sm:inline">{userEmail}</span>
          ) : null}
          <Link className="button-secondary" href={ctaHref}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
