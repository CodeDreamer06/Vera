import { spawn } from "node:child_process";
import path from "node:path";
import type { DiseaseMlResponse } from "@/types/ml";

type InferOutput = {
  label: string;
  confidence: number;
  topPredictions: Array<{
    label: string;
    confidence: number;
  }>;
};

const clampConfidence = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

const toTitleCase = (text: string) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase() + chunk.slice(1))
    .join(" ");

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

const normalizeLabel = (label: string) =>
  label.replace(/\s+/g, " ").trim().toLowerCase();

const prettifyLabel = (label: string) => toTitleCase(normalizeLabel(label));

const getAdviceFromLabel = (
  rawLabel: string,
  confidence: number,
): Pick<
  DiseaseMlResponse,
  "explanation" | "treatmentPlan" | "safetyWarnings"
> => {
  const label = normalizeLabel(rawLabel);
  const isBackground = label === "background";
  const isHealthy = label.includes("healthy");
  const isLikelyUnclear = confidence < 0.4;

  if (isBackground || isLikelyUnclear) {
    return {
      explanation:
        "The model could not confidently detect a diseased leaf area from this image. Capture a closer and sharper photo of the most affected leaf.",
      treatmentPlan: [
        "Retake image in natural light with the lesion centered",
        "Capture both upper and lower leaf surfaces",
        "Quarantine suspicious plants until diagnosis is clearer",
      ],
      safetyWarnings: [
        "Avoid applying fungicides or insecticides without a reliable diagnosis",
        "Sanitize scissors, gloves, and tools between plants",
      ],
    };
  }

  if (isHealthy) {
    return {
      explanation:
        "The model classifies this sample as healthy. Continue monitoring because early-stage infections can be visually subtle.",
      treatmentPlan: [
        "Maintain irrigation and airflow in the current range",
        "Inspect nearby plants every 2-3 days for new lesions",
        "Remove fallen infected debris to prevent future spread",
      ],
      safetyWarnings: [
        "Do not spray preventive chemicals unless required by your crop protocol",
        "Re-check with a fresh image if symptoms appear later",
      ],
    };
  }

  const crop = label.split(" ")[0] ?? "plant";
  return {
    explanation: `The model predicts ${prettifyLabel(label)} with ${(confidence * 100).toFixed(1)}% confidence.`,
    treatmentPlan: [
      `Isolate affected ${crop} plants from healthy stock`,
      "Prune and discard severely infected leaves in sealed bags",
      "Apply crop-approved treatment for this disease class and monitor response for 3-5 days",
    ],
    safetyWarnings: [
      "Follow local pesticide/fungicide label instructions and pre-harvest intervals",
      "Use gloves and avoid cross-contamination between beds",
    ],
  };
};

const parseUvTopK = () => {
  const parsed = Number.parseInt(process.env.PLANT_DISEASE_TOP_K ?? "3", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 3;
  }
  return Math.min(parsed, 5);
};

