"use client";

type LogoProps = {
  variant?: "default" | "prominent";
};

const APPROVED_PUBLIC_LOGO_SRC = "/logo/neroa.png?v=approved-blue-lockup-20260412";

export function Logo({ variant = "default" }: LogoProps) {
  const prominent = variant === "prominent";

  return (
    <div className="relative shrink-0">
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.1),rgba(139,92,246,0.07),transparent_70%)] blur-2xl ${
          prominent ? "scale-[1.04]" : "scale-[1.01]"
        }`}
      />

      <img
        src={APPROVED_PUBLIC_LOGO_SRC}
        alt="NEROA"
        className={`relative block h-auto w-auto select-none ${
          prominent ? "max-h-[54px] sm:max-h-[60px] lg:max-h-[64px]" : "max-h-[42px] sm:max-h-[48px]"
        } drop-shadow-[0_10px_24px_rgba(99,102,241,0.12)]`}
        draggable={false}
      />
    </div>
  );
}
