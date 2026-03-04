import type { NextRequest } from "next/server";

import { fallbackResponses } from "@/lib/llm/fallback";
import { prompts } from "@/lib/llm/prompts";
import { handleLlmRoute } from "@/lib/llm/routeUtils";
import { PersonaRequestSchema, PersonaResponseSchema } from "@/types/llm";

export const POST = async (request: NextRequest) =>
  handleLlmRoute({
    request,
    requestSchema: PersonaRequestSchema,
    responseSchema: PersonaResponseSchema,
    prompt: (parsed) => ({
      system: prompts.persona({ tone: parsed.tone }),
      user: JSON.stringify(parsed),
    }),
    fallback: fallbackResponses.persona,
  });
