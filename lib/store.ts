"use client";

import { create } from "zustand";

import { createForcedAnomaly, detectAnomalies } from "@/lib/mock/anomaly";
import { mockDiseaseClassification } from "@/lib/mock/disease";
import {
  generateForecast,
  predictiveAlertsFromForecast,
} from "@/lib/mock/forecast";
import { seedDemoData } from "@/lib/mock/seed";
import { generateReading } from "@/lib/mock/sensor";
import { exportDemoData, importDemoData } from "@/lib/storage/importExport";
import { repository } from "@/lib/storage/repository";
import { randomId } from "@/lib/utils";
import type {
  Alert,
  Anomaly,
  DiseaseScan,
  Forecast,
  InboxMessage,
  OpsBrief,
  PersonaMessage,
  PersonaTone,
  Plant,
  SensorReading,
} from "@/types/domain";
import type {
  DiseaseResponse,
  OperatorBriefResponse,
  PersonaResponse,
  PredictiveResponse,
  RootCauseResponse,
} from "@/types/llm";

const MAX_HISTORY = 240;

interface AppState {
  hydrated: boolean;
  loading: boolean;
  plants: Plant[];
  activePlantId: string | null;
  readingsByPlant: Record<string, SensorReading[]>;
  alerts: Alert[];
  anomalies: Anomaly[];
  forecastsByPlant: Record<string, Forecast>;
  personaByPlant: Record<string, PersonaMessage[]>;
  diseaseByPlant: Record<string, DiseaseScan[]>;
  inboxByPlant: Record<string, InboxMessage[]>;
  opsBriefs: OpsBrief[];
  recipeMode: boolean;
  personaTone: PersonaTone;

  initialize: () => Promise<void>;
  startDemoMode: (count?: number) => Promise<void>;
  setActivePlant: (plantId: string) => void;
  tickSensors: () => Promise<void>;
  injectDemoAnomaly: () => Promise<void>;
  toggleRecipeMode: () => void;
  setPersonaTone: (tone: PersonaTone) => void;
  refreshPersona: (plantId: string) => Promise<void>;
  requestRootCause: (anomaly: Anomaly) => Promise<RootCauseResponse>;
  runTimeTravelNarrative: (
    plantId: string,
    horizonHours: number,
    summary: string,
    interventions: string[],
  ) => Promise<PredictiveResponse>;
  analyzeDisease: (
    plantId: string,
    imageDataUrlOrBlobKey: string,
    imageMeta: {
      width?: number;
      height?: number;
      size?: number;
      type?: string;
    },
  ) => Promise<DiseaseScan>;
  runOperatorBrief: () => Promise<OpsBrief>;
  addInboxReply: (plantId: string, text: string) => Promise<void>;
  exportAll: () => Promise<void>;
  importAll: (file: File, mode: "merge" | "replace") => Promise<void>;
  resetAll: () => Promise<void>;
}

const byPlant = <T extends { plantId: string }>(
  rows: T[],
): Record<string, T[]> => {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    if (!acc[row.plantId]) {
      acc[row.plantId] = [];
    }
    acc[row.plantId].push(row);
    return acc;
  }, {});
};

