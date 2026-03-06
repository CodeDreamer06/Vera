import { type NextRequest, NextResponse } from "next/server";

import { detectPlantDiseaseFromImage } from "@/lib/ml/plantDisease";
import { DiseaseMlRequestSchema, DiseaseMlResponseSchema } from "@/types/ml";

export const runtime = "nodejs";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = DiseaseMlRequestSchema.parse(body);

    const result = await detectPlantDiseaseFromImage(
      parsed.imageDataUrlOrBlobKey,
    );

    return NextResponse.json(DiseaseMlResponseSchema.parse(result));
  } catch (error) {
    console.error("[ML disease route error]", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        label: "Request Invalid",
        confidence: 0,
        explanation:
          "The request payload is invalid for disease inference. Please upload a valid image and retry.",
        treatmentPlan: [
          "Capture a clear image with the affected leaf centered",
          "Retry analysis with a single image per request",
        ],
        safetyWarnings: [
          "Avoid treatment decisions from failed requests",
          "Verify symptoms manually before intervention",
        ],
        topPredictions: [],
        engine: "fallback",
      },
      { status: 400 },
    );
  }
};
