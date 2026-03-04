"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  Droplets,
  FlaskConical,
  Sparkles,
  Sun,
  Thermometer,
  TriangleAlert,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { SensorChart } from "@/components/charts/SensorChart";
import { SensorMetricCard } from "@/components/dashboard/SensorMetricCard";
import { AppShell } from "@/components/layout/AppShell";
import { PlantCard } from "@/components/PlantCard";
import { AlertsCenter } from "@/components/panels/AlertsCenter";
import { AnomalyFeed } from "@/components/panels/AnomalyFeed";
import { DiseasePanel } from "@/components/panels/DiseasePanel";
import { OperatorBriefPanel } from "@/components/panels/OperatorBriefPanel";
import { PersonaPanel } from "@/components/panels/PersonaPanel";
import { PlantInbox } from "@/components/panels/PlantInbox";
import { RecipeModePanel } from "@/components/panels/RecipeModePanel";
import { TimeTravelPanel } from "@/components/panels/TimeTravelPanel";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { GlassCard, Pill } from "@/components/ui/Glass";
import { PanelErrorBoundary } from "@/components/ui/PanelErrorBoundary";
import { ShortcutsDialog } from "@/components/ui/ShortcutsDialog";
import { useShortcutBindings } from "@/lib/shortcuts/useShortcutBindings";
import { useAppStore } from "@/lib/store";
import type { SensorReading, TimeTravelControls } from "@/types/domain";

