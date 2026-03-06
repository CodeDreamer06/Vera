import { z } from "zod";

const localeFields = {
  outputLanguage: z.string().optional(),
  locationContext: z.string().optional(),
};

export const PersonaRequestSchema = z.object({
  plantId: z.string(),
  tone: z.enum(["calm", "dramatic", "scientific", "funny"]),
  snapshot: z.object({
    pH: z.number(),
    tds: z.number(),
    do: z.number(),
    tempC: z.number(),
    humidity: z.number(),
    soilMoisture: z.number(),
  }),
  visionStatus: z.string(),
  ...localeFields,
});

export const PersonaResponseSchema = z.object({
  state: z.enum(["happy", "stressed", "warning", "critical"]),
  message: z.string(),
  confidence: z.number().min(0).max(1),
});

export const PredictiveRequestSchema = z.object({
  plantId: z.string(),
  horizonHours: z.number().int().positive(),
  forecastSummary: z.string(),
  interventions: z.array(z.string()),
  ...localeFields,
});

export const PredictiveResponseSchema = z.object({
  narrative: z.string(),
  likelyImpact: z.string(),
  actions: z.array(z.string()),
});

export const RootCauseRequestSchema = z.object({
  plantId: z.string(),
  anomaly: z.string(),
  topSignals: z.array(z.string()),
  ...localeFields,
});

export const RootCauseResponseSchema = z.object({
  rankedCauses: z.array(
    z.object({ cause: z.string(), confidence: z.number() }),
  ),
  remediationChecklist: z.array(z.string()),
  summary: z.string(),
});

export const DiseaseRequestSchema = z.object({
  plantId: z.string(),
  label: z.string(),
  confidence: z.number().min(0).max(1),
  imageMeta: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    size: z.number().optional(),
    type: z.string().optional(),
  }),
  ...localeFields,
});

export const DiseaseResponseSchema = z.object({
  explanation: z.string(),
  treatmentPlan: z.array(z.string()),
  safetyWarnings: z.array(z.string()),
});

export const OperatorBriefRequestSchema = z.object({
  scope: z.string(),
  plantSummaries: z.array(z.string()),
  topAlerts: z.array(z.string()),
  ...localeFields,
});

export const OperatorBriefResponseSchema = z.object({
  summary: z.string(),
  topRisks: z.array(z.string()),
  actionChecklist: z.array(z.string()),
});

export type PersonaRequest = z.infer<typeof PersonaRequestSchema>;
export type PersonaResponse = z.infer<typeof PersonaResponseSchema>;
export type PredictiveRequest = z.infer<typeof PredictiveRequestSchema>;
export type PredictiveResponse = z.infer<typeof PredictiveResponseSchema>;
export type RootCauseRequest = z.infer<typeof RootCauseRequestSchema>;
export type RootCauseResponse = z.infer<typeof RootCauseResponseSchema>;
export type DiseaseRequest = z.infer<typeof DiseaseRequestSchema>;
export type DiseaseResponse = z.infer<typeof DiseaseResponseSchema>;
export type OperatorBriefRequest = z.infer<typeof OperatorBriefRequestSchema>;
export type OperatorBriefResponse = z.infer<typeof OperatorBriefResponseSchema>;
