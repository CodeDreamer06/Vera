"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { SensorChart } from "@/components/charts/SensorChart";
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
import type { TimeTravelControls } from "@/types/domain";

const chartMetrics = [
  "pH",
  "tds",
  "do",
  "tempC",
  "humidity",
  "soilMoisture",
] as const;

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
  const personaMessages = activePlant
    ? (personaByPlant[activePlant.id] ?? [])
    : [];
  const diseaseScans = activePlant
    ? (diseaseByPlant[activePlant.id] ?? [])
    : [];
  const inboxMessages = activePlant ? (inboxByPlant[activePlant.id] ?? []) : [];

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
      title="Fleet Command Center"
      subtitle="Monitor many plants, predict issues early, and coordinate interventions with an LLM copilot."
      rightActions={
        <>
          <button
            type="button"
            className="neo-box neo-button"
            onClick={() =>
              startDemoMode(Number(process.env.NEXT_PUBLIC_MAX_PLANTS ?? 10))
            }
          >
            Start Demo Mode
          </button>
          <button
            type="button"
            className="neo-box neo-button neo-button-accent"
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
            className="neo-box neo-button"
            onClick={() => setPaletteOpen(true)}
          >
            Command Palette
          </button>
        </>
      }
    >
      {loading ? (
        <GlassCard>
          <p className="text-sm text-black/65">
            Initializing telemetry fabric...
          </p>
        </GlassCard>
      ) : (
        <>
          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 lg:grid-cols-[1.5fr_1fr]"
          >
            <GlassCard>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[var(--color-info)]" />
                  <h3 className="text-sm font-semibold">Multi-Plant Monitor</h3>
                  {recipeMode ? (
                    <Pill className="bg-[var(--color-accent)]">
                      Recipe mode active
                    </Pill>
                  ) : null}
                </div>
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  placeholder="Search plant, species, zone"
                  className="neo-input w-full max-w-sm px-3 py-1.5 text-sm outline-none focus:ring"
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
                        <h3 className="text-sm font-semibold text-black">
                          Live Telemetry • {activePlant.name}
                        </h3>
                        <p className="text-xs text-black/65">
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
                        className="neo-input px-2 py-1 text-xs"
                      >
                        {chartMetrics.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <SensorChart
                      readings={activeReadings.slice(-60)}
                      metric={metric}
                    />

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="neo-inset p-2">
                        pH {latestReading?.pH.toFixed(2) ?? "--"}
                      </div>
                      <div className="neo-inset p-2">
                        TDS{" "}
                        {latestReading ? Math.round(latestReading.tds) : "--"}
                      </div>
                      <div className="neo-inset p-2">
                        DO {latestReading?.do.toFixed(1) ?? "--"}
                      </div>
                      <div className="neo-inset p-2">
                        Temp {latestReading?.tempC.toFixed(1) ?? "--"}°C
                      </div>
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
                    <Bot size={15} className="text-[var(--color-info)]" />
                    <h3 className="text-sm font-semibold text-black">
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
                        className="neo-box mb-2 bg-[var(--color-accent)] p-3"
                      >
                        <div className="mb-1 flex items-center gap-2 text-black">
                          <TriangleAlert size={14} />
                          <p className="text-xs font-medium">{alert.title}</p>
                        </div>
                        <p className="text-xs text-black/75">
                          {alert.description}
                        </p>
                      </div>
                    ))}
                </GlassCard>
              </div>
            </motion.div>
          ) : (
            <GlassCard>
              <p className="text-sm text-black/65">No plants seeded yet.</p>
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
