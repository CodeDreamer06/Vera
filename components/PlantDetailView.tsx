"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { SensorChart } from "@/components/charts/SensorChart";
import { AppShell } from "@/components/layout/AppShell";
import { AnomalyFeed } from "@/components/panels/AnomalyFeed";
import { DiseasePanel } from "@/components/panels/DiseasePanel";
import { PersonaPanel } from "@/components/panels/PersonaPanel";
import { PlantInbox } from "@/components/panels/PlantInbox";
import { RecipeModePanel } from "@/components/panels/RecipeModePanel";
import { TimeTravelPanel } from "@/components/panels/TimeTravelPanel";
import { GlassCard } from "@/components/ui/Glass";
import { PanelErrorBoundary } from "@/components/ui/PanelErrorBoundary";
import { useAppStore } from "@/lib/store";
import type { TimeTravelControls } from "@/types/domain";

const metrics = [
  "pH",
  "tds",
  "do",
  "tempC",
  "humidity",
  "soilMoisture",
] as const;

export function PlantDetailView({ plantId }: { plantId: string }) {
  const {
    hydrated,
    initialize,
    plants,
    readingsByPlant,
    personaByPlant,
    anomalies,
    diseaseByPlant,
    inboxByPlant,
    recipeMode,
    personaTone,
    setPersonaTone,
    refreshPersona,
    analyzeDisease,
    requestRootCause,
    runTimeTravelNarrative,
    addInboxReply,
  } = useAppStore();

  const [metric, setMetric] = useState<(typeof metrics)[number]>("pH");

  useEffect(() => {
    initialize();
  }, [initialize]);

  const plant = useMemo(
    () => plants.find((p) => p.id === plantId),
    [plants, plantId],
  );
  const readings = readingsByPlant[plantId] ?? [];
  const latest = readings.at(-1);

  if (!hydrated) {
    return (
      <AppShell
        title="Plant Detail"
        subtitle="Loading telemetry and context..."
      >
        <GlassCard>
          <p className="text-sm text-white/70">Loading...</p>
        </GlassCard>
      </AppShell>
    );
  }

  if (!plant) {
    return (
      <AppShell
        title="Plant Detail"
        subtitle="Plant not found in local datastore."
      >
        <GlassCard>
          <p className="text-sm text-white/70">
            The requested plant ID is unavailable.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-lg border border-white/15 px-3 py-1.5 text-xs"
          >
            Back to fleet
          </Link>
        </GlassCard>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`${plant.name} Detail`}
      subtitle={`${plant.species} • ${plant.zone} • ${plant.stage}`}
    >
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <GlassCard>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Telemetry Timeline</h3>
              <select
                value={metric}
                onChange={(e) =>
                  setMetric(e.currentTarget.value as (typeof metrics)[number])
                }
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs"
              >
                {metrics.map((m) => (
                  <option key={m} value={m} className="bg-slate-900">
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <SensorChart readings={readings.slice(-80)} metric={metric} />
          </GlassCard>

          <PanelErrorBoundary panel="anomalies" plantId={plantId}>
            <AnomalyFeed
              anomalies={anomalies.filter((a) => a.plantId === plantId)}
              onExplain={requestRootCause}
            />
          </PanelErrorBoundary>

          <PanelErrorBoundary panel="inbox" plantId={plantId}>
            <PlantInbox
              messages={inboxByPlant[plantId] ?? []}
              onReply={(text) => addInboxReply(plantId, text)}
            />
          </PanelErrorBoundary>
        </div>

        <div className="space-y-4">
          <PanelErrorBoundary panel="persona" plantId={plantId}>
            <PersonaPanel
              messages={personaByPlant[plantId] ?? []}
              tone={personaTone}
              onTone={setPersonaTone}
              onRefresh={() => refreshPersona(plantId)}
            />
          </PanelErrorBoundary>

          {recipeMode ? (
            <PanelErrorBoundary panel="recipe-mode" plantId={plantId}>
              <RecipeModePanel
                plant={plant}
                latest={latest}
                onExplain={async (summary, interventions) => {
                  const response = await runTimeTravelNarrative(
                    plantId,
                    24,
                    summary,
                    interventions,
                  );
                  return `${response.narrative} ${response.likelyImpact}`;
                }}
              />
            </PanelErrorBoundary>
          ) : null}

          <PanelErrorBoundary panel="time-travel" plantId={plantId}>
            <TimeTravelPanel
              latest={latest}
              onNarrate={async (controls: TimeTravelControls, summary) => {
                const interventions = [
                  controls.increaseAeration ? "Increase aeration" : null,
                  controls.reduceTemp ? "Lower temp 2C" : null,
                  controls.rebalanceNutrients ? "Rebalance nutrients" : null,
                ].filter(Boolean) as string[];
                const response = await runTimeTravelNarrative(
                  plantId,
                  controls.day * 24,
                  summary,
                  interventions,
                );
                return `${response.narrative} ${response.likelyImpact}`;
              }}
            />
          </PanelErrorBoundary>

          <PanelErrorBoundary panel="disease" plantId={plantId}>
            <DiseasePanel
              plantId={plantId}
              scans={diseaseByPlant[plantId] ?? []}
              onAnalyze={async ({
                plantId: current,
                imageDataUrlOrBlobKey,
                imageMeta,
              }) => {
                await analyzeDisease(current, imageDataUrlOrBlobKey, imageMeta);
                toast.success("Disease scan completed");
              }}
            />
          </PanelErrorBoundary>
        </div>
      </div>
    </AppShell>
  );
}
