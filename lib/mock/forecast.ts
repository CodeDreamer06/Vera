import { randomBetween, randomId } from "@/lib/utils";
import type {
  Alert,
  Forecast,
  SensorReading,
  TimeTravelControls,
} from "@/types/domain";

export const generateForecast = (
  plantId: string,
  latest: SensorReading,
  horizonHours = 24,
): Forecast => {
  const stepHours = 2;
  const steps = Math.floor(horizonHours / stepHours);
  const now = Date.now();

  const metricForecasts: Forecast["metricForecasts"] = {
    pH: [],
    tds: [],
    do: [],
    tempC: [],
    humidity: [],
  };

  for (let i = 1; i <= steps; i += 1) {
    const at = now + i * stepHours * 3600_000;
    metricForecasts.pH.push({
      at,
      value: latest.pH + i * randomBetween(-0.03, 0.03),
    });
    metricForecasts.tds.push({
      at,
      value: latest.tds + i * randomBetween(-18, 20),
    });
    metricForecasts.do.push({
      at,
      value: latest.do + i * randomBetween(-0.22, 0.16),
    });
    metricForecasts.tempC.push({
      at,
      value: latest.tempC + i * randomBetween(-0.22, 0.31),
    });
    metricForecasts.humidity.push({
      at,
      value: latest.humidity + i * randomBetween(-0.45, 0.37),
    });
  }

  return {
    id: randomId("forecast"),
    plantId,
    createdAt: now,
    horizonHours,
    metricForecasts,
    yieldProjection: Math.max(
      0.55,
      Math.min(1.2, 0.95 + randomBetween(-0.2, 0.18)),
    ),
    diseaseRisk: Math.max(0.05, Math.min(0.95, randomBetween(0.1, 0.62))),
  };
};

export const predictiveAlertsFromForecast = (
  plantId: string,
  forecast: Forecast,
): Alert[] => {
  const alerts: Alert[] = [];
  const now = Date.now();

  const doDrop = forecast.metricForecasts.do.find((p) => p.value < 5.2);
  if (doDrop) {
    const hours = Math.max(0.5, (doDrop.at - now) / 3600_000);
    alerts.push({
      id: randomId("alert"),
      plantId,
      type: "predictive",
      severity: hours < 4 ? "critical" : "high",
      title: `You will likely have a DO problem in ${hours.toFixed(hours < 10 ? 1 : 0)} hours`,
      description:
        "Forecast indicates dissolved oxygen dropping below safe margin. Increase aeration and cool solution.",
      predictedAt: doDrop.at,
      status: "open",
      source: "forecast-engine",
      createdAt: now,
    });
  }

  const pHDrift = forecast.metricForecasts.pH.find(
    (p) => p.value < 5.5 || p.value > 6.7,
  );
  if (pHDrift) {
    const hours = Math.max(0.5, (pHDrift.at - now) / 3600_000);
    alerts.push({
      id: randomId("alert"),
      plantId,
      type: "predictive",
      severity: "medium",
      title: `pH will drift outside target in ~${hours.toFixed(1)} hours`,
      description:
        "Buffer correction is recommended before nutrient lockout risk rises.",
      predictedAt: pHDrift.at,
      status: "open",
      source: "forecast-engine",
      createdAt: now,
    });
  }

  return alerts;
};

export const projectFutureState = (
  latest: SensorReading,
  controls: TimeTravelControls,
): {
  score: number;
  status: "wilted" | "stable" | "lush";
  explanation: string;
} => {
  let score = 70;

  const heatPenalty = latest.tempC > 30 ? 22 : latest.tempC > 28 ? 11 : 0;
  const doPenalty = latest.do < 5.5 ? 18 : latest.do < 6.3 ? 8 : 0;
  const phPenalty = latest.pH < 5.6 || latest.pH > 6.6 ? 10 : 0;

  score -= heatPenalty + doPenalty + phPenalty;
  score += controls.increaseAeration ? 10 : 0;
  score += controls.reduceTemp ? 9 : 0;
  score += controls.rebalanceNutrients ? 8 : 0;
  score -= controls.day * 2;
  score = Math.max(5, Math.min(95, score));

  if (score < 40) {
    return {
      score,
      status: "wilted",
      explanation:
        "Stress compounds across the week. Root oxygen and temperature management should be prioritized.",
    };
  }

  if (score < 70) {
    return {
      score,
      status: "stable",
      explanation:
        "Plant remains viable, but growth velocity may flatten unless environmental corrections are maintained.",
    };
  }

  return {
    score,
    status: "lush",
    explanation:
      "Conditions support aggressive but safe growth momentum with strong leaf expansion potential.",
  };
};
