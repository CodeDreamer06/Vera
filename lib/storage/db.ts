import Dexie, { type EntityTable } from "dexie";

import type {
  Alert,
  Anomaly,
  DiseaseScan,
  Forecast,
  InboxMessage,
  OpsBrief,
  PersonaMessage,
  Plant,
  SensorReading,
  UiEvent,
} from "@/types/domain";

export interface VeraDB extends Dexie {
  plants: EntityTable<Plant, "id">;
  sensor_readings: EntityTable<SensorReading, "id">;
  alerts: EntityTable<Alert, "id">;
  anomalies: EntityTable<Anomaly, "id">;
  persona_messages: EntityTable<PersonaMessage, "id">;
  forecasts: EntityTable<Forecast, "id">;
  disease_scans: EntityTable<DiseaseScan, "id">;
  inbox_messages: EntityTable<InboxMessage, "id">;
  ops_briefs: EntityTable<OpsBrief, "id">;
  ui_events: EntityTable<UiEvent, "id">;
}

export const db = new Dexie("vera-command-center") as VeraDB;

db.version(1).stores({
  plants: "id, zone, stage, updatedAt",
  sensor_readings:
    "id, plantId, timestamp, [plantId+timestamp], pH, tds, do, tempC, humidity",
  alerts: "id, plantId, severity, status, createdAt, [plantId+status]",
  anomalies: "id, plantId, metric, detectedAt",
  persona_messages: "id, plantId, timestamp, tone",
  forecasts: "id, plantId, createdAt",
  disease_scans: "id, plantId, createdAt",
  inbox_messages: "id, plantId, createdAt, role",
  ops_briefs: "id, createdAt",
  ui_events: "id, timestamp, eventType",
});
