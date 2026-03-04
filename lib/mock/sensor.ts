import { clamp, jitter, randomBetween, randomId } from "@/lib/utils";
import { type Plant, type SensorReading, STAGE_TARGETS } from "@/types/domain";

const metricBounds = {
  pH: [4.8, 7],
  tds: [180, 1800],
  do: [3.5, 12],
  tempC: [16, 36],
  humidity: [30, 95],
  soilMoisture: [20, 90],
  waterUsageMl: [40, 450],
  nutrientUsageMl: [20, 220],
} as const;

export const generateReading = (
  plant: Plant,
  previous?: SensorReading,
  forcedAnomaly?: Partial<SensorReading>,
): SensorReading => {
  const targets = STAGE_TARGETS[plant.stage];

  const base = {
    pH: randomBetween(targets.pH[0], targets.pH[1]),
    tds: randomBetween(targets.tds[0], targets.tds[1]),
    do: randomBetween(targets.do[0], targets.do[1]),
    tempC: randomBetween(targets.tempC[0], targets.tempC[1]),
    humidity: randomBetween(targets.humidity[0], targets.humidity[1]),
    soilMoisture: randomBetween(
      targets.soilMoisture[0],
      targets.soilMoisture[1],
    ),
    waterUsageMl: randomBetween(
      metricBounds.waterUsageMl[0],
      metricBounds.waterUsageMl[1],
    ),
    nutrientUsageMl: randomBetween(
      metricBounds.nutrientUsageMl[0],
      metricBounds.nutrientUsageMl[1],
    ),
  };

  const withDrift = previous
    ? {
        pH: jitter(previous.pH, 0.08),
        tds: jitter(previous.tds, 25),
        do: jitter(previous.do, 0.22),
        tempC: jitter(previous.tempC, 0.35),
        humidity: jitter(previous.humidity, 0.7),
        soilMoisture: jitter(previous.soilMoisture, 0.9),
        waterUsageMl: jitter(previous.waterUsageMl, 12),
        nutrientUsageMl: jitter(previous.nutrientUsageMl, 7),
      }
    : base;

  const anomalyApplied = {
    ...withDrift,
    ...forcedAnomaly,
  };

  return {
    id: randomId("reading"),
    plantId: plant.id,
    timestamp: Date.now(),
    pH: clamp(anomalyApplied.pH, metricBounds.pH[0], metricBounds.pH[1]),
    tds: clamp(anomalyApplied.tds, metricBounds.tds[0], metricBounds.tds[1]),
    do: clamp(anomalyApplied.do, metricBounds.do[0], metricBounds.do[1]),
    tempC: clamp(
      anomalyApplied.tempC,
      metricBounds.tempC[0],
      metricBounds.tempC[1],
    ),
    humidity: clamp(
      anomalyApplied.humidity,
      metricBounds.humidity[0],
      metricBounds.humidity[1],
    ),
    soilMoisture: clamp(
      anomalyApplied.soilMoisture,
      metricBounds.soilMoisture[0],
      metricBounds.soilMoisture[1],
    ),
    waterUsageMl: clamp(
      anomalyApplied.waterUsageMl,
      metricBounds.waterUsageMl[0],
      metricBounds.waterUsageMl[1],
    ),
    nutrientUsageMl: clamp(
      anomalyApplied.nutrientUsageMl,
      metricBounds.nutrientUsageMl[0],
      metricBounds.nutrientUsageMl[1],
    ),
  };
};

export const generateHistory = (plant: Plant, hours = 48, stepMinutes = 10) => {
  const points = Math.max(4, Math.floor((hours * 60) / stepMinutes));
  const history: SensorReading[] = [];

  for (let i = points; i > 0; i -= 1) {
    const prev = history[history.length - 1];
    const next = generateReading(plant, prev);
    next.timestamp = Date.now() - i * stepMinutes * 60_000;
    history.push(next);
  }

  return history;
};
