import fs from "node:fs";
import path from "node:path";

const modelPath = path.resolve("src/ml/model.json");

const fallbackModel = {
  bias: -2.2,
  weights: {
    phDeviation: 1.8,
    highTemp: 1.1,
    lowHumidity: 0.9,
    lowWater: 1.6
  }
};

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function loadModel() {
  if (fs.existsSync(modelPath)) {
    const raw = fs.readFileSync(modelPath, "utf-8");
    return JSON.parse(raw);
  }
  return fallbackModel;
}

export function predictNutrientRisk(reading, model = loadModel()) {
  const phDeviation = Math.abs(reading.ph - 6.0);
  const highTemp = Math.max(0, reading.airTempC - 26) / 10;
  const lowHumidity = Math.max(0, 60 - reading.humidity) / 60;
  const lowWater = Math.max(0, 35 - reading.waterLevelPct) / 35;

  const score =
    model.bias +
    model.weights.phDeviation * phDeviation +
    model.weights.highTemp * highTemp +
    model.weights.lowHumidity * lowHumidity +
    model.weights.lowWater * lowWater;

  return clamp(sigmoid(score), 0, 1);
}

function gaussianCloseness(value, ideal, tolerance) {
  const z = (value - ideal) / tolerance;
  return Math.exp(-(z * z));
}

export function predictGrowthHealthScore(reading, nutrientRisk) {
  // Lightweight "ML-like" scorer using weighted feature quality.
  // Produces stable demo-friendly scores in range 0-100.
  const phQuality = gaussianCloseness(reading.ph, 6.0, 0.55);
  const tempQuality = gaussianCloseness(reading.airTempC, 24.0, 4.5);
  const humidityQuality = gaussianCloseness(reading.humidity, 62.0, 14);
  const waterQuality = gaussianCloseness(reading.waterLevelPct, 70.0, 24);

  const weightedQuality =
    phQuality * 0.32 +
    tempQuality * 0.23 +
    humidityQuality * 0.2 +
    waterQuality * 0.25;

  const riskPenalty = nutrientRisk * 0.35;
  const normalized = clamp(weightedQuality - riskPenalty, 0, 1);

  return Math.round(normalized * 100);
}
