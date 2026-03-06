export type PlantStage = "seedling" | "veg" | "fruiting";
export type PersonaTone = "calm" | "dramatic" | "scientific" | "funny";
export type PersonaState = "happy" | "stressed" | "warning" | "critical";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface Plant {
  id: string;
  name: string;
  species: string;
  zone: string;
  stage: PlantStage;
  healthScore: number;
  createdAt: number;
  updatedAt: number;
}

export interface SensorReading {
  id: string;
  plantId: string;
  timestamp: number;
  pH: number;
  tds: number;
  do: number;
  tempC: number;
  humidity: number;
  soilMoisture: number;
  waterUsageMl: number;
  nutrientUsageMl: number;
}

export interface Alert {
  id: string;
  plantId: string;
  type: "predictive" | "anomaly" | "sensor" | "disease";
  severity: AlertSeverity;
  title: string;
  description: string;
  predictedAt: number;
  status: AlertStatus;
  source: string;
  createdAt: number;
}

export interface Anomaly {
  id: string;
  plantId: string;
  metric: keyof Omit<SensorReading, "id" | "plantId" | "timestamp">;
  detectedAt: number;
  patternType: string;
  likelyCauses: string[];
  confidence: number;
  notes: string;
}

export interface PersonaMessage {
  id: string;
  plantId: string;
  timestamp: number;
  tone: PersonaTone;
  state: PersonaState;
  message: string;
  sensorSnapshotRef: string;
}

export interface MetricForecastPoint {
  at: number;
  value: number;
}

export interface Forecast {
  id: string;
  plantId: string;
  createdAt: number;
  horizonHours: number;
  metricForecasts: Record<string, MetricForecastPoint[]>;
  yieldProjection: number;
  diseaseRisk: number;
}

export interface DiseaseScan {
  id: string;
  plantId: string;
  createdAt: number;
  imageDataUrlOrBlobKey: string;
  label: string;
  mockLabel?: string;
  confidence: number;
  llmNarrative: string;
  treatmentPlan: string[];
  safetyWarnings: string[];
}

export interface InboxMessage {
  id: string;
  plantId: string;
  createdAt: number;
  role: "plant" | "operator" | "system";
  text: string;
  actionType?: string;
  linkedAlertId?: string;
}

export interface OpsBrief {
  id: string;
  createdAt: number;
  scope: string;
  summary: string;
  topRisks: string[];
  actionChecklist: string[];
}

export interface UiEvent {
  id: string;
  timestamp: number;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface TimeTravelControls {
  day: number;
  increaseAeration: boolean;
  reduceTemp: boolean;
  rebalanceNutrients: boolean;
}

export interface PlantTargets {
  pH: [number, number];
  tds: [number, number];
  do: [number, number];
  tempC: [number, number];
  humidity: [number, number];
  soilMoisture: [number, number];
}

export const STAGE_TARGETS: Record<PlantStage, PlantTargets> = {
  seedling: {
    pH: [5.7, 6.1],
    tds: [350, 650],
    do: [7.5, 10],
    tempC: [21, 24],
    humidity: [65, 80],
    soilMoisture: [58, 72],
  },
  veg: {
    pH: [5.8, 6.3],
    tds: [700, 1000],
    do: [6.8, 9.5],
    tempC: [22, 27],
    humidity: [55, 70],
    soilMoisture: [52, 66],
  },
  fruiting: {
    pH: [5.9, 6.4],
    tds: [950, 1300],
    do: [6.5, 9],
    tempC: [20, 25],
    humidity: [45, 60],
    soilMoisture: [45, 58],
  },
};
