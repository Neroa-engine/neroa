import { useId } from "react";

type NeroaLogoProps = {
  className?: string;
  showWordmark?: boolean;
  iconOnly?: boolean;
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function FullIcon({ gradientId, glowId }: { gradientId: string; glowId: string }) {
  return (
    <>
      <g filter={`url(#${glowId})`}>
        <path
          d="M98 42V176"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M244 42V178"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M98 42L146 104"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M98 176L146 104"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M146 104L150 140"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M98 176L150 140"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M194 84L244 42"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M194 84V126"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M194 126L244 42"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M194 126L244 178"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M98 42C128 62 156 90 188 126C208 148 226 165 244 178"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M146 104C168 126 191 149 216 168C228 176 238 180 244 182"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      <circle cx="98" cy="42" r="15" fill="#CFFAFE" />
      <circle cx="98" cy="176" r="17" fill="#5B8CFF" />
      <circle cx="146" cy="104" r="14" fill="#73C4FF" />
      <circle cx="150" cy="140" r="9" fill="#6E8CFF" />
      <circle cx="194" cy="84" r="10" fill="#79CCFF" />
      <circle cx="208" cy="132" r="14" fill="#A764FF" />
      <circle cx="244" cy="42" r="15" fill="#CFFAFE" />
      <circle cx="244" cy="182" r="14" fill="#B15CFF" />
    </>
  );
}

function IconMark({ gradientId }: { gradientId: string }) {
  return (
    <>
        <path
          d="M102 50V168"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M238 50V170"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M102 50C130 68 156 94 186 130C206 151 223 164 238 170"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M146 102C168 124 190 148 214 166C226 174 235 178 238 180"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

      <circle cx="102" cy="50" r="13" fill="#CFFAFE" />
      <circle cx="102" cy="168" r="14" fill="#5B8CFF" />
      <circle cx="238" cy="50" r="13" fill="#CFFAFE" />
      <circle cx="238" cy="176" r="14" fill="#B15CFF" />
    </>
  );
}

function Wordmark() {
  return (
    <text
      x="170"
      y="262"
      fill="#F8FAFC"
      fontSize="48"
      fontWeight="500"
      letterSpacing="0.2em"
      textAnchor="middle"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      NEROA
    </text>
  );
}

export default function NeroaLogo({
  className,
  showWordmark = true,
  iconOnly = false
}: NeroaLogoProps) {
  const id = useId();
  const gradientId = `${id}-neroa-gradient`;
  const glowId = `${id}-neroa-glow`;
  const shouldShowWordmark = showWordmark && !iconOnly;

  return (
    <svg
      viewBox="0 0 340 300"
      className={joinClasses("block", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Neroa logo"
      role="img"
    >
      <defs>
        <linearGradient id={gradientId} x1="98" y1="42" x2="244" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="38%" stopColor="#60A5FA" />
          <stop offset="72%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <filter id={glowId} x="76" y="24" width="188" height="180" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.75" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {iconOnly ? <IconMark gradientId={gradientId} /> : <FullIcon gradientId={gradientId} glowId={glowId} />}
      {shouldShowWordmark ? <Wordmark /> : null}
    </svg>
  );
}
