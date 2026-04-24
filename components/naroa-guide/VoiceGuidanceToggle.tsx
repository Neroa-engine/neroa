"use client";

type VoiceGuidanceToggleProps = {
  enabled: boolean;
  supported: boolean;
  onToggle: (next: boolean) => void;
  compact?: boolean;
};

export function VoiceGuidanceToggle({
  enabled,
  supported,
  onToggle,
  compact = false
}: VoiceGuidanceToggleProps) {
  return (
    <label className={`flex items-center justify-between gap-3 rounded-[22px] border border-slate-200/75 bg-white/82 ${compact ? "px-3.5 py-3" : "px-4 py-3"}`}>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">Enable voice guidance</p>
        <p className={`mt-1 ${compact ? "text-xs leading-5" : "text-sm leading-6"} text-slate-500`}>
          {compact
            ? "Optional short spoken summaries. Off by default."
            : "Optional short spoken summaries using your browser. Voice stays off unless you turn it on."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => supported && onToggle(!enabled)}
        disabled={!supported}
        className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full border transition ${
          enabled
            ? "border-[rgba(167,136,250,0.45)] bg-[linear-gradient(135deg,rgba(143,124,255,0.9),rgba(167,136,250,0.88),rgba(193,156,255,0.84))]"
            : "border-slate-200/80 bg-slate-100/90"
        } ${supported ? "" : "cursor-not-allowed opacity-50"}`}
      >
        <span
          className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white text-[10px] font-semibold text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition ${
            enabled ? "translate-x-[26px]" : "translate-x-[3px]"
          }`}
        >
          {enabled ? "On" : "Off"}
        </span>
      </button>
    </label>
  );
}
