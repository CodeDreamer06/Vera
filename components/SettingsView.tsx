"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { GlassCard } from "@/components/ui/Glass";
import { useAppStore } from "@/lib/store";

export function SettingsView() {
  const { exportAll, importAll, resetAll, initialize } = useAppStore();
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [theme, setTheme] = useState("dark");
  const [fakeError, setFakeError] = useState<Error | null>(null);

  return (
    <AppShell
      title="Settings"
      subtitle="Data portability, local recovery, and demo controls."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Theme</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
              onClick={() => {
                document.documentElement.dataset.theme = "dark";
                localStorage.setItem("vera-theme", "dark");
                setTheme("dark");
              }}
            >
              <Moon size={13} className="mr-1 inline" /> Dark
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
              onClick={() => {
                document.documentElement.dataset.theme = "light";
                localStorage.setItem("vera-theme", "light");
                setTheme("light");
              }}
            >
              <Sun size={13} className="mr-1 inline" /> Light
            </button>
          </div>
          <p className="mt-2 text-xs text-white/60">Current theme: {theme}</p>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Data Import / Export</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-emerald-300/35 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-500/25"
              onClick={async () => {
                await exportAll();
                toast.success("Demo data exported");
              }}
            >
              Export JSON
            </button>

            <label className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">
              Import JSON
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
                  toast.success("Data imported");
                }}
              />
            </label>

            <select
              value={mode}
              onChange={(e) =>
                setMode(e.currentTarget.value as "merge" | "replace")
              }
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
            >
              <option value="merge" className="bg-slate-900">
                Merge
              </option>
              <option value="replace" className="bg-slate-900">
                Replace
              </option>
            </select>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Recovery Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-rose-300/35 bg-rose-500/15 px-3 py-1.5 text-xs text-rose-100 hover:bg-rose-500/25"
              onClick={async () => {
                await resetAll();
                await initialize();
                toast.success("Local data reset complete");
              }}
            >
              Reset Local Demo Data
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
              onClick={() =>
                setFakeError(new Error("Simulated panel failure for demo"))
              }
            >
              Trigger Error UI Demo
            </button>
          </div>
          <p className="mt-2 text-xs text-white/60">
            Use this panel during demo to show robust recovery and debug detail
            copy flows.
          </p>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">LLM Mode</h3>
          <p className="text-xs text-white/70">
            Runtime mode is controlled by environment variables.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-white/65">
            <li>
              `NEXT_PUBLIC_MOCK_LLM=1` keeps full offline deterministic fallback
              behavior.
            </li>
            <li>
              `NEXT_PUBLIC_MOCK_LLM=0` uses the configured OpenAI-compatible
              provider.
            </li>
          </ul>
        </GlassCard>
      </div>

      {fakeError ? (
        <div className="mt-4">
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
