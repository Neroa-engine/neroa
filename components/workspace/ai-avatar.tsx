"use client";

type Provider = "chatgpt" | "claude" | "codex" | "github";

type AiAvatarProps = {
  provider: Provider;
  displayName: string;
  avatarSeed: string;
};

const avatarThemes = {
  chatgpt: {
    gradient: "from-cyan-300 via-sky-400 to-blue-500",
    glow: "shadow-[0_0_40px_rgba(56,189,248,0.35)]",
    ring: "border-cyan-200/20",
    accent: "text-cyan-50"
  },
  claude: {
    gradient: "from-fuchsia-300 via-violet-400 to-purple-500",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.32)]",
    ring: "border-fuchsia-200/20",
    accent: "text-fuchsia-50"
  },
  codex: {
    gradient: "from-sky-300 via-blue-400 to-indigo-500",
    glow: "shadow-[0_0_40px_rgba(96,165,250,0.32)]",
    ring: "border-sky-200/20",
    accent: "text-sky-50"
  },
  github: {
    gradient: "from-slate-200 via-slate-400 to-slate-600",
    glow: "shadow-[0_0_40px_rgba(148,163,184,0.22)]",
    ring: "border-slate-200/15",
    accent: "text-white"
  }
} as const;

function getGlyph(provider: Provider) {
  switch (provider) {
    case "chatgpt":
      return "*";
    case "claude":
      return "O";
    case "codex":
      return "</>";
    case "github":
      return "GH";
  }
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AiAvatar({ provider, displayName, avatarSeed }: AiAvatarProps) {
  const theme = avatarThemes[provider];
  const seedValue = avatarSeed.length % 3;
  const avatarText =
    provider === "codex" || provider === "github"
      ? getGlyph(provider)
      : getInitials(displayName);

  return (
    <div className="relative">
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.gradient} opacity-30 blur-xl`} />
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border ${theme.ring} bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] backdrop-blur-md ${theme.glow}`}
      >
        <div
          className={`relative flex h-[3.35rem] w-[3.35rem] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${theme.gradient} ${theme.accent}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.35),transparent_36%)]" />
          <div
            className={`absolute bottom-0 left-0 right-0 h-6 ${
              seedValue === 0
                ? "bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.12))]"
                : seedValue === 1
                  ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_70%)]"
                  : "bg-[linear-gradient(90deg,rgba(255,255,255,0.08),transparent,rgba(255,255,255,0.08))]"
            }`}
          />
          <span className={`relative z-10 font-semibold tracking-[0.08em] ${provider === "codex" ? "text-[11px]" : "text-base"}`}>
            {avatarText}
          </span>
        </div>
      </div>
      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#070d19] text-[10px] text-white/70">
        {provider === "chatgpt" || provider === "claude" ? getGlyph(provider) : provider === "codex" ? "C" : "G"}
      </div>
    </div>
  );
}
