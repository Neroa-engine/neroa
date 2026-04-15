"use client";

type GuidedModeToggleProps = {
  guidedMode: boolean;
  onToggle: (next: boolean) => void;
  className?: string;
  compact?: boolean;
};

export function GuidedModeToggle({
  guidedMode,
  onToggle,
  className = "",
  compact = false
}: GuidedModeToggleProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-[22px] border border-slate-200/75 bg-white/82 ${
        compact ? "px-3.5 py-3" : "px-4 py-3"
      } ${className}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">Guided mode</p>
        <p className={`mt-1 ${compact ? "text-xs leading-5" : "text-sm leading-6"} text-slate-500`}>
          {compact
            ? "Let Naroa react to the current step, or keep things quiet."
            : "Keep Naroa synchronized with the UI, or switch to self mode for quiet exploration."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={guidedMode}
        onClick={() => onToggle(!guidedMode)}
        className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full border transition ${
          guidedMode
            ? "border-cyan-300/45 bg-[linear-gradient(135deg,rgba(34,211,238,0.88),rgba(139,92,246,0.86))]"
            : "border-slate-200/80 bg-slate-100/90"
        }`}
      >
        <span
          className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white text-[10px] font-semibold text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition ${
            guidedMode ? "translate-x-[26px]" : "translate-x-[3px]"
          }`}
        >
          {guidedMode ? "On" : "Off"}
        </span>
      </button>
    </div>
  );
}
