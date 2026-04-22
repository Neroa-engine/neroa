export type AgentId =
  | "narua"
  | "forge"
  | "atlas"
  | "repolink"
  | "nova"
  | "pulse"
  | "ops";

export const AGENTS = {
  narua: {
    name: "Neroa",
    role: "Core Orchestrator",
    src: "/avatars/narua.png",
    color: "#35D6FF",
    motion: "pulse",
  },
  forge: {
    name: "Forge",
    role: "Build Execution",
    src: "/avatars/forge.png",
    color: "#60A5FA",
    motion: "build",
  },
  atlas: {
    name: "Atlas",
    role: "Strategy and Architecture",
    src: "/avatars/atlas.png",
    color: "#A78BFA",
    motion: "orbit",
  },
  repolink: {
    name: "RepoLink",
    role: "GitHub and Repositories",
    src: "/avatars/repolink.png",
    color: "#22D3EE",
    motion: "flow",
  },
  nova: {
    name: "Nova",
    role: "Design and Content",
    src: "/avatars/nova.png",
    color: "#E879F9",
    motion: "bloom",
  },
  pulse: {
    name: "Pulse",
    role: "Testing and Feedback",
    src: "/avatars/pulse.png",
    color: "#F472B6",
    motion: "wave",
  },
  ops: {
    name: "Ops",
    role: "Launch Operations",
    src: "/avatars/ops.png",
    color: "#67E8F9",
    motion: "loop",
  },
} as const;

export type AgentConfig = (typeof AGENTS)[AgentId];
