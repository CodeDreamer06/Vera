"use client";

import { useEffect } from "react";

import { useI18n } from "@/lib/i18n";
import { shortcuts } from "@/lib/shortcuts/registry";

export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl neo-box bg-white p-5 text-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("keyboardShortcuts")}</h2>
          <button
            type="button"
            className="neo-box neo-button"
            onClick={onClose}
          >
            {t("close")}
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {shortcuts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-black bg-gray-100 px-3 py-2"
            >
              <span className="text-sm text-black/90">{item.description}</span>
              <kbd className="border-2 border-black bg-white px-2 py-0.5 text-[11px] font-bold text-black/90">
                {item.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
