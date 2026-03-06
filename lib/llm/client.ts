import type { z } from "zod";

const baseUrl = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
const apiKey = process.env.OPENAI_API_KEY ?? "";
const model = process.env.LLM_MODEL ?? "gpt-4.1-mini";

export const shouldMockLlm = () =>
  process.env.MOCK_LLM === "1" || process.env.NEXT_PUBLIC_MOCK_LLM === "1";

const parseJsonFromContent = (content: string) => {
  try {
    return JSON.parse(content);
  } catch {
    // Some providers wrap JSON in markdown fences or extra prose.
  }

  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  if (fenced) {
    try {
      return JSON.parse(fenced);
    } catch {
      // Continue to generic extraction fallback.
    }
  }

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = content.slice(firstBrace, lastBrace + 1);
    return JSON.parse(candidate);
  }

  throw new Error("llm-invalid-json");
};

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

  const parsed = parseJsonFromContent(content);

  return params.schema.parse(parsed);
};
