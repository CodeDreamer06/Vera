"use client";

import { useEffect } from "react";

export function ThemeBoot() {
  useEffect(() => {
    const stored = localStorage.getItem("vera-theme");
    document.documentElement.dataset.theme =
      stored === "dark" ? "dark" : "light";
  }, []);

  return null;
}
