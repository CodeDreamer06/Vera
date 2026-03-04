"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onPalette: () => void;
  onShortcuts: () => void;
  onSearch: () => void;
  onPrevPlant: () => void;
  onNextPlant: () => void;
  onAlerts: () => void;
  onTimeTravel: () => void;
  onRange: () => void;
  onDisease: () => void;
  onAnomaly: () => void;
  onRecipe: () => void;
  onSettings: () => void;
}

export const useShortcutBindings = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputLike =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        handlers.onPalette();
        return;
      }

      if (!isInputLike && event.key === "?") {
        event.preventDefault();
        handlers.onShortcuts();
        return;
      }

      if (!isInputLike && event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        handlers.onSearch();
        return;
      }

      if (!isInputLike && event.key === "[") {
        event.preventDefault();
        handlers.onPrevPlant();
        return;
      }

      if (!isInputLike && event.key === "]") {
        event.preventDefault();
        handlers.onNextPlant();
        return;
      }

      if (!isInputLike && !event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        handlers.onAlerts();
        return;
      }

      if (!isInputLike && !event.shiftKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        handlers.onTimeTravel();
        return;
      }

      if (!isInputLike && !event.shiftKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        handlers.onRange();
        return;
      }

      if (!isInputLike && !event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        handlers.onDisease();
        return;
      }

      if (!isInputLike && event.shiftKey && event.key.toLowerCase() === "x") {
        event.preventDefault();
        handlers.onAnomaly();
        return;
      }

      if (!isInputLike && !event.shiftKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        handlers.onRecipe();
        return;
      }

      if (!isInputLike && event.key === ",") {
        event.preventDefault();
        handlers.onSettings();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
};
