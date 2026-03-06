"use client";

import { Activity, ArrowLeft, Terminal } from "lucide-react";
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
import { GlassCard, Pill } from "@/components/ui/Glass";
import { PanelErrorBoundary } from "@/components/ui/PanelErrorBoundary";
import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();
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
        title={t("unitDetail")}
        subtitle={t("loadingTelemetrySubtitle")}
      >
        <div className="neo-box bg-white p-8 text-center">
          <div className="font-mono text-sm uppercase tracking-wider">
            <span className="cursor-blink">{t("loadingTelemetry")}</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!plant) {
    return (
      <AppShell
        title={t("unitNotFound")}
        subtitle={t("unitUnavailable")}
      >
        <div className="neo-box bg-white p-8 text-center">
          <div className="text-4xl mb-4">◉</div>
          <p className="font-mono text-sm uppercase text-black/65">
            {t("unitIdNotFound")}
          </p>
          <Link
            href="/"
            className="neo-box neo-button mt-6 inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            {t("returnToFleet")}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`${plant.name} // DETAIL_VIEW`}
      subtitle={`${plant.species.toUpperCase()} • ${plant.zone.toUpperCase()} • ${plant.stage.toUpperCase()}`}
      rightActions={
        <Link
          href="/"
          className="neo-box neo-button flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          {t("backToFleet")}
        </Link>
      }
    >
      {/* Unit Status Header */}
      <div className="neo-box bg-black text-white p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={20} className="text-[var(--color-accent)]" />
            <span className="font-mono text-xs uppercase text-[var(--color-accent)]">
              {t("unitIdLabel")}
            </span>
            <span className="font-black text-xl uppercase tracking-tight">
              {plant.name}
            </span>
            <span className="neo-pill bg-white text-black">
              {plant.species}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[var(--color-accent)]" />
              <span className="font-mono text-xs uppercase">
                {t("healthLabel", { value: plant.healthScore })}
              </span>
            </div>
            <span className="status-dot active" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Telemetry Chart */}
          <GlassCard>
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[var(--color-info)]" />
                <h3 className="panel-title">Telemetry_Timeline</h3>
              </div>
              <select
                value={metric}
                onChange={(e) =>
                  setMetric(e.currentTarget.value as (typeof metrics)[number])
                }
                className="neo-input px-3 py-1.5 text-xs"
              >
                {metrics.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <SensorChart readings={readings.slice(-80)} metric={metric} />
            
            {/* Latest Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="neo-inset p-3 text-center">
                <div className="text-[10px] font-mono uppercase opacity-50 mb-1">pH_Lvl</div>
                <div className="text-xl font-black seven-seg">{latest?.pH.toFixed(2) ?? "--"}</div>
              </div>
              <div className="neo-inset p-3 text-center bg-[var(--color-accent)]">
                <div className="text-[10px] font-mono uppercase mb-1">TDS</div>
                <div className="text-xl font-black seven-seg">{latest ? Math.round(latest.tds) : "--"}</div>
              </div>
              <div className="neo-inset p-3 text-center">
                <div className="text-[10px] font-mono uppercase opacity-50 mb-1">DO</div>
                <div className="text-xl font-black seven-seg">{latest?.do.toFixed(1) ?? "--"}</div>
              </div>
              <div className="neo-inset p-3 text-center">
                <div className="text-[10px] font-mono uppercase opacity-50 mb-1">TEMP</div>
                <div className="text-xl font-black seven-seg">{latest?.tempC.toFixed(1) ?? "--"}°C</div>
              </div>
            </div>
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

        <div className="space-y-6">
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
                toast.success(t("diseaseScanCompleted"));
              }}
            />
          </PanelErrorBoundary>
        </div>
      </div>
    </AppShell>
  );
}
