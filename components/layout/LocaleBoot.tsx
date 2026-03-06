"use client";

import { useEffect } from "react";

import { initializeLocalePreferences } from "@/lib/locale";

export function LocaleBoot() {
  useEffect(() => {
    initializeLocalePreferences().catch(() => {
      // Keep UI usable even if geolocation/reverse geocoding fails.
    });
  }, []);

  return null;
}
