"use client";

type LogoProps = {
  variant?: "default" | "prominent";
};

const APPROVED_PUBLIC_LOGO_SRC = "/logo/neroa.png?v=approved-blue-lockup-20260412";

export function Logo({ variant = "default" }: LogoProps) {
  const prominent = variant === "prominent";

  return (
    <img
      src={APPROVED_PUBLIC_LOGO_SRC}
      alt="NEROA"
      className={`block h-auto w-auto shrink-0 select-none ${
        prominent ? "max-h-[54px] sm:max-h-[60px] lg:max-h-[64px]" : "max-h-[42px] sm:max-h-[48px]"
      } drop-shadow-[0_8px_18px_rgba(59,130,246,0.08)]`}
      draggable={false}
    />
  );
}
