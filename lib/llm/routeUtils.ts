import { type NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { callLlmJson } from "@/lib/llm/client";
import {
  checkRateLimit,
  getCached,
  makeCacheKey,
  setCached,
} from "@/lib/llm/guard";

const clientId = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

export const handleLlmRoute = async <TReq, TRes>(params: {
  request: NextRequest;
  requestSchema: z.ZodSchema<TReq>;
  responseSchema: z.ZodSchema<TRes>;
  prompt: (parsed: TReq) => { system: string; user: string };
  fallback: () => TRes;
}) => {
  try {
    const rate = checkRateLimit(clientId(params.request));
    if (!rate.allowed) {
      return NextResponse.json(params.fallback(), {
        status: 429,
        headers: {
          "x-ratelimit-remaining": "0",
          "retry-after": String(
            rate.retryAt
              ? Math.max(1, Math.ceil((rate.retryAt - Date.now()) / 1000))
              : 60,
          ),
        },
      });
    }

    const body = await params.request.json();
    const parsed = params.requestSchema.parse(body);

    const prompt = params.prompt(parsed);
    const key = makeCacheKey({
      route: params.request.nextUrl.pathname,
      parsed,
    });
    const cached = getCached<TRes>(key);
    if (cached) {
      return NextResponse.json(cached);
    }

    const result = await callLlmJson({
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      schema: params.responseSchema,
    });

    setCached(key, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`[LLM route fallback] ${params.request.nextUrl.pathname}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(params.fallback());
  }
};
