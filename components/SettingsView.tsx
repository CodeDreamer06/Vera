"use client";

import { Download, Moon, Power, RefreshCw, Sun, Upload, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { GlassCard, Pill } from "@/components/ui/Glass";
import { useAppStore } from "@/lib/store";

export function SettingsView() {
  const { exportAll, importAll, resetAll, initialize } = useAppStore();
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [theme, setTheme] = useState("dark");
  const [fakeError, setFakeError] = useState<Error | null>(null);

  return (
    <AppShell
      title="Settings"
      subtitle="Configure system parameters. Data portability and recovery protocols."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Settings */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Moon size={15} className="text-[var(--color-info)]" />
              <h3 className="panel-title">Display_Mode</h3>
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
              <Moon size={14} /> Dark
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
              <Sun size={14} /> Light
            </button>
          </div>
          <p className="mt-3 font-mono text-xs uppercase text-black/50">
            Current: {theme.toUpperCase()}_THEME
          </p>
        </GlassCard>

        {/* Data Import/Export */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Upload size={15} className="text-[var(--color-accent)]" />
              <h3 className="panel-title">Data_Transfer</h3>
            </div>
            <Pill className="neo-pill-accent">ACTIVE</Pill>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              className="neo-box neo-button neo-button-accent flex items-center gap-2"
              onClick={async () => {
                await exportAll();
                toast.success("Fleet data exported");
              }}
            >
              <Download size={14} />
              Export_JSON
            </button>

            <label className="neo-box neo-button cursor-pointer flex items-center gap-2 hover:bg-[var(--color-accent)]">
              <Upload size={14} />
              Import_JSON
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
                  toast.success("Fleet data imported");
                }}
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase text-black/50">Mode:</span>
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.currentTarget.value as "merge" | "replace")
              }
              className="neo-input px-3 py-1.5 text-xs"
            >
              <option value="merge">MERGE_DATA</option>
              <option value="replace">REPLACE_ALL</option>
            </select>
          </div>
        </GlassCard>

        {/* Recovery Actions */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-[var(--color-alert)]" />
              <h3 className="panel-title">System_Recovery</h3>
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
                toast.success("System reset complete");
              }}
            >
              <Power size={14} />
              Reset_All_Data
            </button>
            <button
              type="button"
              className="neo-box neo-button flex items-center gap-2"
              onClick={() =>
                setFakeError(new Error("Simulated panel failure for demo"))
              }
            >
              <AlertTriangle size={14} />
              Trigger_Error_Demo
            </button>
          </div>
          <p className="mt-3 font-mono text-xs uppercase text-black/50">
            ⚠ Recovery actions are irreversible.
          </p>
        </GlassCard>

        {/* LLM Configuration */}
        <GlassCard>
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-[var(--color-info)]" />
              <h3 className="panel-title">LLM_Config</h3>
            </div>
            <Pill className="neo-pill-info">ONLINE</Pill>
          </div>
          <div className="neo-inset bg-gray-100 p-4 font-mono text-xs">
            <p className="text-black/70 mb-3 uppercase">Runtime mode controlled by environment variables:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">➜</span>
                <code className="bg-black text-white px-2 py-1">NEXT_PUBLIC_MOCK_LLM=1</code>
                <span className="text-black/50">- Offline deterministic fallback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">➜</span>
                <code className="bg-black text-white px-2 py-1">NEXT_PUBLIC_MOCK_LLM=0</code>
                <span className="text-black/50">- OpenAI-compatible provider</span>
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
