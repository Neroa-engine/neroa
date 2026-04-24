const APPROVED_LOGO_SRC = "/logo/neroa.png";

type LogoProps = {
  variant?: "default" | "prominent";
  tone?: "light" | "dark";
  presentation?: "default" | "header";
  scale?: "default" | "landing";
  className?: string;
};

export function Logo({
  variant = "default",
  tone = "light",
  presentation = "default",
  scale = "default",
  className = ""
}: LogoProps) {
  const prominent = variant === "prominent";
  const darkTone = tone === "dark";
  const headerPresentation = presentation === "header";
  const sizeClassName = headerPresentation
    ? prominent
      ? "neroa-logo-header-prominent"
      : "neroa-logo-header"
    : prominent
      ? "neroa-logo-prominent"
      : "neroa-logo-default";
  const scaleClassName =
    scale === "landing"
      ? headerPresentation
        ? prominent
          ? "neroa-logo-header-prominent-landing"
          : "neroa-logo-header-landing"
        : prominent
          ? "neroa-logo-prominent-landing"
          : "neroa-logo-default-landing"
      : "";
  const toneClassName = darkTone ? "neroa-logo-dark" : "neroa-logo-light";
  const imageClassName = `neroa-logo-mark block w-auto shrink-0 select-none ${sizeClassName} ${scaleClassName} ${toneClassName} ${className}`.trim();

  return (
    <img
      src={APPROVED_LOGO_SRC}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      loading="eager"
      className={imageClassName}
    />
  );
}
