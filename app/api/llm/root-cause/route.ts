import type { NextRequest } from "next/server";

import { fallbackResponses } from "@/lib/llm/fallback";
import { prompts } from "@/lib/llm/prompts";
import { handleLlmRoute } from "@/lib/llm/routeUtils";
import { RootCauseRequestSchema, RootCauseResponseSchema } from "@/types/llm";

export const POST = async (request: NextRequest) =>
  handleLlmRoute({
    request,
    requestSchema: RootCauseRequestSchema,
    responseSchema: RootCauseResponseSchema,
    prompt: (parsed) => ({
      system: prompts.rootCause(),
      user: JSON.stringify(parsed),
    }),
    fallback: fallbackResponses.rootCause,
  });
