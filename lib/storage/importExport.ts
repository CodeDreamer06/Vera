import { db } from "@/lib/storage/db";

const SCHEMA_VERSION = 1;

export interface ExportBundle {
  schemaVersion: number;
  exportedAt: number;
  data: Record<string, unknown[]>;
}

const tables = [
  "plants",
  "sensor_readings",
  "alerts",
  "anomalies",
  "persona_messages",
  "forecasts",
  "disease_scans",
  "inbox_messages",
  "ops_briefs",
  "ui_events",
] as const;

export const exportDemoData = async (): Promise<ExportBundle> => {
  const data: Record<string, unknown[]> = {};

  await Promise.all(
    tables.map(async (tableName) => {
      const table = db.table(tableName);
      data[tableName] = await table.toArray();
    }),
  );

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    data,
  };
};

export const importDemoData = async (
  payload: ExportBundle,
  mode: "merge" | "replace" = "merge",
) => {
  if (payload.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(
      `Schema mismatch. Expected ${SCHEMA_VERSION}, got ${payload.schemaVersion}`,
    );
  }

  await db.transaction("rw", db.tables, async () => {
    if (mode === "replace") {
      await Promise.all(db.tables.map((t) => t.clear()));
    }

    await Promise.all(
      tables.map(async (tableName) => {
        const rows = payload.data[tableName] ?? [];
        if (rows.length > 0) {
          await db.table(tableName).bulkPut(rows);
        }
      }),
    );
  });
};

export const downloadJson = (fileName: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
};
