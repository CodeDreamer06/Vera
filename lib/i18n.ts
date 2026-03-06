"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getEffectiveLanguage,
  getLocalePreferences,
  LOCALE_PREFS_EVENT,
  type SupportedLanguage,
} from "@/lib/locale";

const en = {
  navCommand: "Command",
  navSettings: "Settings",
  shortcuts: "Shortcuts",
  pressCmdK: "> Press CMD+K for",
  commandPalette: "> Command Palette",
  paletteTitle: "Command Palette",
  palettePlaceholder: "Type a command or plant name...",
  noResults: "No results.",
  actions: "Actions",
  plants: "Plants",
  openAlertsCenter: "Open alerts center",
  openDiseasePanel: "Open disease panel",
  injectDemoAnomaly: "Inject demo anomaly",
  generateOperatorBriefing: "Generate operator briefing",
  showKeyboardShortcuts: "Show keyboard shortcuts",
  openSettings: "Open settings",
  keyboardShortcuts: "Keyboard Shortcuts",
  close: "Close",
  hydroponicDivision: "Hydroponic_Division",

  fleetTitle: "Fleet Command Center",
  fleetSubtitle:
    "Monitor biological units. Predict system failures. Coordinate interventions via LLM copilot interface.",
  startDemo: "Start Demo",
  morningOps: "Morning Ops",
  processing: "PROCESSING...",
  initializingSystem: "INITIALIZING SYSTEM",
  monitor: "Multi-Plant_Monitor",
  units: "{count}_UNITS",
  recipeMode: "RECIPE_MODE",
  searchPlaceholder: "SEARCH_ID...",
  loadMore: "Load More Units [+]",
  active: "Active",
  alert: "Alert",
  llmStatus: "LLM Status",
  online: "ONLINE",
  activeUnit: "Active Unit //",
  healthPct: "{value}% HEALTH",
  liveTelemetry: "Live Telemetry • {name}",
  incomingTelemetry: "Incoming simulated data with noise, drift, and anomalies",
  noPredictiveAlerts: "No predictive alerts for this unit.",
  noUnitsTitle: "No biological units seeded yet.",
  noUnitsSubtitle: "Initialize demo mode to populate fleet.",
  demoAnomalyInjected: "Demo anomaly injected",
  operatorBriefGenerated: "Operator briefing generated",
  diseaseCardUpdated: "Disease triage card updated",

  unitDetail: "Unit Detail",
  loadingTelemetrySubtitle: "Loading telemetry and biological context...",
  loadingTelemetry: "LOADING TELEMETRY...",
  unitNotFound: "Unit Not Found",
  unitUnavailable: "Biological unit unavailable in datastore.",
  unitIdNotFound: "Unit ID not found.",
  returnToFleet: "Return to Fleet",
  backToFleet: "Back to Fleet",
  unitIdLabel: "Unit ID //",
  healthLabel: "Health: {value}%",
  diseaseScanCompleted: "Disease scan completed",

  settingsTitle: "Settings",
  settingsSubtitle:
    "Configure system parameters. Data portability and recovery protocols.",
  displayMode: "Display_Mode",
  dark: "Dark",
  light: "Light",
  currentTheme: "Current: {theme}_THEME",
  localeControl: "Locale_Control",
  languageMode: "Language_Mode",
  languageValue: "Language_Value",
  auto: "AUTO",
  manualOverride: "MANUAL_OVERRIDE",
  localArea: "Local_Area",
  detectNow: "Detect_Now",
  detecting: "Detecting...",
  locationMode: "Location_Mode",
  gpsTracking: "GPS_Tracking",
  gpsEnabled: "ENABLED",
  gpsDisabled: "DISABLED",
  gpsOffHint: "GPS tracking is off. Enable to auto-detect current location.",
  city: "City",
  regionState: "Region/State",
  country: "Country",
  countryCode: "Country_Code",
  effectiveLanguage: "Effective_Language: {value}",
  effectiveLocation: "Effective_Location: {value}",
  autoDetected: "Auto_Detected: {location} | Lang: {language}",
  autoLocaleUpdated: "Auto locale detection updated",
  gpsTrackingOn: "GPS tracking enabled",
  gpsTrackingOff: "GPS tracking disabled",
  dataTransfer: "Data_Transfer",
  exportJson: "Export_JSON",
  importJson: "Import_JSON",
  mode: "Mode:",
  mergeData: "MERGE_DATA",
  replaceAll: "REPLACE_ALL",
  fleetDataExported: "Fleet data exported",
  fleetDataImported: "Fleet data imported",
  checkConnection: "Check_Connection",
  checking: "Checking...",
  toggleRelay: "Toggle_Relay",
  onTimeMs: "On_Time_ms",
  offTimeMs: "Off_Time_ms",
  applyOnTime: "Apply_On_Time",
  applyOffTime: "Apply_Off_Time",
  onTimePositive: "On_Time_ms must be a positive integer",
  offTimePositive: "Off_Time_ms must be a positive integer",
  noDeviceStatus: "No device status check yet",
  systemRecovery: "System_Recovery",
  resetAllData: "Reset_All_Data",
  triggerErrorDemo: "Trigger_Error_Demo",
  recoveryWarning: "Recovery actions are irreversible.",
  systemResetComplete: "System reset complete",
  llmConfig: "LLM_Config",
  llmRuntimeMode: "Runtime mode controlled by environment variables:",
  offlineFallback: "Offline deterministic fallback",
  providerMode: "OpenAI-compatible provider",
  espConnected: "ESP bridge connected",
  espNotReachable: "ESP bridge not reachable",
  relayUpdated: "Relay: {value}",
  onTimeUpdated: "On time updated",
  offTimeUpdated: "Off time updated",
} as const;

