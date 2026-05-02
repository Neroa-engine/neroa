type NeroaNorthStarAccentProps = {
  className?: string;
  testId?: string;
};

function NeroaNorthStarIcon({
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

export function NeroaNorthStarAccent({
  className = "",
  testId = "neroa-page-north-star-accent"
}: NeroaNorthStarAccentProps) {
  return (
    <div
      data-testid={testId}
      className={[
        "pointer-events-none absolute z-10 hidden text-teal-100/82 lg:block",
        className
      ].join(" ")}
    >
      <NeroaNorthStarIcon className="h-5 w-5 drop-shadow-[0_0_20px_rgba(148,255,236,0.38)]" />
    </div>
  );
}
