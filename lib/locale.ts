export type PreferenceMode = "auto" | "manual";

export type SupportedLanguage =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "hi"
  | "ja"
  | "zh"
  | "it"
  | "ru"
  | "ar"
  | "ko"
  | "tr"
  | "id"
  | "nl";

export interface LocalArea {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface LocalePreferences {
  languageMode: PreferenceMode;
  manualLanguage: SupportedLanguage;
  detectedLanguage: SupportedLanguage;
  locationMode: PreferenceMode;
  gpsTrackingEnabled: boolean;
  manualLocation: LocalArea | null;
  detectedLocation: LocalArea | null;
}

export const SUPPORTED_LANGUAGES: Array<{
  code: SupportedLanguage;
  label: string;
  promptLabel: string;
  htmlLang: string;
}> = [
  { code: "en", label: "English", promptLabel: "English", htmlLang: "en" },
  { code: "es", label: "Spanish", promptLabel: "Spanish", htmlLang: "es" },
  { code: "fr", label: "French", promptLabel: "French", htmlLang: "fr" },
  { code: "de", label: "German", promptLabel: "German", htmlLang: "de" },
  {
    code: "pt",
    label: "Portuguese",
    promptLabel: "Portuguese",
    htmlLang: "pt",
  },
  { code: "hi", label: "Hindi", promptLabel: "Hindi", htmlLang: "hi" },
  { code: "ja", label: "Japanese", promptLabel: "Japanese", htmlLang: "ja" },
  { code: "zh", label: "Chinese", promptLabel: "Chinese", htmlLang: "zh" },
  { code: "it", label: "Italian", promptLabel: "Italian", htmlLang: "it" },
  { code: "ru", label: "Russian", promptLabel: "Russian", htmlLang: "ru" },
  { code: "ar", label: "Arabic", promptLabel: "Arabic", htmlLang: "ar" },
  { code: "ko", label: "Korean", promptLabel: "Korean", htmlLang: "ko" },
  { code: "tr", label: "Turkish", promptLabel: "Turkish", htmlLang: "tr" },
  {
    code: "id",
    label: "Indonesian",
    promptLabel: "Indonesian",
    htmlLang: "id",
  },
  { code: "nl", label: "Dutch", promptLabel: "Dutch", htmlLang: "nl" },
];

const DEFAULT_LOCALE_PREFERENCES: LocalePreferences = {
  languageMode: "auto",
  manualLanguage: "en",
  detectedLanguage: "en",
  locationMode: "auto",
  gpsTrackingEnabled: true,
  manualLocation: null,
  detectedLocation: null,
};

const STORAGE_KEY = "vera-locale-preferences";
export const LOCALE_PREFS_EVENT = "vera-locale-updated";

const COUNTRY_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  AR: "es",
  AT: "de",
  BO: "es",
  BR: "pt",
  CL: "es",
  CO: "es",
  CR: "es",
  CU: "es",
  DE: "de",
  DO: "es",
  EC: "es",
  ES: "es",
  FR: "fr",
  GT: "es",
  HN: "es",
  IN: "hi",
  JP: "ja",
  MX: "es",
  NI: "es",
  PA: "es",
  PE: "es",
  PR: "es",
  PT: "pt",
  PY: "es",
  SV: "es",
  UY: "es",
  VE: "es",
};

const readPreferences = (): LocalePreferences => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE_PREFERENCES;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_LOCALE_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalePreferences>;
    return {
      languageMode: parsed.languageMode === "manual" ? "manual" : "auto",
      manualLanguage: normalizeLanguage(parsed.manualLanguage),
      detectedLanguage: normalizeLanguage(parsed.detectedLanguage),
      locationMode: parsed.locationMode === "manual" ? "manual" : "auto",
      gpsTrackingEnabled:
        typeof parsed.gpsTrackingEnabled === "boolean"
          ? parsed.gpsTrackingEnabled
          : true,
      manualLocation: sanitizeLocation(parsed.manualLocation),
      detectedLocation: sanitizeLocation(parsed.detectedLocation),
    };
  } catch {
    return DEFAULT_LOCALE_PREFERENCES;
  }
};

const sanitizeLocation = (value: unknown): LocalArea | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<LocalArea>;
  return {
    city: (candidate.city ?? "").toString(),
    region: (candidate.region ?? "").toString(),
    country: (candidate.country ?? "").toString(),
    countryCode: (candidate.countryCode ?? "").toString().toUpperCase(),
    latitude:
      typeof candidate.latitude === "number" ? candidate.latitude : undefined,
    longitude:
      typeof candidate.longitude === "number" ? candidate.longitude : undefined,
    timezone: candidate.timezone?.toString(),
  };
};

export const getLocalePreferences = (): LocalePreferences => readPreferences();

export const updateLocalePreferences = (
  patch: Partial<LocalePreferences>,
): LocalePreferences => {
  const next = {
    ...readPreferences(),
    ...patch,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent(LOCALE_PREFS_EVENT, { detail: { preferences: next } }),
    );
  }

  return next;
};

export const getEffectiveLocation = (
  prefs = readPreferences(),
): LocalArea | null =>
  prefs.locationMode === "manual"
    ? prefs.manualLocation
    : prefs.detectedLocation;

export const getEffectiveLanguage = (
  prefs = readPreferences(),
): SupportedLanguage => {
  if (prefs.languageMode === "manual") {
    return normalizeLanguage(prefs.manualLanguage);
  }
  return normalizeLanguage(prefs.detectedLanguage);
};

