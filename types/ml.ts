import { z } from "zod";

export const DiseaseMlRequestSchema = z.object({
  plantId: z.string(),
  imageDataUrlOrBlobKey: z.string().min(1),
  imageMeta: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      size: z.number().optional(),
      type: z.string().optional(),
    })
    .optional(),
});

export const DiseaseMlResponseSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  treatmentPlan: z.array(z.string()),
  safetyWarnings: z.array(z.string()),
  topPredictions: z.array(
    z.object({
      label: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  ),
  engine: z.enum(["ml-tflite", "fallback"]),
});

export type DiseaseMlRequest = z.infer<typeof DiseaseMlRequestSchema>;
export type DiseaseMlResponse = z.infer<typeof DiseaseMlResponseSchema>;
