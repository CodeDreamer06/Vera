import { spawn } from "node:child_process";
import path from "node:path";

import type { DiseaseMlResponse } from "@/types/ml";

const defaultModelPath = path.resolve(
  process.cwd(),
  "..",
  "Plant-Disease-Detection-and-Solution",
  "FarmerFriendApp",
  "app",
  "src",
  "main",
  "assets",
  "model.tflite",
);

const defaultLabelsPath = path.resolve(
  process.cwd(),
  "..",
  "Plant-Disease-Detection-and-Solution",
  "FarmerFriendApp",
  "app",
  "src",
  "main",
  "assets",
  "labels.txt",
);

const scriptPath = path.resolve(
  process.cwd(),
  "scripts",
  "plant_disease_infer.py",
);

const modelPath = process.env.PLANT_DISEASE_MODEL_PATH ?? defaultModelPath;
const labelsPath = process.env.PLANT_DISEASE_LABELS_PATH ?? defaultLabelsPath;
const pythonBin = process.env.PLANT_DISEASE_PYTHON_BIN ?? "python3";

type RawInference = {
  label: string;
  confidence: number;
  topPredictions: Array<{ label: string; confidence: number }>;
};

const clampConfidence = (value: number) => Math.max(0, Math.min(1, value));

const toTitleCase = (text: string) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase() + chunk.slice(1))
    .join(" ");

const keywordGuidance = (
  label: string,
): Omit<DiseaseMlResponse, "confidence" | "topPredictions"> => {
  const normalized = label.trim().toLowerCase();
  const displayLabel = toTitleCase(normalized.replace(/\s+/g, " "));

  if (!normalized || normalized.includes("background")) {
    return {
      label: displayLabel || "Unclear Sample",
      explanation:
        "The model could not detect a clear plant-disease signal. Capture a sharp, close image of one affected leaf and retry.",
      treatmentPlan: [
        "Retake photo in daylight with leaf filling most of the frame",
        "Avoid motion blur and remove clutter from background",
        "Upload one leaf front side and one back side for comparison",
      ],
      safetyWarnings: [
        "Do not apply pesticide until disease is confirmed",
        "Isolate suspicious plants if spreading symptoms are visible",
      ],
      engine: "tflite-python",
    };
  }

  if (normalized.includes("healthy")) {
    return {
      label: displayLabel,
      explanation:
        "No visible disease pattern was detected in the uploaded sample. Continue monitoring and maintain stable growth conditions.",
      treatmentPlan: [
        "Keep irrigation and nutrient dosing stable",
        "Inspect canopy weekly for early lesion or spotting signs",
        "Remove dead leaves to reduce moisture traps",
      ],
      safetyWarnings: [
        "Avoid preventive fungicide overuse on healthy foliage",
        "Sterilize tools before pruning nearby plants",
      ],
      engine: "tflite-python",
    };
  }

  if (normalized.includes("virus")) {
    return {
      label: displayLabel,
      explanation:
        "The pattern suggests a viral infection. Viral diseases usually cannot be reversed and should be managed by containment.",
      treatmentPlan: [
        "Isolate symptomatic plants immediately",
        "Remove heavily infected leaves or plants in sealed disposal bags",
        "Control insect vectors (whiteflies/aphids/thrips) around crop",
      ],
      safetyWarnings: [
        "Do not compost infected viral material",
        "Disinfect gloves and cutting tools between plants",
      ],
      engine: "tflite-python",
    };
  }

  if (
    normalized.includes("mildew") ||
    normalized.includes("mold") ||
    normalized.includes("rust") ||
    normalized.includes("blight") ||
    normalized.includes("spot") ||
    normalized.includes("scab")
  ) {
    return {
      label: displayLabel,
      explanation:
        "The model indicates a fungal or bacterial leaf disease pattern. Early intervention usually improves recovery and reduces spread.",
      treatmentPlan: [
        "Prune visibly affected leaves with sterile tools",
        "Improve airflow and avoid overhead watering",
        "Apply crop-safe fungicide/bactericide per local guidance",
      ],
      safetyWarnings: [
        "Wear gloves and eye protection while spraying treatments",
        "Respect pre-harvest interval and label dosage limits",
      ],
      engine: "tflite-python",
    };
  }

  return {
    label: displayLabel,
    explanation:
      "A disease pattern was detected by the model. Use this prediction as triage support and verify with local agronomy guidance.",
    treatmentPlan: [
      "Isolate affected plants and monitor neighboring plants",
      "Trim symptomatic leaves and sanitize tools",
      "Apply species-appropriate treatment only after label verification",
    ],
    safetyWarnings: [
      "Use PPE for any chemical treatment",
      "Follow local agricultural regulations before application",
    ],
    engine: "tflite-python",
  };
};

const fallbackResponse = (reason: string): DiseaseMlResponse => ({
  label: "Model Unavailable",
  confidence: 0,
  explanation: `ML inference is unavailable right now (${reason}). Configure Python + TFLite dependencies and retry.`,
  treatmentPlan: [
    "Capture a clear leaf image and retry after backend setup",
    "Inspect leaf underside for spots, mold, or pests",
    "Temporarily isolate high-risk plants to prevent spread",
  ],
  safetyWarnings: [
    "Avoid broad chemical use without confirmed diagnosis",
    "Escalate severe outbreaks to local agronomy support",
  ],
  topPredictions: [],
  engine: "fallback",
});

const runInferenceScript = async (
  imageDataUrlOrBlobKey: string,
): Promise<RawInference> => {
  const timeoutMs = Number(process.env.PLANT_DISEASE_INFER_TIMEOUT_MS ?? 20000);

  return new Promise<RawInference>((resolve, reject) => {
    const child = spawn(
      pythonBin,
      [
        scriptPath,
        "--model",
        modelPath,
        "--labels",
        labelsPath,
        "--top-k",
        "3",
      ],
      { stdio: ["pipe", "pipe", "pipe"] },
    );

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`inference-timeout-${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(
          new Error(
            `inference-exit-${code}: ${stderr.trim() || "no-stderr-output"}`,
          ),
        );
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim()) as RawInference;
        resolve(parsed);
      } catch (error) {
        reject(
          new Error(
            `inference-invalid-json: ${error instanceof Error ? error.message : String(error)}`,
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
};

export const detectPlantDiseaseFromImage = async (
  imageDataUrlOrBlobKey: string,
): Promise<DiseaseMlResponse> => {
  try {
    const raw = await runInferenceScript(imageDataUrlOrBlobKey);
    const guidance = keywordGuidance(raw.label);

    return {
      ...guidance,
      confidence: clampConfidence(Number(raw.confidence) || 0),
      topPredictions: raw.topPredictions.map((item) => ({
        label: toTitleCase(item.label.trim().toLowerCase()),
        confidence: clampConfidence(Number(item.confidence) || 0),
      })),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("[ML disease inference fallback]", { reason });
    return fallbackResponse(reason);
  }
};
