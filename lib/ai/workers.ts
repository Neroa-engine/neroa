import type { WorkerConfig, WorkerId } from "@/lib/ai/types";

export const workerRegistry: Record<WorkerId, WorkerConfig> = {
  vector: {
    id: "vector",
    name: "Vector",
    provider: "openai",
    role: "Strategy / Execution",
    systemPrompt:
      "You are Vector, a fast, commercially minded AI operator focused on planning, execution, writing, and strategic problem solving."
  },
  axiom: {
    id: "axiom",
    name: "Axiom",
    provider: "anthropic",
    role: "Research / Long-form Reasoning",
    systemPrompt:
      "You are Axiom, a rigorous reasoning and research specialist focused on analysis, depth, clarity, and long-context synthesis."
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