const chartMetrics = [
  "pH",
  "tds",
  "do",
  "tempC",
  "humidity",
  "soilMoisture",
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getMetricStatus = (
  value: number,
  low: number,
  high: number,
  warningPad: number,
): "good" | "warn" | "critical" => {
  if (value < low || value > high) {
    return "critical";
  }

  if (value < low + warningPad || value > high - warningPad) {
    return "warn";
  }

  return "good";
};

const dashboardMetrics = (reading?: SensorReading) => {
  if (!reading) {
    return {
      tempC: null,
      humidity: null,
      pH: null,
      waterLevel: null,
      lightLux: null,
    };
  }

  const waterLevel = clamp(
    100 -
      ((reading.waterUsageMl - 40) / (450 - 40)) * 58 +
      (reading.soilMoisture - 55) * 0.35,
    0,
    100,
  );
  const lightLux = clamp(
    17500 + reading.tds * 8 + (reading.tempC - 22) * 520,
    9000,
    36000,
  );

  return {
    tempC: reading.tempC,
    humidity: reading.humidity,
    pH: reading.pH,
    waterLevel,
    lightLux,
  };
};

export function FleetDashboard() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<HTMLSelectElement>(null);

  const {
    hydrated,
    loading,
    plants,
    activePlantId,
    readingsByPlant,
    alerts,
    anomalies,
    personaByPlant,
    diseaseByPlant,
    inboxByPlant,
    opsBriefs,
    recipeMode,
    personaTone,
    initialize,
    startDemoMode,
    setActivePlant,
    tickSensors,
    injectDemoAnomaly,
    toggleRecipeMode,
    setPersonaTone,
    refreshPersona,
    requestRootCause,
    runTimeTravelNarrative,
    analyzeDisease,
    runOperatorBrief,
    addInboxReply,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [showTimeTravel, setShowTimeTravel] = useState(true);
  const [showDisease, setShowDisease] = useState(true);
  const [opsLoading, setOpsLoading] = useState(false);
  const [metric, setMetric] = useState<(typeof chartMetrics)[number]>("pH");

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const tickMs = Number(process.env.NEXT_PUBLIC_SENSOR_TICK_MS ?? 8000);
    const timer = window.setInterval(() => {
      tickSensors().catch((error) => {
        toast.error(`Simulation tick failed: ${(error as Error).message}`);
      });
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [hydrated, tickSensors]);

  const filteredPlants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return plants;
    }
    return plants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.species.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q),
    );
  }, [plants, search]);

  const activePlant =
    plants.find((p) => p.id === activePlantId) ??
    (plants.length > 0 ? plants[0] : undefined);
  const activeReadings = activePlant
    ? (readingsByPlant[activePlant.id] ?? [])
    : [];
  const latestReading = activeReadings.at(-1);
  const hydro = dashboardMetrics(latestReading);
  const personaMessages = activePlant
    ? (personaByPlant[activePlant.id] ?? [])
    : [];
  const diseaseScans = activePlant
    ? (diseaseByPlant[activePlant.id] ?? [])
    : [];
  const inboxMessages = activePlant ? (inboxByPlant[activePlant.id] ?? []) : [];
  const totalCriticalAlerts = alerts.filter(
    (alert) => alert.status === "open" && alert.severity === "critical",
  ).length;
  const totalPlantsOnline = plants.filter(
    (plant) => (readingsByPlant[plant.id] ?? []).length > 0,
  ).length;

  useShortcutBindings({
    onPalette: () => setPaletteOpen(true),
    onShortcuts: () => setShortcutsOpen(true),
    onSearch: () => searchRef.current?.focus(),
    onPrevPlant: () => {
      if (plants.length === 0) {
        return;
      }

      const idx = plants.findIndex((p) => p.id === activePlant?.id);
      const next = idx <= 0 ? plants[plants.length - 1] : plants[idx - 1];
      if (next) {
        setActivePlant(next.id);
      }
    },
    onNextPlant: () => {
      if (plants.length === 0) {
        return;
      }

      const idx = plants.findIndex((p) => p.id === activePlant?.id);
      const next = idx >= plants.length - 1 ? plants[0] : plants[idx + 1];
      if (next) {
        setActivePlant(next.id);
      }
    },
    onAlerts: () => setAlertsOpen(true),
    onTimeTravel: () => setShowTimeTravel((v) => !v),
    onRange: () => rangeRef.current?.focus(),
    onDisease: () => setShowDisease((v) => !v),
    onAnomaly: () => {
      injectDemoAnomaly().then(() => toast.success("Demo anomaly injected"));
    },
    onRecipe: () => toggleRecipeMode(),
    onSettings: () => router.push("/settings"),
  });

  return (
    <AppShell
      title="Hydroponic Monitoring Dashboard"
      subtitle="Track live mock telemetry, inspect plant health, and act on early warnings."
      rightActions={
        <>
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
            onClick={() =>
              startDemoMode(Number(process.env.NEXT_PUBLIC_MAX_PLANTS ?? 10))
            }
          >
            Start Demo Mode
          </button>
          <button
            type="button"
            className="rounded-lg border border-amber-300/35 bg-amber-500/15 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-500/25"
            onClick={async () => {
              setOpsLoading(true);
              try {
                await runOperatorBrief();
                toast.success("Operator briefing generated");
              } catch (error) {
                toast.error((error as Error).message);
              } finally {
                setOpsLoading(false);
              }
            }}
          >
            {opsLoading ? "Working..." : "Morning Ops Brief"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
            onClick={() => setPaletteOpen(true)}
          >
            Command Palette
          </button>
        </>
      }
    >
      {loading ? (
        <GlassCard>
          <p className="text-sm text-white/70">
            Initializing telemetry fabric...
          </p>
        </GlassCard>
      ) : (
        <>
          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 lg:grid-cols-[1.15fr_1fr]"
          >
            <GlassCard>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/70">
                    Hydroponic Monitoring Dashboard
                  </p>
                  <h3 className="font-display text-xl font-semibold tracking-tight">
                    Live greenhouse overview
                  </h3>
                </div>
                <Pill className="border-cyan-300/35 bg-cyan-500/15 text-cyan-100">
                  <Activity size={12} className="mr-1" />
                  Mock stream active
                </Pill>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                    Plants online
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold">
                    {totalPlantsOnline}/{plants.length}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                    Open alerts
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold">
                    {alerts.filter((alert) => alert.status === "open").length}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                    Critical alerts
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-rose-200">
                    {totalCriticalAlerts}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="mb-3">
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/75">
                  Active zone
                </p>
                <h3 className="font-display text-lg font-semibold">
                  {activePlant
                    ? `${activePlant.name} • ${activePlant.zone}`
                    : "No active plant"}
                </h3>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <SensorMetricCard
                  label="Temperature"
                  value={hydro.tempC === null ? "--" : hydro.tempC.toFixed(1)}
                  unit="°C"
                  hint="Target 20-27°C"
                  status={
                    hydro.tempC === null
                      ? "warn"
                      : getMetricStatus(hydro.tempC, 20, 27, 1)
                  }
                  icon={Thermometer}
                />
                <SensorMetricCard
                  label="Humidity"
                  value={
                    hydro.humidity === null ? "--" : hydro.humidity.toFixed(0)
                  }
                  unit="%"
                  hint="Target 50-75%"
                  status={
                    hydro.humidity === null
                      ? "warn"
                      : getMetricStatus(hydro.humidity, 50, 75, 4)
                  }
                  icon={Droplets}
                />
                <SensorMetricCard
                  label="pH"
                  value={hydro.pH === null ? "--" : hydro.pH.toFixed(2)}
                  unit=""
                  hint="Target 5.8-6.4"
                  status={
                    hydro.pH === null
                      ? "warn"
                      : getMetricStatus(hydro.pH, 5.8, 6.4, 0.12)
                  }
                  icon={FlaskConical}
                />
                <SensorMetricCard
                  label="Water Level"
                  value={
                    hydro.waterLevel === null
                      ? "--"
                      : hydro.waterLevel.toFixed(0)
                  }
                  unit="%"
                  hint="Estimated reservoir fullness"
                  status={
                    hydro.waterLevel === null
                      ? "warn"
                      : getMetricStatus(hydro.waterLevel, 38, 95, 8)
                  }
                  icon={Waves}
                />
                <SensorMetricCard
                  label="Light Intensity"
                  value={
                    hydro.lightLux === null
                      ? "--"
                      : Math.round(hydro.lightLux).toString()
                  }
                  unit="lux"
                  hint="Estimated grow-light output"
                  status={
                    hydro.lightLux === null
                      ? "warn"
                      : getMetricStatus(hydro.lightLux, 14000, 32000, 1800)
                  }
                  icon={Sun}
                />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 lg:grid-cols-[1.5fr_1fr]"
          >
            <GlassCard>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-cyan-300" />
                  <h3 className="text-sm font-semibold">Multi-Plant Monitor</h3>
                  {recipeMode ? (
                    <Pill className="border-emerald-300/30 bg-emerald-500/15 text-emerald-100">
                      Recipe mode active
                    </Pill>
                  ) : null}
                </div>
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  placeholder="Search plant, species, zone"
                  className="w-full max-w-sm rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm outline-none ring-cyan-300/40 placeholder:text-white/40 focus:ring"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    latest={(readingsByPlant[plant.id] ?? []).at(-1)}
                    persona={(personaByPlant[plant.id] ?? []).at(-1)}
                    onFocus={() => setActivePlant(plant.id)}
                  />
                ))}
              </div>
            </GlassCard>

            <PanelErrorBoundary panel="operator-brief">
              <OperatorBriefPanel
                briefs={opsBriefs}
                loading={opsLoading}
                onGenerate={async () => {
                  setOpsLoading(true);
                  try {
                    await runOperatorBrief();
                  } finally {
                    setOpsLoading(false);
                  }
                }}
              />
            </PanelErrorBoundary>
          </motion.div>

          {activePlant ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 xl:grid-cols-[1.6fr_1fr]"
            >
              <div className="space-y-4">
                <PanelErrorBoundary
                  panel="sensor-chart"
                  plantId={activePlant.id}
                >
                  <GlassCard>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Live Telemetry • {activePlant.name}
                        </h3>
                        <p className="text-xs text-white/60">
                          Incoming simulated data with noise, drift, and
                          anomalies
                        </p>
                      </div>
                      <select
                        ref={rangeRef}
                        value={metric}
                        onChange={(e) =>
                          setMetric(
                            e.currentTarget
                              .value as (typeof chartMetrics)[number],
                          )
                        }
                        className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs"
                      >
                        {chartMetrics.map((m) => (
                          <option key={m} value={m} className="bg-slate-900">
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <SensorChart
                      readings={activeReadings.slice(-60)}
                      metric={metric}
                    />

                    <div className="mt-3 grid gap-2 md:grid-cols-5">
                      <SensorMetricCard
                        label="Temperature"
                        value={
                          hydro.tempC === null ? "--" : hydro.tempC.toFixed(1)
                        }
                        unit="°C"
                        hint="Target 20-27°C"
                        status={
                          hydro.tempC === null
                            ? "warn"
                            : getMetricStatus(hydro.tempC, 20, 27, 1)
                        }
                        icon={Thermometer}
                      />
                      <SensorMetricCard
                        label="Humidity"
                        value={
                          hydro.humidity === null
                            ? "--"
                            : hydro.humidity.toFixed(0)
                        }
                        unit="%"
                        hint="Target 50-75%"
                        status={
                          hydro.humidity === null
                            ? "warn"
                            : getMetricStatus(hydro.humidity, 50, 75, 4)
                        }
                        icon={Droplets}
                      />
                      <SensorMetricCard
                        label="pH"
                        value={hydro.pH === null ? "--" : hydro.pH.toFixed(2)}
                        unit=""
                        hint="Target 5.8-6.4"
                        status={
                          hydro.pH === null
                            ? "warn"
                            : getMetricStatus(hydro.pH, 5.8, 6.4, 0.12)
                        }
                        icon={FlaskConical}
                      />
                      <SensorMetricCard
                        label="Water Level"
                        value={
                          hydro.waterLevel === null
                            ? "--"
                            : hydro.waterLevel.toFixed(0)
                        }
                        unit="%"
                        hint="Estimated reservoir fullness"
                        status={
                          hydro.waterLevel === null
                            ? "warn"
                            : getMetricStatus(hydro.waterLevel, 38, 95, 8)
                        }
                        icon={Waves}
                      />
                      <SensorMetricCard
                        label="Light Intensity"
                        value={
                          hydro.lightLux === null
                            ? "--"
                            : Math.round(hydro.lightLux).toString()
                        }
                        unit="lux"
                        hint="Estimated grow-light output"
                        status={
                          hydro.lightLux === null
                            ? "warn"
                            : getMetricStatus(
                                hydro.lightLux,
                                14000,
                                32000,
                                1800,
                              )
                        }
                        icon={Sun}
                      />
                    </div>
                  </GlassCard>
                </PanelErrorBoundary>

                <PanelErrorBoundary
                  panel="anomaly-feed"
                  plantId={activePlant.id}
                >
                  <AnomalyFeed
                    anomalies={anomalies.filter(
                      (anomaly) => anomaly.plantId === activePlant.id,
                    )}
                    onExplain={requestRootCause}
                  />
                </PanelErrorBoundary>

                <PanelErrorBoundary panel="inbox" plantId={activePlant.id}>
                  <PlantInbox
                    messages={inboxMessages}
                    onReply={(text) => addInboxReply(activePlant.id, text)}
                  />
                </PanelErrorBoundary>
              </div>

              <div className="space-y-4">
                <PanelErrorBoundary panel="persona" plantId={activePlant.id}>
                  <PersonaPanel
                    messages={personaMessages}
                    tone={personaTone}
                    onTone={setPersonaTone}
                    onRefresh={() => refreshPersona(activePlant.id)}
                  />
                </PanelErrorBoundary>

                {recipeMode ? (
                  <PanelErrorBoundary
                    panel="recipe-mode"
                    plantId={activePlant.id}
                  >
                    <RecipeModePanel
                      plant={activePlant}
                      latest={latestReading}
                      onExplain={async (summary, interventions) => {
                        const response = await runTimeTravelNarrative(
                          activePlant.id,
                          24,
                          summary,
                          interventions,
                        );
                        return `${response.narrative} ${response.likelyImpact}`;
                      }}
                    />
                  </PanelErrorBoundary>
                ) : null}

                {showTimeTravel ? (
                  <PanelErrorBoundary
                    panel="time-travel"
                    plantId={activePlant.id}
                  >
                    <TimeTravelPanel
                      latest={latestReading}
                      onNarrate={async (
                        controls: TimeTravelControls,
                        summary: string,
                      ) => {
                        const interventions = [
                          controls.increaseAeration
                            ? "Increase aeration"
                            : null,
                          controls.reduceTemp
                            ? "Lower temperature by 2C"
                            : null,
                          controls.rebalanceNutrients
                            ? "Rebalance nutrient mix"
                            : null,
                        ].filter(Boolean) as string[];

                        const response = await runTimeTravelNarrative(
                          activePlant.id,
                          controls.day * 24,
                          summary,
                          interventions,
                        );

                        return `${response.narrative} ${response.likelyImpact}`;
                      }}
                    />
                  </PanelErrorBoundary>
                ) : null}

                {showDisease ? (
                  <PanelErrorBoundary panel="disease" plantId={activePlant.id}>
                    <DiseasePanel
                      plantId={activePlant.id}
                      scans={diseaseScans}
                      onAnalyze={async ({
                        plantId,
                        imageDataUrlOrBlobKey,
                        imageMeta,
                      }) => {
                        await analyzeDisease(
                          plantId,
                          imageDataUrlOrBlobKey,
                          imageMeta,
                        );
                        toast.success("Disease triage card updated");
                      }}
                    />
                  </PanelErrorBoundary>
                ) : null}

                <GlassCard>
                  <div className="mb-2 flex items-center gap-2">
                    <Bot size={15} className="text-cyan-300" />
                    <h3 className="text-sm font-semibold text-white">
                      Predictive Watch
                    </h3>
                  </div>
                  {alerts
                    .slice()
                    .reverse()
                    .filter(
                      (alert) =>
                        alert.type === "predictive" &&
                        alert.plantId === activePlant.id,
                    )
                    .slice(0, 2)
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="mb-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3"
                      >
                        <div className="mb-1 flex items-center gap-2 text-amber-100">
                          <TriangleAlert size={14} />
                          <p className="text-xs font-medium">{alert.title}</p>
                        </div>
                        <p className="text-xs text-amber-50/90">
                          {alert.description}
                        </p>
                      </div>
                    ))}
                </GlassCard>
              </div>
            </motion.div>
          ) : (
            <GlassCard>
              <p className="text-sm text-white/70">No plants seeded yet.</p>
            </GlassCard>
          )}
        </>
      )}

      <AlertsCenter
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        alerts={alerts}
        personaByPlant={personaByPlant}
      />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        plants={plants}
        onRunAnomaly={() => injectDemoAnomaly()}
        onOpenAlerts={() => setAlertsOpen(true)}
        onOpenDisease={() => setShowDisease(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onRunBrief={() => {
          setOpsLoading(true);
          runOperatorBrief().finally(() => setOpsLoading(false));
        }}
      />

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </AppShell>
  );
}
