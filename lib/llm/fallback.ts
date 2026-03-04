import type {
  DiseaseResponse,
  OperatorBriefResponse,
  PersonaResponse,
  PredictiveResponse,
  RootCauseResponse,
} from "@/types/llm";

export const fallbackResponses = {
  persona: (): PersonaResponse => ({
    state: "warning",
    message:
      "I'm reading mixed signals right now. Please check pH and dissolved oxygen so I can recover momentum.",
    confidence: 0.62,
  }),
  predictive: (): PredictiveResponse => ({
    narrative:
      "Current trend suggests stress accumulation in the next few hours unless controls are adjusted.",
    likelyImpact: "Growth may slow and leaf quality can decline.",
    actions: [
      "Increase aeration by one level",
      "Lower solution temperature by 1-2°C",
      "Re-check pH buffer dosing",
    ],
  }),
  rootCause: (): RootCauseResponse => ({
    rankedCauses: [
      { cause: "Aeration deficit during warm cycle", confidence: 0.78 },
      { cause: "Recent nutrient dosing overshoot", confidence: 0.67 },
      { cause: "Reservoir mixing inconsistency", confidence: 0.55 },
    ],
    remediationChecklist: [
      "Increase aeration and verify diffuser output",
      "Dilute and rebalance nutrient concentration",
      "Sample pH and DO every 15 minutes for one hour",
    ],
    summary:
      "Anomaly most likely stems from oxygen and dosing instability acting together.",
  }),
  disease: (): DiseaseResponse => ({
    explanation:
      "Symptoms align with moderate stress expression. Keep airflow stable and avoid abrupt nutrient corrections.",
    treatmentPlan: [
      "Remove visibly affected leaves with sterilized tools",
      "Stabilize humidity near stage target",
      "Apply stage-safe preventative treatment as label permits",
    ],
    safetyWarnings: [
      "Use gloves and eye protection during treatment",
      "Isolate treated plant area for observation",
    ],
  }),
  operatorBrief: (): OperatorBriefResponse => ({
    summary:
      "Fleet is mostly stable, but oxygen and pH drift risks should be handled early to avoid compounded stress.",
    topRisks: [
      "DO decline in warm zones",
      "pH drift outside target in high-consumption plants",
      "Localized nutrient concentration spikes",
    ],
    actionChecklist: [
      "Prioritize aeration checks in top-risk plants",
      "Buffer pH before next feeding window",
      "Run 2-hour follow-up telemetry sweep",
    ],
  }),
};
