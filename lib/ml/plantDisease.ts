import { z } from "zod";

import { callLlmJsonWithImage } from "@/lib/llm/client";
import type { DiseaseMlResponse } from "@/types/ml";

const clampConfidence = (value: number) => Math.max(0, Math.min(1, value));

const toTitleCase = (text: string) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase() + chunk.slice(1))
    .join(" ");

const DiseaseVisionSchema = z.object({
  label: z.string().min(1),
  confidence: z.number().min(0).max(1),
  explanation: z.string().min(1),
  treatmentPlan: z.array(z.string().min(1)).min(1).max(6),
  safetyWarnings: z.array(z.string().min(1)).min(1).max(6),
  topPredictions: z
    .array(
      z.object({
        label: z.string().min(1),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(5)
    .optional(),
});

const fallbackResponse = (reason: string): DiseaseMlResponse => ({
  label: "Analysis Unavailable",
  confidence: 0,
  explanation: `Disease triage could not complete (${reason}). Please retry with a clear close-up leaf image.`,
  treatmentPlan: [
    "Retake one focused image of the most affected leaf",
    "Inspect both top and underside of leaves before treatment",
    "Temporarily isolate visibly affected plants",
  ],
  safetyWarnings: [
    "Do not apply pesticide until diagnosis is confirmed",
    "Use gloves and sanitize tools between plants",
  ],
  topPredictions: [],
  engine: "fallback",
});

export const detectPlantDiseaseFromImage = async (
  imageDataUrlOrBlobKey: string,
): Promise<DiseaseMlResponse> => {
  try {
    const result = await callLlmJsonWithImage({
      systemPrompt: `
You are an expert plant pathology triage assistant.
Analyze the uploaded plant leaf image and infer the most likely disease status.
Respond ONLY with valid JSON using this schema:
{
  "label": string,
  "confidence": number (0 to 1),
  "explanation": string,
  "treatmentPlan": string[],
  "safetyWarnings": string[],
  "topPredictions": [{"label": string, "confidence": number}]
}
Rules:
- Prefer concise, practical agronomy guidance.
- If image quality is poor, set label to "Unclear Sample" and confidence below 0.4.
- Keep treatmentPlan and safetyWarnings actionable and safe.
      `.trim(),
      userPrompt:
        "Diagnose the disease from this image. Return JSON only, no markdown.",
      imageDataUrl: imageDataUrlOrBlobKey,
      schema: DiseaseVisionSchema,
    });

    return {
      label: toTitleCase(result.label.trim().toLowerCase()),
      confidence: clampConfidence(Number(result.confidence) || 0),
      explanation: result.explanation.trim(),
      treatmentPlan: result.treatmentPlan.map((item) => item.trim()),
      safetyWarnings: result.safetyWarnings.map((item) => item.trim()),
      topPredictions: (result.topPredictions ?? []).map((item) => ({
        label: toTitleCase(item.label.trim().toLowerCase()),
        confidence: clampConfidence(Number(item.confidence) || 0),
      })),
      engine: "llm-vision",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("[Disease vision inference fallback]", { reason });
    return fallbackResponse(reason);
  }
};
