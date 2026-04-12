export type WorkerId = "vector" | "axiom" | "forge" | "anchor";

export type ProviderId = "openai" | "anthropic" | "codex" | "github";

export type AIChatRequest = {
  workerId: WorkerId;
  message: string;
  context?: string;
};

export type AIChatResponse = {
  ok: true;
  worker: {
    id: WorkerId;
    name: string;
    provider: ProviderId;
    role: string;
  };
  reply: string;
};

export type WorkerConfig = {
  id: WorkerId;
  name: string;
  provider: ProviderId;
  role: string;
  systemPrompt: string;
};
