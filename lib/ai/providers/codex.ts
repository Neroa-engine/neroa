import OpenAI from "openai";

type RunCodexInput = {
  systemPrompt: string;
  message: string;
  context?: string;
};

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const error = new Error("Missing OPENAI_API_KEY.") as Error & { status?: number };
    error.status = 500;
    throw error;
  }

  return new OpenAI({ apiKey });
}

export async function runCodex({ systemPrompt, message, context }: RunCodexInput) {
  const client = getClient();
  const input = context ? `${message}\n\nContext:\n${context}` : message;

  const response = await client.responses.create({
    model: "gpt-5-codex-mini",
    instructions: systemPrompt,
    input
  });

  const text = response.output_text?.trim();

  if (!text) {
    const error = new Error("Codex returned an empty response.") as Error & { status?: number };
    error.status = 502;
    throw error;
  }

  return text;
}
