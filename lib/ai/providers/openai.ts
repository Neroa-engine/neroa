import {
  buildOpenAITextInput,
  createOpenAIClient,
  sanitizeOpenAIResponseRequest,
} from "./openai-request";

export async function runOpenAI(args: {
  systemPrompt: string;
  message: string;
  context?: unknown;
}) {
  const client = createOpenAIClient();

  const response = await client.responses.create(
    sanitizeOpenAIResponseRequest({
      model: "gpt-5.4",
      input: buildOpenAITextInput({
        systemPrompt: args.systemPrompt,
        message: args.message,
        context: args.context,
        closingInstruction: "Respond clearly and concisely.",
      }),
      max_output_tokens: 120,
    })
  );

  return response.output_text ?? "";
}
