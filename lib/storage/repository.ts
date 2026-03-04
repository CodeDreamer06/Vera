import { db } from "@/lib/storage/db";
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

export const repository = {
  plants: {
    getAll: () => db.plants.orderBy("updatedAt").reverse().toArray(),
    getById: (id: string) => db.plants.get(id),
    putMany: (plants: Plant[]) => db.plants.bulkPut(plants),
    put: (plant: Plant) => db.plants.put(plant),
    clear: () => db.plants.clear(),
  },
  readings: {
    getRecentForPlant: async (plantId: string, limit = 120) => {
      const rows = await db.sensor_readings
        .where("plantId")
        .equals(plantId)
        .reverse()
        .limit(limit)
        .toArray();
      return rows.reverse();
    },
    getLatestForPlant: async (plantId: string) => {
      const [row] = await db.sensor_readings
        .where("plantId")
        .equals(plantId)
        .reverse()
        .limit(1)
        .toArray();
      return row;
    },
    putMany: (rows: SensorReading[]) => db.sensor_readings.bulkPut(rows),
    clear: () => db.sensor_readings.clear(),
  },
  alerts: {
    getOpen: () =>
      db.alerts
        .where("status")
        .notEqual("resolved")
        .reverse()
        .sortBy("createdAt"),
    getForPlant: (plantId: string) =>
      db.alerts.where("plantId").equals(plantId).reverse().sortBy("createdAt"),
    putMany: (rows: Alert[]) => db.alerts.bulkPut(rows),
    put: (row: Alert) => db.alerts.put(row),
    clear: () => db.alerts.clear(),
  },
  anomalies: {
    getRecent: () => db.anomalies.orderBy("detectedAt").reverse().toArray(),
    getForPlant: (plantId: string) =>
      db.anomalies
        .where("plantId")
        .equals(plantId)
        .reverse()
        .sortBy("detectedAt"),
    putMany: (rows: Anomaly[]) => db.anomalies.bulkPut(rows),
    put: (row: Anomaly) => db.anomalies.put(row),
    clear: () => db.anomalies.clear(),
  },
  persona: {
    getForPlant: (plantId: string) =>
      db.persona_messages
        .where("plantId")
        .equals(plantId)
        .reverse()
        .sortBy("timestamp"),
    put: (row: PersonaMessage) => db.persona_messages.put(row),
    putMany: (rows: PersonaMessage[]) => db.persona_messages.bulkPut(rows),
    clear: () => db.persona_messages.clear(),
  },
  forecasts: {
    getForPlant: (plantId: string) =>
      db.forecasts
        .where("plantId")
        .equals(plantId)
        .reverse()
        .sortBy("createdAt"),
    put: (row: Forecast) => db.forecasts.put(row),
    putMany: (rows: Forecast[]) => db.forecasts.bulkPut(rows),
    clear: () => db.forecasts.clear(),
  },
  disease: {
    getForPlant: (plantId: string) =>
      db.disease_scans
        .where("plantId")
        .equals(plantId)
        .reverse()
        .sortBy("createdAt"),
    put: (row: DiseaseScan) => db.disease_scans.put(row),
    clear: () => db.disease_scans.clear(),
  },
  inbox: {
    getForPlant: (plantId: string) =>
      db.inbox_messages
        .where("plantId")
        .equals(plantId)
        .reverse()
        .sortBy("createdAt"),
    put: (row: InboxMessage) => db.inbox_messages.put(row),
    putMany: (rows: InboxMessage[]) => db.inbox_messages.bulkPut(rows),
    clear: () => db.inbox_messages.clear(),
  },
  ops: {
    list: () => db.ops_briefs.orderBy("createdAt").reverse().toArray(),
    put: (row: OpsBrief) => db.ops_briefs.put(row),
    clear: () => db.ops_briefs.clear(),
  },
  events: {
    list: () => db.ui_events.orderBy("timestamp").reverse().toArray(),
    put: (row: UiEvent) => db.ui_events.put(row),
    clear: () => db.ui_events.clear(),
  },
  clearAll: async () => {
    await db.transaction("rw", db.tables, async () => {
      await Promise.all([
        db.plants.clear(),
        db.sensor_readings.clear(),
        db.alerts.clear(),
        db.anomalies.clear(),
        db.persona_messages.clear(),
        db.forecasts.clear(),
        db.disease_scans.clear(),
        db.inbox_messages.clear(),
        db.ops_briefs.clear(),
        db.ui_events.clear(),
      ]);
    });
  },
};
