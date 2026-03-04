import { randomBetween } from "@/lib/utils";

const labels = [
  "Powdery Mildew",
  "Nutrient Burn",
  "Leaf Spot",
  "Root Stress (non-pathogenic)",
  "No obvious disease",
] as const;

export const mockDiseaseClassification = () => {
  const label = labels[Math.floor(Math.random() * labels.length)];
  const base = label === "No obvious disease" ? 0.62 : 0.74;

  return {
    label,
    confidence: Number(Math.min(0.97, base + randomBetween(0, 0.2)).toFixed(2)),
  };
};
