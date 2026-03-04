import type { z } from "zod";

const baseUrl = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
const apiKey = process.env.OPENAI_API_KEY ?? "";
const model = process.env.LLM_MODEL ?? "gpt-4.1-mini";

export const shouldMockLlm = () => process.env.NEXT_PUBLIC_MOCK_LLM === "1";

export const callLlmJson = async <T>(params: {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
}) => {
  if (shouldMockLlm()) {
    throw new Error("mock-llm-enabled");
  }

  if (!apiKey) {
    throw new Error("missing-openai-api-key");
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`llm-http-${res.status}: ${body}`);
  }

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("llm-empty-response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("llm-invalid-json");
  }

  return params.schema.parse(parsed);
};
