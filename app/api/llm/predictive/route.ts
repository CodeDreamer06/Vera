import type { NextRequest } from "next/server";

import { fallbackResponses } from "@/lib/llm/fallback";
import { prompts } from "@/lib/llm/prompts";
import { handleLlmRoute } from "@/lib/llm/routeUtils";
import { PredictiveRequestSchema, PredictiveResponseSchema } from "@/types/llm";

export const POST = async (request: NextRequest) =>
  handleLlmRoute({
    request,
    requestSchema: PredictiveRequestSchema,
    responseSchema: PredictiveResponseSchema,
    prompt: (parsed) => ({
      system: prompts.predictive({
        outputLanguage: parsed.outputLanguage,
        locationContext: parsed.locationContext,
      }),
      user: JSON.stringify(parsed),
    }),
    fallback: fallbackResponses.predictive,
  });