const runLocalMlInference = async (
  imageDataUrlOrBlobKey: string,
): Promise<InferOutput> => {
  const uvBinary = process.env.UV_BIN ?? "uv";
  const pythonVersion = process.env.PLANT_DISEASE_PYTHON ?? "3.11";
  const runtimeMode =
    (process.env.PLANT_DISEASE_RUNTIME ?? "auto").toLowerCase() || "auto";
  const scriptPath = path.resolve(
    process.cwd(),
    "scripts/plant_disease_infer.py",
  );
  const requirementsPath = path.resolve(
    process.cwd(),
    "scripts/requirements-plant-disease.txt",
  );
  const modelPath = path.resolve(
    process.cwd(),
    process.env.PLANT_DISEASE_MODEL_PATH ??
      "../Plant-Disease-Detection-and-Solution/FarmerFriendApp/app/src/main/assets/model.tflite",
  );
  const labelsPath = path.resolve(
    process.cwd(),
    process.env.PLANT_DISEASE_LABELS_PATH ??
      "../Plant-Disease-Detection-and-Solution/FarmerFriendApp/app/src/main/assets/labels.txt",
  );
  const topK = parseUvTopK();

  const runWithArgs = (args: string[]) =>
    new Promise<InferOutput>((resolve, reject) => {
      const child = spawn(uvBinary, args, {
        cwd: process.cwd(),
        env: process.env,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");

      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
      child.on("error", (error) => {
        reject(error);
      });
      child.on("close", (code) => {
        if (code !== 0) {
          reject(
            new Error(
              `uv-inference-exit:${String(code)}:${stderr.trim() || "unknown-error"}`,
            ),
          );
          return;
        }
        try {
          const parsed = JSON.parse(stdout) as Partial<InferOutput>;
          if (
            typeof parsed.label !== "string" ||
            typeof parsed.confidence !== "number" ||
            !Array.isArray(parsed.topPredictions)
          ) {
            reject(new Error("invalid-inference-output"));
            return;
          }
          resolve({
            label: parsed.label,
            confidence: clampConfidence(parsed.confidence),
            topPredictions: parsed.topPredictions
              .filter(
                (item): item is { label: string; confidence: number } =>
                  typeof item?.label === "string" &&
                  typeof item?.confidence === "number",
              )
              .map((item) => ({
                label: item.label,
                confidence: clampConfidence(item.confidence),
              })),
          });
        } catch (error) {
          reject(
            new Error(
              `invalid-inference-json:${error instanceof Error ? error.message : String(error)}`,
            ),
          );
        }
      });

      child.stdin.write(
        JSON.stringify({
          imageDataUrlOrBlobKey,
        }),
      );
      child.stdin.end();
    });

  const baseArgs = ["run", "--no-project", "--python", pythonVersion];
  const inferScriptArgs = [
    "python",
    scriptPath,
    "--model",
    modelPath,
    "--labels",
    labelsPath,
    "--top-k",
    String(topK),
  ];
  const tfliteArgs = [
    ...baseArgs,
    "--with-requirements",
    requirementsPath,
    ...inferScriptArgs,
  ];
  const tensorflowArgs = [
    ...baseArgs,
    "--with",
    "numpy",
    "--with",
    "pillow",
    "--with",
    "tensorflow",
    ...inferScriptArgs,
  ];

  const isTfliteWheelResolutionError = (reason: string) =>
    reason.includes("tflite-runtime") &&
    (reason.includes("No solution found when resolving") ||
      reason.includes("cannot be used") ||
      reason.includes("has no wheels"));

  if (runtimeMode === "tensorflow") {
    return runWithArgs(tensorflowArgs);
  }
  if (runtimeMode === "tflite") {
    return runWithArgs(tfliteArgs);
  }

  try {
    return await runWithArgs(tfliteArgs);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    if (!isTfliteWheelResolutionError(reason)) {
      throw error;
    }
    return runWithArgs(tensorflowArgs);
  }
};

export const detectPlantDiseaseFromImage = async (
  imageDataUrlOrBlobKey: string,
): Promise<DiseaseMlResponse> => {
  try {
    const result = await runLocalMlInference(imageDataUrlOrBlobKey);
    const label = prettifyLabel(result.label);
    const confidence = clampConfidence(Number(result.confidence) || 0);
    const advice = getAdviceFromLabel(result.label, confidence);

    return {
      label,
      confidence,
      explanation: advice.explanation,
      treatmentPlan: advice.treatmentPlan,
      safetyWarnings: advice.safetyWarnings,
      topPredictions: result.topPredictions.map((item) => ({
        label: prettifyLabel(item.label),
        confidence: clampConfidence(Number(item.confidence) || 0),
      })),
      engine: "ml-tflite",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("[Disease vision inference fallback]", { reason });
    return fallbackResponse(reason);
  }
};
