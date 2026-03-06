"use client";

import {
  AlertTriangle,
  Download,
  Languages,
  MapPinned,
  Moon,
  PlugZap,
  Power,
  RefreshCw,
  Sun,
  Upload,
  Waves,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { GlassCard, Pill } from "@/components/ui/Glass";
import {
  applyLocaleToDocument,
  formatLocationLabel,
  getEffectiveLanguage,
  getEffectiveLocation,
  getLanguageOption,
  getLocalePreferences,
  type LocalArea,
  refreshAutoLocalePreferences,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  updateLocalePreferences,
} from "@/lib/locale";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function SettingsView() {
  const { t } = useI18n();
  const { exportAll, importAll, resetAll, initialize } = useAppStore();
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [theme, setTheme] = useState("dark");
  const [fakeError, setFakeError] = useState<Error | null>(null);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [onTimeMs, setOnTimeMs] = useState("300000");
  const [offTimeMs, setOffTimeMs] = useState("3600000");
  const [languageMode, setLanguageMode] = useState<"auto" | "manual">("auto");
  const [manualLanguage, setManualLanguage] = useState<SupportedLanguage>("en");
  const [detectedLanguage, setDetectedLanguage] =
    useState<SupportedLanguage>("en");
  const [locationMode, setLocationMode] = useState<"auto" | "manual">("auto");
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(true);
  const [manualLocation, setManualLocation] = useState<LocalArea>({
    city: "",
    region: "",
    country: "",
    countryCode: "",
  });
  const [detectedLocation, setDetectedLocation] = useState<LocalArea | null>(
    null,
  );
  const [localeLoading, setLocaleLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<{
    configured: boolean;
    connected: boolean;
    distanceCm?: number;
  } | null>(null);

  const syncLocaleState = useCallback(() => {
    const prefs = getLocalePreferences();
    setLanguageMode(prefs.languageMode);
    setManualLanguage(prefs.manualLanguage);
    setDetectedLanguage(prefs.detectedLanguage);
    setLocationMode(prefs.locationMode);
    setGpsTrackingEnabled(prefs.gpsTrackingEnabled);
    setManualLocation(
      prefs.manualLocation ?? {
        city: "",
        region: "",
        country: "",
        countryCode: "",
      },
    );
    setDetectedLocation(prefs.detectedLocation);
    applyLocaleToDocument(prefs);
  }, []);

  useEffect(() => {
    setTheme(localStorage.getItem("vera-theme") === "dark" ? "dark" : "light");
    syncLocaleState();
  }, [syncLocaleState]);

  const saveLocalePatch = (
    patch: Parameters<typeof updateLocalePreferences>[0],
  ) => {
    const updated = updateLocalePreferences(patch);
    applyLocaleToDocument(updated);
    syncLocaleState();
  };

  const refreshAutoLocale = async () => {
    setLocaleLoading(true);
    try {
      const updated = await refreshAutoLocalePreferences();
      applyLocaleToDocument(updated);
      syncLocaleState();
      toast.success(t("autoLocaleUpdated"));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLocaleLoading(false);
    }
  };

  const effectiveLanguage = getLanguageOption(
    getEffectiveLanguage({
      languageMode,
      manualLanguage,
      detectedLanguage,
      locationMode,
      gpsTrackingEnabled,
      manualLocation,
      detectedLocation,
    }),
  );
  const effectiveLocation = getEffectiveLocation({
    languageMode,
    manualLanguage,
      detectedLanguage,
      locationMode,
      gpsTrackingEnabled,
      manualLocation,
      detectedLocation,
  });

  const postDeviceCommand = async (body: unknown) => {
    const response = await fetch("/api/device/esp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as {
      error?: string;
      response?: string;
      relayRaw?: string;
      distanceCm?: number;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "ESP device command failed");
    }

    return payload;
  };

  const refreshDeviceStatus = async () => {
    setDeviceLoading(true);
    try {
      const statusRes = await fetch("/api/device/esp", {
        method: "GET",
        cache: "no-store",
      });
      const status = (await statusRes.json()) as {
        configured: boolean;
        connected: boolean;
      };

      let distanceCm: number | undefined;
      if (status.connected) {
        const distanceRes = await fetch("/api/device/esp?action=distance", {
          method: "GET",
          cache: "no-store",
        });
        if (distanceRes.ok) {
          const distancePayload = (await distanceRes.json()) as {
            distanceCm?: number;
          };
          distanceCm = distancePayload.distanceCm;
        }
      }

      setDeviceStatus({ ...status, distanceCm });
      toast.success(
        status.connected ? t("espConnected") : t("espNotReachable"),
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeviceLoading(false);
    }
  };

  return (
    <AppShell
      title={t("settingsTitle")}
      subtitle={t("settingsSubtitle")}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Settings */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Moon size={15} className="text-[var(--color-info)]" />
              <h3 className="panel-title">{t("displayMode")}</h3>
            </div>
            <Pill className="neo-pill">UI_CONFIG</Pill>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className={`neo-box neo-button flex items-center gap-2 ${theme === "dark" ? "neo-button-accent" : ""}`}
              onClick={() => {
                document.documentElement.dataset.theme = "dark";
                localStorage.setItem("vera-theme", "dark");
                setTheme("dark");
              }}
            >
              <Moon size={14} /> {t("dark")}
            </button>
            <button
              type="button"
              className={`neo-box neo-button flex items-center gap-2 ${theme === "light" ? "neo-button-accent" : ""}`}
              onClick={() => {
                document.documentElement.dataset.theme = "light";
                localStorage.setItem("vera-theme", "light");
                setTheme("light");
              }}
            >
              <Sun size={14} /> {t("light")}
            </button>
          </div>
          <p className="mt-3 font-mono text-xs uppercase text-black/50">
            {t("currentTheme", { theme: theme.toUpperCase() })}
          </p>
        </GlassCard>

        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Languages size={15} className="text-[var(--color-info)]" />
              <h3 className="panel-title">{t("localeControl")}</h3>
            </div>
            <Pill className="neo-pill-info">I18N</Pill>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="font-mono text-xs uppercase text-black/60">
                {t("languageMode")}
              </span>
              <select
                value={languageMode}
                onChange={(event) =>
                  saveLocalePatch({
                    languageMode: event.currentTarget.value as
                      | "auto"
                      | "manual",
                  })
                }
                className="neo-input w-full px-3 py-2 text-sm"
              >
                <option value="auto">{t("auto")}</option>
                <option value="manual">{t("manualOverride")}</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="font-mono text-xs uppercase text-black/60">
                {t("languageValue")}
              </span>
              <select
                value={manualLanguage}
                onChange={(event) =>
                  saveLocalePatch({
                    manualLanguage: event.currentTarget
                      .value as SupportedLanguage,
                  })
                }
                disabled={languageMode !== "manual"}
                className="neo-input w-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {SUPPORTED_LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 border-t border-black/20 pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPinned size={14} className="text-[var(--color-accent)]" />
                <span className="font-mono text-xs uppercase text-black/60">
                  {t("localArea")}
                </span>
              </div>
              <button
                type="button"
                className="neo-box neo-button px-3 py-1 text-xs"
                disabled={localeLoading || !gpsTrackingEnabled}
                onClick={refreshAutoLocale}
              >
                {localeLoading ? t("detecting") : t("detectNow")}
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3 border-2 border-black bg-white px-3 py-2">
              <span className="font-mono text-xs uppercase text-black/60">
                {t("gpsTracking")}
              </span>
              <button
                type="button"
                className={`neo-box neo-button px-3 py-1 text-xs ${gpsTrackingEnabled ? "neo-button-accent" : ""}`}
                onClick={() => {
                  const next = !gpsTrackingEnabled;
                  setGpsTrackingEnabled(next);
                  saveLocalePatch({
                    gpsTrackingEnabled: next,
                    detectedLocation: next ? detectedLocation : null,
                  });
                  toast.success(next ? t("gpsTrackingOn") : t("gpsTrackingOff"));
                }}
              >
                {gpsTrackingEnabled ? t("gpsEnabled") : t("gpsDisabled")}
              </button>
            </div>

            {!gpsTrackingEnabled ? (
              <p className="mb-3 font-mono text-[10px] uppercase text-black/45">
                {t("gpsOffHint")}
              </p>
            ) : null}

            <label className="space-y-1">
              <span className="font-mono text-xs uppercase text-black/60">
                {t("locationMode")}
              </span>
              <select
                value={locationMode}
                onChange={(event) =>
                  saveLocalePatch({
                    locationMode: event.currentTarget.value as
                      | "auto"
                      | "manual",
                  })
                }
                className="neo-input w-full px-3 py-2 text-sm"
              >
                <option value="auto">{t("auto")}</option>
                <option value="manual">{t("manualOverride")}</option>
              </select>
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="font-mono text-xs uppercase text-black/60">
                  {t("city")}
                </span>
                <input
                  type="text"
                  value={manualLocation.city}
                  disabled={locationMode !== "manual"}
                  className="neo-input w-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onChange={(event) =>
                    setManualLocation((prev) => ({
                      ...prev,
                      city: event.currentTarget.value,
                    }))
                  }
                  onBlur={() => saveLocalePatch({ manualLocation })}
                />
              </label>
              <label className="space-y-1">
                <span className="font-mono text-xs uppercase text-black/60">
                  {t("regionState")}
                </span>
                <input
                  type="text"
                  value={manualLocation.region}
                  disabled={locationMode !== "manual"}
                  className="neo-input w-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onChange={(event) =>
                    setManualLocation((prev) => ({
                      ...prev,
                      region: event.currentTarget.value,
                    }))
                  }
                  onBlur={() => saveLocalePatch({ manualLocation })}
                />
              </label>
              <label className="space-y-1">
                <span className="font-mono text-xs uppercase text-black/60">
                  {t("country")}
                </span>
                <input
                  type="text"
                  value={manualLocation.country}
                  disabled={locationMode !== "manual"}
                  className="neo-input w-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onChange={(event) =>
                    setManualLocation((prev) => ({
                      ...prev,
                      country: event.currentTarget.value,
                    }))
                  }
                  onBlur={() => saveLocalePatch({ manualLocation })}
                />
              </label>
              <label className="space-y-1">
                <span className="font-mono text-xs uppercase text-black/60">
                  {t("countryCode")}
                </span>
                <input
                  type="text"
                  value={manualLocation.countryCode}
                  disabled={locationMode !== "manual"}
                  className="neo-input w-full px-3 py-2 text-sm uppercase disabled:cursor-not-allowed disabled:opacity-60"
                  onChange={(event) =>
                    setManualLocation((prev) => ({
                      ...prev,
                      countryCode: event.currentTarget.value
                        .toUpperCase()
                        .slice(0, 2),
                    }))
                  }
                  onBlur={() => saveLocalePatch({ manualLocation })}
                />
              </label>
            </div>
          </div>

          <p className="mt-3 font-mono text-xs uppercase text-black/50">
            {t("effectiveLanguage", {
              value: effectiveLanguage.label.toUpperCase(),
            })}
          </p>
          <p className="font-mono text-xs uppercase text-black/50">
            {t("effectiveLocation", { value: formatLocationLabel(effectiveLocation) })}
          </p>
          <p className="font-mono text-xs uppercase text-black/40">
            {t("autoDetected", {
              location: formatLocationLabel(detectedLocation),
              language: getLanguageOption(detectedLanguage).label.toUpperCase(),
            })}
          </p>
        </GlassCard>

        {/* Data Import/Export */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Upload size={15} className="text-[var(--color-accent)]" />
              <h3 className="panel-title">{t("dataTransfer")}</h3>
            </div>
            <Pill className="neo-pill-accent">ACTIVE</Pill>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              className="neo-box neo-button neo-button-accent flex items-center gap-2"
              onClick={async () => {
                await exportAll();
                toast.success(t("fleetDataExported"));
              }}
            >
              <Download size={14} />
              {t("exportJson")}
            </button>

            <label className="neo-box neo-button cursor-pointer flex items-center gap-2 hover:bg-[var(--color-accent)]">
              <Upload size={14} />
              {t("importJson")}
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file) {
                    return;
                  }

                  await importAll(file, mode);
                  toast.success(t("fleetDataImported"));
                }}
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase text-black/50">
              {t("mode")}
            </span>
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.currentTarget.value as "merge" | "replace")
              }
              className="neo-input px-3 py-1.5 text-xs"
            >
              <option value="merge">{t("mergeData")}</option>
              <option value="replace">{t("replaceAll")}</option>
            </select>
          </div>
        </GlassCard>

        {/* ESP Bridge */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <PlugZap size={15} className="text-[var(--color-info)]" />
              <h3 className="panel-title">ESP8266_Bridge</h3>
            </div>
            <Pill className="neo-pill-info">V1</Pill>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="neo-box neo-button flex items-center gap-2"
              onClick={refreshDeviceStatus}
              disabled={deviceLoading}
            >
              <Waves size={14} />
              {deviceLoading ? t("checking") : t("checkConnection")}
            </button>
            <button
              type="button"
              className="neo-box neo-button neo-button-accent flex items-center gap-2"
              onClick={async () => {
                setDeviceLoading(true);
                try {
                  const result = await postDeviceCommand({
                    action: "toggleRelay",
                  });
                  toast.success(
                    t("relayUpdated", { value: result.relayRaw ?? "updated" }),
                  );
                  await refreshDeviceStatus();
                } catch (error) {
                  toast.error((error as Error).message);
                } finally {
                  setDeviceLoading(false);
                }
              }}
              disabled={deviceLoading}
            >
              <Power size={14} />
              {t("toggleRelay")}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="font-mono text-xs uppercase text-black/60">
                {t("onTimeMs")}
              </span>
              <input
                type="number"
                min={1}
                className="neo-input w-full px-3 py-2 text-sm"
                value={onTimeMs}
                onChange={(event) => setOnTimeMs(event.currentTarget.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="font-mono text-xs uppercase text-black/60">
                {t("offTimeMs")}
              </span>
              <input
                type="number"
                min={1}
                className="neo-input w-full px-3 py-2 text-sm"
                value={offTimeMs}
                onChange={(event) => setOffTimeMs(event.currentTarget.value)}
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="neo-box neo-button"
              disabled={deviceLoading}
              onClick={async () => {
                const value = Number(onTimeMs);
                if (!Number.isInteger(value) || value < 1) {
                  toast.error(t("onTimePositive"));
                  return;
                }

                setDeviceLoading(true);
                try {
                  const result = await postDeviceCommand({
                    action: "setOnTime",
                    value,
                  });
                  toast.success(result.response ?? t("onTimeUpdated"));
                } catch (error) {
                  toast.error((error as Error).message);
                } finally {
                  setDeviceLoading(false);
                }
              }}
            >
              {t("applyOnTime")}
            </button>
            <button
              type="button"
              className="neo-box neo-button"
              disabled={deviceLoading}
              onClick={async () => {
                const value = Number(offTimeMs);
                if (!Number.isInteger(value) || value < 1) {
                  toast.error(t("offTimePositive"));
                  return;
                }

                setDeviceLoading(true);
                try {
                  const result = await postDeviceCommand({
                    action: "setOffTime",
                    value,
                  });
                  toast.success(result.response ?? t("offTimeUpdated"));
                } catch (error) {
                  toast.error((error as Error).message);
                } finally {
                  setDeviceLoading(false);
                }
              }}
            >
              {t("applyOffTime")}
            </button>
          </div>

          <p className="mt-3 font-mono text-xs uppercase text-black/50">
            {deviceStatus
              ? `Configured=${String(deviceStatus.configured).toUpperCase()} | Connected=${String(deviceStatus.connected).toUpperCase()}${
                  typeof deviceStatus.distanceCm === "number"
                    ? ` | Distance=${deviceStatus.distanceCm.toFixed(1)}cm`
                    : ""
                }`
              : t("noDeviceStatus")}
          </p>
        </GlassCard>

        {/* Recovery Actions */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-[var(--color-alert)]" />
              <h3 className="panel-title">{t("systemRecovery")}</h3>
            </div>
            <Pill className="neo-pill-alert">CAUTION</Pill>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="neo-box neo-button neo-button-alert flex items-center gap-2"
              onClick={async () => {
                await resetAll();
                await initialize();
                toast.success(t("systemResetComplete"));
              }}
            >
              <Power size={14} />
              {t("resetAllData")}
            </button>
            <button
              type="button"
              className="neo-box neo-button flex items-center gap-2"
              onClick={() =>
                setFakeError(new Error("Simulated panel failure for demo"))
              }
            >
              <AlertTriangle size={14} />
              {t("triggerErrorDemo")}
            </button>
          </div>
          <p className="mt-3 font-mono text-xs uppercase text-black/50">
            ⚠ {t("recoveryWarning")}
          </p>
        </GlassCard>

        {/* LLM Configuration */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-[var(--color-info)]" />
              <h3 className="panel-title">{t("llmConfig")}</h3>
            </div>
            <Pill className="neo-pill-info">ONLINE</Pill>
          </div>
          <div className="neo-inset bg-gray-100 p-4 font-mono text-xs">
            <p className="text-black/70 mb-3 uppercase">
              {t("llmRuntimeMode")}
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">➜</span>
                <code className="bg-black text-white px-2 py-1">
                  NEXT_PUBLIC_MOCK_LLM=1
                </code>
                <span className="text-black/50">
                  - {t("offlineFallback")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">➜</span>
                <code className="bg-black text-white px-2 py-1">
                  NEXT_PUBLIC_MOCK_LLM=0
                </code>
                <span className="text-black/50">
                  - {t("providerMode")}
                </span>
              </li>
            </ul>
          </div>
        </GlassCard>
      </div>

      {fakeError ? (
        <div className="mt-6">
          <ErrorCard
            error={fakeError}
            context={{ panel: "settings-demo", actionId: "trigger-error" }}
            onRetry={() => setFakeError(null)}
            onReset={async () => {
              await resetAll();
              await initialize();
            }}
            onReopen={() => setFakeError(null)}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
