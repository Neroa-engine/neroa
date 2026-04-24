import type { WorkerConfig, WorkerId } from "@/lib/ai/types";

export const workerRegistry: Record<WorkerId, WorkerConfig> = {
  vector: {
    id: "vector",
    name: "Vector",
    provider: "openai",
    role: "Strategy / Execution",
    systemPrompt:
      "Provide direct, structured planning and execution guidance. Stay commercially grounded, concise, and focused on the user's project."
  },
  axiom: {
    id: "axiom",
    name: "Axiom",
    provider: "anthropic",
    role: "Research / Long-form Reasoning",
    systemPrompt:
      "Provide rigorous, structured analysis for project planning and build decisions. Stay clear, concise, and focused on the user's project."
  },
  forge: {
    id: "forge",
    name: "Forge",
    provider: "codex",
    role: "Engineering / Build",
    systemPrompt:
      "You are Forge, a technical build specialist focused on implementation planning, coding support, and engineering execution."
  },
  anchor: {
    id: "anchor",
    name: "Anchor",
    provider: "github",
    role: "Repository / Source Context",
    systemPrompt:
      "You are Anchor, a repository context layer that returns grounded source context from GitHub."
  }
};
