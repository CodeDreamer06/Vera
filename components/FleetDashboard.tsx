"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles, Terminal, TriangleAlert } from "lucide-react";
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
import { TerminalPanel } from "@/components/panels/TerminalPanel";
import { TimeTravelPanel } from "@/components/panels/TimeTravelPanel";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { GlassCard, Pill } from "@/components/ui/Glass";
import { PanelErrorBoundary } from "@/components/ui/PanelErrorBoundary";
import { ShortcutsDialog } from "@/components/ui/ShortcutsDialog";
import { useShortcutBindings } from "@/lib/shortcuts/useShortcutBindings";
import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();
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

  // Terminal output content
  const alertCount = alerts.filter(a => a.severity === "high" || a.severity === "critical").length;
  const activeCount = plants.length;

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
      injectDemoAnomaly().then(() => toast.success(t("demoAnomalyInjected")));
    },
    onRecipe: () => toggleRecipeMode(),
    onSettings: () => router.push("/settings"),
  });

  return (
    <AppShell
      title={t("fleetTitle")}
      subtitle={t("fleetSubtitle")}
      rightActions={
        <>
          <button
            type="button"
            className="neo-box neo-button neo-button-alert font-black"
            onClick={() =>
              startDemoMode(Number(process.env.NEXT_PUBLIC_MAX_PLANTS ?? 9))
            }
          >
            {t("startDemo")}
          </button>
          <button
            type="button"
            className="neo-box neo-button neo-button-accent font-black"
            onClick={async () => {
              setOpsLoading(true);
              try {
                await runOperatorBrief();
                toast.success(t("operatorBriefGenerated"));
              } catch (error) {
                toast.error((error as Error).message);
              } finally {
                setOpsLoading(false);
              }
            }}
          >
            {opsLoading ? t("processing") : t("morningOps")}
          </button>
          <button
            type="button"
            className="neo-box neo-button-dark text-white font-black p-2"
            onClick={() => setPaletteOpen(true)}
          >
            ⌘_Palette
          </button>
        </>
      }
    >
      {loading ? (
            <div className="neo-box bg-white p-8 text-center">
              <div className="font-mono text-sm uppercase tracking-wider">
            <span className="cursor-blink">{t("initializingSystem")}</span>
              </div>
            </div>
      ) : (
        <>
          {/* Main Content Grid - Plant Monitor + Terminal */}
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left Column: Plant Grid */}
            <div className="space-y-6">
              {/* Controls Bar */}
              <div className="neo-box bg-white p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-black" />
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      {t("monitor")}
                    </h3>
                    <span className="neo-pill bg-gray-100">
                      {t("units", { count: activeCount })}
                    </span>
                    {recipeMode ? (
                      <span className="neo-pill neo-pill-accent">
                        {t("recipeMode")}
                      </span>
                    ) : null}
                  </div>

                  <div className="neo-inset flex items-center px-4 py-2 w-full sm:w-auto min-w-[280px]">
                    <span className="font-mono font-bold text-xl mr-2">&gt;</span>
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={(e) => setSearch(e.currentTarget.value)}
                      placeholder={t("searchPlaceholder")}
                      className="bg-transparent border-none outline-none font-mono font-bold uppercase w-full text-lg placeholder-gray-400"
                    />
                    <span className="cursor-blink" />
                  </div>
                </div>
              </div>

              {/* Plant Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {filteredPlants.map((plant, index) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    latest={(readingsByPlant[plant.id] ?? []).at(-1)}
                    persona={(personaByPlant[plant.id] ?? []).at(-1)}
                    onFocus={() => setActivePlant(plant.id)}
                    variant={index % 4 === 1 ? "info" : index % 4 === 3 ? "alert" : index % 4 === 2 ? "accent" : "default"}
                  />
                ))}
              </div>

              {/* Load More */}
              <button className="w-full neo-box py-4 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all group">
                {t("loadMore")}
              </button>
            </div>

            {/* Right Column: Terminal + Quick Stats */}
            <div className="space-y-6">
              <PanelErrorBoundary panel="operator-brief">
                <TerminalPanel
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
                  alertCount={alertCount}
                  activeCount={activeCount}
                />
              </PanelErrorBoundary>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="neo-box p-4 text-center">
                  <div className="text-3xl font-black seven-seg">
                    {String(activeCount).padStart(2, "0")}
                  </div>
                  <div className="font-mono text-xs uppercase mt-1">{t("active")}</div>
                </div>
                <div className={`neo-box p-4 text-center ${alertCount > 0 ? "bg-[var(--color-alert)]" : "bg-white"}`}>
                  <div className={`text-3xl font-black seven-seg ${alertCount > 0 ? "text-white" : ""}`}>
                    {String(alertCount).padStart(2, "0")}
                  </div>
                  <div className={`font-mono text-xs uppercase mt-1 ${alertCount > 0 ? "text-white" : ""}`}>
                    {t("alert")}
                  </div>
                </div>
                <div className="neo-box p-4 text-center col-span-2 bg-[var(--color-info)] border-black">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs uppercase">{t("llmStatus")}</span>
                    <span className="text-xl font-black">{t("online")}</span>
                  </div>
                  <div className="w-full bg-black h-2 mt-2 border border-white">
                    <div className="bg-[var(--color-accent)] h-full w-full animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Mini Operator Brief */}
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
            </div>
          </div>

          {activePlant ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 border-t-[3px] border-black pt-8"
            >
              {/* Active Plant Header */}
              <div className="neo-box bg-black text-white p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal size={20} className="text-[var(--color-accent)]" />
                    <span className="font-mono text-xs uppercase text-[var(--color-accent)]">
                      {t("activeUnit")}
                    </span>
                    <span className="font-black text-xl uppercase tracking-tight">
                      {activePlant.name}
                    </span>
                    <span className="neo-pill bg-white text-black">
                      {activePlant.species}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-dot active" />
                    <span className="font-mono text-xs uppercase">
                      {t("healthPct", { value: activePlant.healthScore })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                {/* Left: Charts & Data */}
                <div className="space-y-6">
                <PanelErrorBoundary
                  panel="sensor-chart"
                  plantId={activePlant.id}
                >
                  <GlassCard>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-black">
                          {t("liveTelemetry", { name: activePlant.name })}
                        </h3>
                        <p className="text-xs text-black/65 font-mono uppercase">
                          {t("incomingTelemetry")}
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
                        className="neo-input px-3 py-2 text-xs"
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

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="neo-inset p-3 text-center">
                        <div className="text-[10px] font-mono uppercase opacity-50 mb-1">pH_Lvl</div>
                        <div className="text-xl font-black seven-seg">{latestReading?.pH.toFixed(2) ?? "--"}</div>
                      </div>
                      <div className="neo-inset p-3 text-center bg-[var(--color-accent)]">
                        <div className="text-[10px] font-mono uppercase mb-1">TDS</div>
                        <div className="text-xl font-black seven-seg">
                          {latestReading ? Math.round(latestReading.tds) : "--"}
                        </div>
                      </div>
                      <div className="neo-inset p-3 text-center">
                        <div className="text-[10px] font-mono uppercase opacity-50 mb-1">DO</div>
                        <div className="text-xl font-black seven-seg">{latestReading?.do.toFixed(1) ?? "--"}</div>
                      </div>
                      <div className="neo-inset p-3 text-center">
                        <div className="text-[10px] font-mono uppercase opacity-50 mb-1">TEMP</div>
                        <div className="text-xl font-black seven-seg">{latestReading?.tempC.toFixed(1) ?? "--"}°C</div>
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

              {/* Right: Persona & Tools */}
              <div className="space-y-6">
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
                        toast.success(t("diseaseCardUpdated"));
                      }}
                    />
                  </PanelErrorBoundary>
                ) : null}

                {/* Predictive Watch */}
                  <div className="neo-box bg-white p-4">
                    <div className="mb-3 flex items-center gap-2 border-b-2 border-black pb-2">
                      <Bot size={15} className="text-[var(--color-info)]" />
                      <h3 className="text-sm font-black uppercase tracking-tight text-black">
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
                            <p className="text-xs font-bold uppercase">{alert.title}</p>
                          </div>
                          <p className="text-xs text-black/75 font-mono uppercase">
                            {alert.description}
                          </p>
                        </div>
                      ))}
                    {alerts.filter(a => a.type === "predictive" && a.plantId === activePlant.id).length === 0 && (
                      <p className="text-xs text-black/50 font-mono uppercase">
                        {t("noPredictiveAlerts")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="neo-box bg-white p-8 text-center">
              <div className="text-4xl mb-4">◉</div>
              <p className="font-mono text-sm uppercase text-black/65">
                {t("noUnitsTitle")}
              </p>
              <p className="font-mono text-xs uppercase text-black/40 mt-2">
                {t("noUnitsSubtitle")}
              </p>
            </div>
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
