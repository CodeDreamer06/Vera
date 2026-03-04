import { detectAnomalies } from "@/lib/mock/anomaly";
import {
  generateForecast,
  predictiveAlertsFromForecast,
} from "@/lib/mock/forecast";
import { generateHistory } from "@/lib/mock/sensor";
import { randomId } from "@/lib/utils";
import type {
  Alert,
  Forecast,
  InboxMessage,
  PersonaMessage,
  Plant,
  PlantStage,
  SensorReading,
} from "@/types/domain";

const stages: PlantStage[] = ["seedling", "veg", "fruiting"];
const species = ["Lettuce", "Basil", "Spinach", "Kale", "Tomato", "Mint"];

export interface SeedBundle {
  plants: Plant[];
  readings: SensorReading[];
  alerts: Alert[];
  forecasts: Forecast[];
  persona: PersonaMessage[];
  inbox: InboxMessage[];
}

export const createDemoPlants = (count = 8): Plant[] => {
  const now = Date.now();

  return Array.from({ length: count }).map((_, i) => {
    const stage = stages[i % stages.length];
    const zone = `Zone ${String.fromCharCode(65 + (i % 4))}`;

    return {
      id: randomId("plant"),
      name: `Vera-${String(i + 1).padStart(2, "0")}`,
      species: species[i % species.length],
      zone,
      stage,
      healthScore: 74 + (i % 18),
      createdAt: now,
      updatedAt: now,
    };
  });
};

export const seedDemoData = (count = 8): SeedBundle => {
  const plants = createDemoPlants(count);

  const readings: SensorReading[] = [];
  const alerts: Alert[] = [];
  const forecasts: Forecast[] = [];
  const persona: PersonaMessage[] = [];
  const inbox: InboxMessage[] = [];

  for (const plant of plants) {
    const history = generateHistory(plant, 48, 15);
    readings.push(...history);

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    const anomalyResult = detectAnomalies(plant, latest, previous);
    alerts.push(...anomalyResult.alerts);

    const forecast = generateForecast(plant.id, latest, 24);
    forecasts.push(forecast);
    alerts.push(...predictiveAlertsFromForecast(plant.id, forecast));

    persona.push({
      id: randomId("persona"),
      plantId: plant.id,
      timestamp: Date.now(),
      tone: "calm",
      state: "happy",
      message: `I'm ${plant.name}, feeling balanced and ready for growth in ${plant.zone}.`,
      sensorSnapshotRef: latest.id,
    });

    inbox.push({
      id: randomId("inbox"),
      plantId: plant.id,
      createdAt: Date.now(),
      role: "system",
      text: `${plant.name} initialized in demo mode with live telemetry simulation.`,
    });
  }

  return { plants, readings, alerts, forecasts, persona, inbox };
};
