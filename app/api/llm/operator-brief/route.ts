import type { NextRequest } from "next/server";

import { fallbackResponses } from "@/lib/llm/fallback";
import { prompts } from "@/lib/llm/prompts";
import { handleLlmRoute } from "@/lib/llm/routeUtils";
import {
  OperatorBriefRequestSchema,
  OperatorBriefResponseSchema,
} from "@/types/llm";

export const POST = async (request: NextRequest) =>
  handleLlmRoute({
    request,
    requestSchema: OperatorBriefRequestSchema,
    responseSchema: OperatorBriefResponseSchema,
    prompt: (parsed) => ({
      system: prompts.operatorBrief({
        outputLanguage: parsed.outputLanguage,
        locationContext: parsed.locationContext,
      }),
      user: JSON.stringify(parsed),
    }),
    fallback: fallbackResponses.operatorBrief,
  });