export const getLanguageOption = (language: SupportedLanguage) =>
  SUPPORTED_LANGUAGES.find((item) => item.code === language) ??
  SUPPORTED_LANGUAGES[0];

const normalizeLanguage = (value: unknown): SupportedLanguage => {
  if (typeof value !== "string") {
    return "en";
  }

  const language = value.toLowerCase();
  if (
    language === "en" ||
    language === "es" ||
    language === "fr" ||
    language === "de" ||
    language === "pt" ||
    language === "hi" ||
    language === "ja" ||
    language === "zh" ||
    language === "it" ||
    language === "ru" ||
    language === "ar" ||
    language === "ko" ||
    language === "tr" ||
    language === "id" ||
    language === "nl"
  ) {
    return language;
  }

  if (language.startsWith("es")) {
    return "es";
  }
  if (language.startsWith("fr")) {
    return "fr";
  }
  if (language.startsWith("de")) {
    return "de";
  }
  if (language.startsWith("pt")) {
    return "pt";
  }
  if (language.startsWith("hi")) {
    return "hi";
  }
  if (language.startsWith("ja")) {
    return "ja";
  }
  if (language.startsWith("zh")) {
    return "zh";
  }
  if (language.startsWith("it")) {
    return "it";
  }
  if (language.startsWith("ru")) {
    return "ru";
  }
  if (language.startsWith("ar")) {
    return "ar";
  }
  if (language.startsWith("ko")) {
    return "ko";
  }
  if (language.startsWith("tr")) {
    return "tr";
  }
  if (language.startsWith("id")) {
    return "id";
  }
  if (language.startsWith("nl")) {
    return "nl";
  }

  return "en";
};

const getBrowserLanguage = () => {
  if (typeof navigator === "undefined") {
    return "en";
  }

  return normalizeLanguage(navigator.language);
};

const inferLanguageFromLocation = (
  area: LocalArea | null,
  fallbackLanguage = getBrowserLanguage(),
): SupportedLanguage => {
  const byCountry = area?.countryCode
    ? COUNTRY_LANGUAGE_MAP[area.countryCode.toUpperCase()]
    : undefined;
  return byCountry ?? fallbackLanguage;
};

const getPosition = (
  gpsTrackingEnabled: boolean,
): Promise<GeolocationPosition | null> => {
  if (
    !gpsTrackingEnabled ||
    typeof navigator === "undefined" ||
    !navigator.geolocation
  ) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  });
};

const detectAreaFromCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<LocalArea | null> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
      countryCode?: string;
    };

    return {
      city: payload.city ?? payload.locality ?? "",
      region: payload.principalSubdivision ?? "",
      country: payload.countryName ?? "",
      countryCode: (payload.countryCode ?? "").toUpperCase(),
      latitude,
      longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch {
    return null;
  }
};

export const detectLocalArea = async (
  prefs = readPreferences(),
): Promise<LocalArea | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!prefs.gpsTrackingEnabled) {
    return {
      city: "",
      region: "",
      country: "",
      countryCode: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  const position = await getPosition(prefs.gpsTrackingEnabled);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!position) {
    return {
      city: "",
      region: "",
      country: "",
      countryCode: "",
      timezone,
    };
  }

  const { latitude, longitude } = position.coords;
  const detected = await detectAreaFromCoordinates(latitude, longitude);

  return (
    detected ?? {
      city: "",
      region: "",
      country: "",
      countryCode: "",
      latitude,
      longitude,
      timezone,
    }
  );
};

export const refreshAutoLocalePreferences =
  async (): Promise<LocalePreferences> => {
    const current = readPreferences();
    const detectedLocation = await detectLocalArea(current);
    const detectedLanguage = inferLanguageFromLocation(
      detectedLocation,
      getBrowserLanguage(),
    );

    return updateLocalePreferences({
      ...current,
      detectedLocation,
      detectedLanguage,
    });
  };

export const applyLocaleToDocument = (prefs = readPreferences()) => {
  if (typeof document === "undefined") {
    return;
  }

  const lang = getLanguageOption(getEffectiveLanguage(prefs)).htmlLang;
  const location = getEffectiveLocation(prefs);

  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.documentElement.dataset.country = location?.countryCode ?? "";
};

export const initializeLocalePreferences = async () => {
  const initial = readPreferences();
  applyLocaleToDocument(initial);

  if (initial.languageMode === "auto" || initial.locationMode === "auto") {
    const refreshed = await refreshAutoLocalePreferences();
    applyLocaleToDocument(refreshed);
    return refreshed;
  }

  return initial;
};

export const formatLocationLabel = (location: LocalArea | null): string => {
  if (!location) {
    return "Unknown location";
  }

  const parts = [location.city, location.region, location.country]
    .map((value) => value.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    if (location.timezone) {
      return `Timezone: ${location.timezone}`;
    }
    return "Unknown location";
  }

  return parts.join(", ");
};

export const getLlmLocaleContext = () => {
  const prefs = readPreferences();
  const language = getEffectiveLanguage(prefs);
  const option = getLanguageOption(language);
  const location = getEffectiveLocation(prefs);
  const locationContext = location ? formatLocationLabel(location) : undefined;

  return {
    outputLanguage: option.promptLabel,
    locationContext,
  };
};
