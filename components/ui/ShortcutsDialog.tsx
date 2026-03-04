"use client";

import { useEffect } from "react";

import { shortcuts } from "@/lib/shortcuts/registry";

export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c1222] p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            type="button"
            className="rounded-lg border border-white/15 px-3 py-1 text-xs hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {shortcuts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className="text-sm text-white/90">{item.description}</span>
              <kbd className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] text-white/90">
                {item.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
