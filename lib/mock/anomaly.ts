import { randomId } from "@/lib/utils";
import type { Alert, Anomaly, Plant, SensorReading } from "@/types/domain";

export interface AnomalyResult {
  anomalies: Anomaly[];
  alerts: Alert[];
}

const makeAlert = (
  plant: Plant,
  severity: Alert["severity"],
  title: string,
  description: string,
) => ({
  id: randomId("alert"),
  plantId: plant.id,
  type: "anomaly" as const,
  severity,
  title,
  description,
  predictedAt: Date.now(),
  status: "open" as const,
  source: "mock-anomaly-engine",
  createdAt: Date.now(),
});

export const detectAnomalies = (
  plant: Plant,
  current: SensorReading,
  previous?: SensorReading,
): AnomalyResult => {
  const anomalies: Anomaly[] = [];
  const alerts: Alert[] = [];

  if (previous && Math.abs(current.pH - previous.pH) > 0.35) {
    anomalies.push({
      id: randomId("anomaly"),
      plantId: plant.id,
      metric: "pH",
      detectedAt: current.timestamp,
      patternType: "pH oscillation",
      likelyCauses: ["Aggressive dosing", "Unstable buffer mix"],
      confidence: 0.79,
      notes: "Short-interval pH bounce detected.",
    });
    alerts.push(
      makeAlert(
        plant,
        "high",
        `${plant.name}: pH is oscillating`,
        "pH is moving too quickly between intervals and may stress nutrient uptake.",
      ),
    );
  }

  if (current.do < 5.4) {
    anomalies.push({
      id: randomId("anomaly"),
      plantId: plant.id,
      metric: "do",
      detectedAt: current.timestamp,
      patternType: "DO decline",
      likelyCauses: ["Low aeration", "High water temperature"],
      confidence: 0.83,
      notes: "Dissolved oxygen is below safe comfort range.",
    });
    alerts.push(
      makeAlert(
        plant,
        current.do < 4.7 ? "critical" : "high",
        `${plant.name}: oxygen stress risk`,
        "Dissolved oxygen dropped under comfort threshold. Increase aeration promptly.",
      ),
    );
  }

  if (current.tds > 1400) {
    anomalies.push({
      id: randomId("anomaly"),
      plantId: plant.id,
      metric: "tds",
      detectedAt: current.timestamp,
      patternType: "EC spike",
      likelyCauses: ["Nutrient over-dosing", "Evaporation concentration"],
      confidence: 0.75,
      notes: "Nutrient concentration spike detected.",
    });
    alerts.push(
      makeAlert(
        plant,
        "medium",
        `${plant.name}: nutrient concentration spike`,
        "EC/TDS has risen above stage target and should be diluted gradually.",
      ),
    );
  }

  if (previous && current.soilMoisture < previous.soilMoisture - 8) {
    anomalies.push({
      id: randomId("anomaly"),
      plantId: plant.id,
      metric: "soilMoisture",
      detectedAt: current.timestamp,
      patternType: "moisture non-response",
      likelyCauses: ["Emitter blockage", "Uneven substrate retention"],
      confidence: 0.62,
      notes:
        "Moisture dropped faster than expected despite recent irrigation activity.",
    });
    alerts.push(
      makeAlert(
        plant,
        "medium",
        `${plant.name}: moisture response anomaly`,
        "Substrate moisture trend is decoupled from watering pattern.",
      ),
    );
  }

  return { anomalies, alerts };
};

export const createForcedAnomaly = (kind: "heat" | "oxygen" | "acidic") => {
  if (kind === "heat") {
    return { tempC: 32.5, humidity: 39, do: 5.1 };
  }

  if (kind === "oxygen") {
    return { do: 4.4, tempC: 29.8 };
  }

  return { pH: 5.2, tds: 1450 };
};