const fetchJson = async <T>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`${url} failed: ${res.status}`);
  }

  return (await res.json()) as T;
};

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  loading: false,
  plants: [],
  activePlantId: null,
  readingsByPlant: {},
  alerts: [],
  anomalies: [],
  forecastsByPlant: {},
  personaByPlant: {},
  diseaseByPlant: {},
  inboxByPlant: {},
  opsBriefs: [],
  recipeMode: false,
  personaTone: "calm",

  initialize: async () => {
    if (get().hydrated) {
      return;
    }

    set({ loading: true });

    const plants = await repository.plants.getAll();

    if (plants.length === 0 && process.env.NEXT_PUBLIC_DEMO_MODE === "1") {
      await get().startDemoMode(
        Number(process.env.NEXT_PUBLIC_MAX_PLANTS ?? 10),
      );
      set({ loading: false, hydrated: true });
      return;
    }

    const [alerts, anomalies, opsBriefs] = await Promise.all([
      repository.alerts.getOpen(),
      repository.anomalies.getRecent(),
      repository.ops.list(),
    ]);

    const readingsByPlant: Record<string, SensorReading[]> = {};
    const forecastsByPlant: Record<string, Forecast> = {};
    const personaByPlant: Record<string, PersonaMessage[]> = {};
    const diseaseByPlant: Record<string, DiseaseScan[]> = {};
    const inboxByPlant: Record<string, InboxMessage[]> = {};

    await Promise.all(
      plants.map(async (plant) => {
        const [readings, forecasts, persona, disease, inbox] =
          await Promise.all([
            repository.readings.getRecentForPlant(plant.id),
            repository.forecasts.getForPlant(plant.id),
            repository.persona.getForPlant(plant.id),
            repository.disease.getForPlant(plant.id),
            repository.inbox.getForPlant(plant.id),
          ]);

        readingsByPlant[plant.id] = readings;
        forecastsByPlant[plant.id] = forecasts[0];
        personaByPlant[plant.id] = persona;
        diseaseByPlant[plant.id] = disease;
        inboxByPlant[plant.id] = inbox;
      }),
    );

    set({
      hydrated: true,
      loading: false,
      plants,
      activePlantId: plants[0]?.id ?? null,
      alerts: alerts.reverse(),
      anomalies: anomalies.reverse(),
      opsBriefs,
      readingsByPlant,
      forecastsByPlant,
      personaByPlant,
      diseaseByPlant,
      inboxByPlant,
    });
  },

  startDemoMode: async (count = 10) => {
    set({ loading: true });
    await repository.clearAll();

    const seeded = seedDemoData(count);
    await Promise.all([
      repository.plants.putMany(seeded.plants),
      repository.readings.putMany(seeded.readings),
      repository.alerts.putMany(seeded.alerts),
      repository.forecasts.putMany(seeded.forecasts),
      repository.persona.putMany(seeded.persona),
      repository.inbox.putMany(seeded.inbox),
    ]);

    const readingsByPlant = byPlant(seeded.readings);
    const personaByPlant = byPlant(seeded.persona);
    const inboxByPlant = byPlant(seeded.inbox);
    const forecastsByPlant = seeded.forecasts.reduce<Record<string, Forecast>>(
      (acc, f) => {
        acc[f.plantId] = f;
        return acc;
      },
      {},
    );

    set({
      loading: false,
      hydrated: true,
      plants: seeded.plants,
      activePlantId: seeded.plants[0]?.id ?? null,
      alerts: seeded.alerts,
      anomalies: [],
      opsBriefs: [],
      readingsByPlant,
      personaByPlant,
      inboxByPlant,
      forecastsByPlant,
      diseaseByPlant: {},
    });
  },

  setActivePlant: (plantId) => set({ activePlantId: plantId }),

  tickSensors: async () => {
    const {
      plants,
      readingsByPlant,
      alerts: oldAlerts,
      anomalies: oldAnomalies,
    } = get();

    if (plants.length === 0) {
      return;
    }

    const newReadings: SensorReading[] = [];
    const newAlerts: Alert[] = [];
    const newAnomalies: Anomaly[] = [];
    const newForecasts: Forecast[] = [];

    for (const plant of plants) {
      const plantReadings = readingsByPlant[plant.id] ?? [];
      const previous = plantReadings[plantReadings.length - 1];
      const reading = generateReading(plant, previous);
      newReadings.push(reading);

      const anomalyResult = detectAnomalies(plant, reading, previous);
      newAlerts.push(...anomalyResult.alerts);
      newAnomalies.push(...anomalyResult.anomalies);

      const forecast = generateForecast(plant.id, reading, 24);
      newForecasts.push(forecast);
      newAlerts.push(...predictiveAlertsFromForecast(plant.id, forecast));
    }

    await Promise.all([
      repository.readings.putMany(newReadings),
      repository.alerts.putMany(newAlerts),
      repository.anomalies.putMany(newAnomalies),
      repository.forecasts.putMany(newForecasts),
    ]);

    set((state) => {
      const updatedReadings = { ...state.readingsByPlant };
      for (const reading of newReadings) {
        const rows = [...(updatedReadings[reading.plantId] ?? []), reading];
        updatedReadings[reading.plantId] = rows.slice(-MAX_HISTORY);
      }

      const forecastMap = { ...state.forecastsByPlant };
      for (const forecast of newForecasts) {
        forecastMap[forecast.plantId] = forecast;
      }

      return {
        readingsByPlant: updatedReadings,
        alerts: [...oldAlerts, ...newAlerts].slice(-120),
        anomalies: [...oldAnomalies, ...newAnomalies].slice(-120),
        forecastsByPlant: forecastMap,
      };
    });
  },

  injectDemoAnomaly: async () => {
    const { activePlantId, plants, readingsByPlant } = get();
    const plantId = activePlantId ?? plants[0]?.id;
    if (!plantId) {
      return;
    }

    const plant = plants.find((p) => p.id === plantId);
    if (!plant) {
      return;
    }

    const rows = readingsByPlant[plantId] ?? [];
    const previous = rows[rows.length - 1];
    if (!previous) {
      return;
    }

    const forced = createForcedAnomaly("oxygen");
    const reading = generateReading(plant, previous, forced);
    const anomalyResult = detectAnomalies(plant, reading, previous);
    const forecast = generateForecast(plant.id, reading, 24);
    const predictive = predictiveAlertsFromForecast(plant.id, forecast);

    await Promise.all([
      repository.readings.putMany([reading]),
      repository.anomalies.putMany(anomalyResult.anomalies),
      repository.alerts.putMany([...anomalyResult.alerts, ...predictive]),
      repository.forecasts.put(forecast),
      repository.events.put({
        id: randomId("event"),
        timestamp: Date.now(),
        eventType: "forced-anomaly",
        payload: { plantId, forced },
      }),
    ]);

    set((state) => ({
      readingsByPlant: {
        ...state.readingsByPlant,
        [plantId]: [...(state.readingsByPlant[plantId] ?? []), reading].slice(
          -MAX_HISTORY,
        ),
      },
      anomalies: [...state.anomalies, ...anomalyResult.anomalies].slice(-120),
      alerts: [...state.alerts, ...anomalyResult.alerts, ...predictive].slice(
        -140,
      ),
      forecastsByPlant: {
        ...state.forecastsByPlant,
        [plantId]: forecast,
      },
    }));
  },

  toggleRecipeMode: () => set((state) => ({ recipeMode: !state.recipeMode })),
  setPersonaTone: (tone) => set({ personaTone: tone }),

  refreshPersona: async (plantId) => {
    const { readingsByPlant, personaTone } = get();
    const latest = (readingsByPlant[plantId] ?? []).at(-1);
    if (!latest) {
      return;
    }

    const payload = {
      plantId,
      tone: personaTone,
      snapshot: {
        pH: latest.pH,
        tds: latest.tds,
        do: latest.do,
        tempC: latest.tempC,
        humidity: latest.humidity,
        soilMoisture: latest.soilMoisture,
      },
      visionStatus:
        latest.tempC > 30
          ? "Possible heat stress visible"
          : "Leaves appear mostly healthy",
    };

    const response = await fetchJson<PersonaResponse>(
      "/api/llm/persona",
      payload,
    );
    const msg: PersonaMessage = {
      id: randomId("persona"),
      plantId,
      timestamp: Date.now(),
      tone: personaTone,
      state: response.state,
      message: response.message,
      sensorSnapshotRef: latest.id,
    };

    const inbox: InboxMessage = {
      id: randomId("inbox"),
      plantId,
      createdAt: Date.now(),
      role: "plant",
      text: response.message,
      actionType: "persona-refresh",
    };

    await Promise.all([
      repository.persona.put(msg),
      repository.inbox.put(inbox),
    ]);

    set((state) => ({
      personaByPlant: {
        ...state.personaByPlant,
        [plantId]: [...(state.personaByPlant[plantId] ?? []), msg].slice(-40),
      },
      inboxByPlant: {
        ...state.inboxByPlant,
        [plantId]: [...(state.inboxByPlant[plantId] ?? []), inbox].slice(-120),
      },
    }));
  },

  requestRootCause: async (anomaly) => {
    return fetchJson<RootCauseResponse>("/api/llm/root-cause", {
      plantId: anomaly.plantId,
      anomaly: anomaly.patternType,
      topSignals: anomaly.likelyCauses,
    });
  },

  runTimeTravelNarrative: async (
    plantId,
    horizonHours,
    summary,
    interventions,
  ) => {
    return fetchJson<PredictiveResponse>("/api/llm/predictive", {
      plantId,
      horizonHours,
      forecastSummary: summary,
      interventions,
    });
  },

  analyzeDisease: async (plantId, imageDataUrlOrBlobKey, imageMeta) => {
    const mock = mockDiseaseClassification();

    const llm = await fetchJson<DiseaseResponse>("/api/llm/disease", {
      plantId,
      label: mock.label,
      confidence: mock.confidence,
      imageMeta,
    });

    const scan: DiseaseScan = {
      id: randomId("scan"),
      plantId,
      createdAt: Date.now(),
      imageDataUrlOrBlobKey,
      mockLabel: mock.label,
      confidence: mock.confidence,
      llmNarrative: llm.explanation,
      treatmentPlan: llm.treatmentPlan,
      safetyWarnings: llm.safetyWarnings,
    };

    await repository.disease.put(scan);

    set((state) => ({
      diseaseByPlant: {
        ...state.diseaseByPlant,
        [plantId]: [...(state.diseaseByPlant[plantId] ?? []), scan].slice(-24),
      },
    }));

    return scan;
  },

  runOperatorBrief: async () => {
    const { plants, readingsByPlant, alerts } = get();
    const topAlerts = alerts
      .slice(-6)
      .map((a) => `${a.severity.toUpperCase()}: ${a.title}`);

    const plantSummaries = plants.slice(0, 12).map((plant) => {
      const latest = (readingsByPlant[plant.id] ?? []).at(-1);
      if (!latest) {
        return `${plant.name} has no recent telemetry.`;
      }
      return `${plant.name} ${plant.stage} | pH ${latest.pH.toFixed(2)} | TDS ${Math.round(latest.tds)} | DO ${latest.do.toFixed(1)}`;
    });

    const llm = await fetchJson<OperatorBriefResponse>(
      "/api/llm/operator-brief",
      {
        scope: `Fleet size ${plants.length}`,
        plantSummaries,
        topAlerts,
      },
    );

    const brief: OpsBrief = {
      id: randomId("brief"),
      createdAt: Date.now(),
      scope: `fleet:${plants.length}`,
      summary: llm.summary,
      topRisks: llm.topRisks,
      actionChecklist: llm.actionChecklist,
    };

    await repository.ops.put(brief);
    set((state) => ({ opsBriefs: [brief, ...state.opsBriefs].slice(0, 16) }));

    return brief;
  },

  addInboxReply: async (plantId, text) => {
    const operatorMessage: InboxMessage = {
      id: randomId("inbox"),
      plantId,
      createdAt: Date.now(),
      role: "operator",
      text,
      actionType: "quick-reply",
    };
    const systemFollowup: InboxMessage = {
      id: randomId("inbox"),
      plantId,
      createdAt: Date.now() + 1,
      role: "system",
      text: `Control intent registered: ${text}. Forecast narrative will consider this intervention.`,
      actionType: "control-intent",
    };

    await Promise.all([
      repository.inbox.put(operatorMessage),
      repository.inbox.put(systemFollowup),
    ]);

    set((state) => ({
      inboxByPlant: {
        ...state.inboxByPlant,
        [plantId]: [
          ...(state.inboxByPlant[plantId] ?? []),
          operatorMessage,
          systemFollowup,
        ].slice(-120),
      },
    }));
  },

  exportAll: async () => {
    const bundle = await exportDemoData();
    const { downloadJson } = await import("@/lib/storage/importExport");
    downloadJson(`vera-demo-${Date.now()}.json`, bundle);
  },

  importAll: async (file, mode) => {
    const text = await file.text();
    const payload = JSON.parse(text);
    await importDemoData(payload, mode);
    await get().resetAll();
    await get().initialize();
  },

  resetAll: async () => {
    await repository.clearAll();
    set({
      hydrated: false,
      loading: false,
      plants: [],
      activePlantId: null,
      readingsByPlant: {},
      alerts: [],
      anomalies: [],
      forecastsByPlant: {},
      personaByPlant: {},
      diseaseByPlant: {},
      inboxByPlant: {},
      opsBriefs: [],
    });
  },
}));