type TranslationKey = keyof typeof en;
type Dict = Record<TranslationKey, string>;

const makeFromEnglish = (overrides: Partial<Dict>): Dict => ({
  ...en,
  ...overrides,
});

const dictionary: Record<SupportedLanguage, Dict> = {
  en,
  es: makeFromEnglish({
    navCommand: "Comando",
    navSettings: "Configuración",
    openSettings: "Abrir configuración",
    shortcuts: "Atajos",
    fleetTitle: "Centro de Comando",
    startDemo: "Iniciar Demo",
    morningOps: "Operación Matutina",
    settingsTitle: "Configuración",
    dark: "Oscuro",
    light: "Claro",
    detectNow: "Detectar_Ahora",
    detecting: "Detectando...",
    gpsTrackingOn: "Seguimiento GPS habilitado",
    gpsTrackingOff: "Seguimiento GPS deshabilitado",
  }),
  fr: makeFromEnglish({
    navCommand: "Commande",
    navSettings: "Paramètres",
    shortcuts: "Raccourcis",
    fleetTitle: "Centre de Commande",
    startDemo: "Démarrer Démo",
    settingsTitle: "Paramètres",
    dark: "Sombre",
    light: "Clair",
    detectNow: "Détecter_Maintenant",
  }),
  de: makeFromEnglish({
    navCommand: "Kommando",
    navSettings: "Einstellungen",
    shortcuts: "Kurzbefehle",
    fleetTitle: "Leitzentrale",
    startDemo: "Demo starten",
    settingsTitle: "Einstellungen",
    dark: "Dunkel",
    light: "Hell",
    detectNow: "Jetzt_Erkennen",
  }),
  pt: makeFromEnglish({
    navCommand: "Comando",
    navSettings: "Configurações",
    shortcuts: "Atalhos",
    fleetTitle: "Central de Comando",
    startDemo: "Iniciar Demo",
    settingsTitle: "Configurações",
    dark: "Escuro",
    light: "Claro",
    detectNow: "Detectar_Agora",
  }),
  hi: makeFromEnglish({
    navCommand: "कमांड",
    navSettings: "सेटिंग्स",
    shortcuts: "शॉर्टकट",
    fleetTitle: "फ्लीट कमांड सेंटर",
    startDemo: "डेमो शुरू करें",
    settingsTitle: "सेटिंग्स",
  }),
  ja: makeFromEnglish({
    navCommand: "コマンド",
    navSettings: "設定",
    shortcuts: "ショートカット",
    fleetTitle: "フリート指令センター",
    startDemo: "デモ開始",
    settingsTitle: "設定",
  }),
  zh: makeFromEnglish({
    navCommand: "命令",
    navSettings: "设置",
    shortcuts: "快捷键",
    fleetTitle: "舰队指挥中心",
    startDemo: "开始演示",
    settingsTitle: "设置",
  }),
  it: makeFromEnglish({
    navCommand: "Comando",
    navSettings: "Impostazioni",
    shortcuts: "Scorciatoie",
    fleetTitle: "Centro di Comando",
    startDemo: "Avvia Demo",
    settingsTitle: "Impostazioni",
  }),
  ru: makeFromEnglish({
    navCommand: "Команда",
    navSettings: "Настройки",
    shortcuts: "Сочетания",
    fleetTitle: "Центр Управления",
    startDemo: "Запустить демо",
    settingsTitle: "Настройки",
  }),
  ar: makeFromEnglish({
    navCommand: "الأوامر",
    navSettings: "الإعدادات",
    shortcuts: "الاختصارات",
    fleetTitle: "مركز التحكم",
    startDemo: "بدء العرض",
    settingsTitle: "الإعدادات",
  }),
  ko: makeFromEnglish({
    navCommand: "명령",
    navSettings: "설정",
    shortcuts: "단축키",
    fleetTitle: "플릿 관제 센터",
    startDemo: "데모 시작",
    settingsTitle: "설정",
  }),
  tr: makeFromEnglish({
    navCommand: "Komut",
    navSettings: "Ayarlar",
    shortcuts: "Kısayollar",
    fleetTitle: "Filo Komuta Merkezi",
    startDemo: "Demoyu Başlat",
    settingsTitle: "Ayarlar",
  }),
  id: makeFromEnglish({
    navCommand: "Perintah",
    navSettings: "Pengaturan",
    shortcuts: "Pintasan",
    fleetTitle: "Pusat Komando",
    startDemo: "Mulai Demo",
    settingsTitle: "Pengaturan",
  }),
  nl: makeFromEnglish({
    navCommand: "Commando",
    navSettings: "Instellingen",
    shortcuts: "Sneltoetsen",
    fleetTitle: "Commandocentrum",
    startDemo: "Start Demo",
    settingsTitle: "Instellingen",
  }),
};

const interpolate = (template: string, params?: Record<string, string | number>) => {
  if (!params) {
    return template;
  }
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
};

export const useI18n = () => {
  const [language, setLanguage] = useState<SupportedLanguage>(() =>
    typeof window === "undefined"
      ? "en"
      : getEffectiveLanguage(getLocalePreferences()),
  );

  useEffect(() => {
    const sync = () => {
      setLanguage(getEffectiveLanguage(getLocalePreferences()));
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(LOCALE_PREFS_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(LOCALE_PREFS_EVENT, sync);
    };
  }, []);

  const t = useMemo(
    () =>
      (key: TranslationKey, params?: Record<string, string | number>) =>
        interpolate((dictionary[language] ?? dictionary.en)[key], params),
    [language],
  );

  return { language, t };
};

export type { TranslationKey };
