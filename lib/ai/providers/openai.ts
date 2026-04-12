import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runOpenAI(args: {
  systemPrompt: string;
  message: string;
  context?: unknown;
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await client.responses.create({
    model: "gpt-5.4",
    input: `${args.systemPrompt}\n\nUser: ${args.message}\n\nRespond clearly and concisely.`,
    max_output_tokens: 120,
  });

  return response.output_text ?? "";
}
