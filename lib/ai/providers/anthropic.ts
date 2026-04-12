import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function runAnthropic(args: {
  systemPrompt: string;
  message: string;
  context?: unknown;
}) {
  console.log("RUN_ANTHROPIC_CALLED", {
    hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
    message: args.message,
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 120,
    system: args.systemPrompt,
    messages: [
      {
        role: "user",
        content: `${args.message}\n\nRespond clearly and concisely.`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return text;
}
