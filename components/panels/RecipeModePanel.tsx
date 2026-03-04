"use client";

import { useMemo, useState } from "react";

import { GlassCard } from "@/components/ui/Glass";
import { type Plant, type SensorReading, STAGE_TARGETS } from "@/types/domain";

interface RecipeModePanelProps {
  plant: Plant;
  latest?: SensorReading;
  onExplain: (summary: string, interventions: string[]) => Promise<string>;
}

export function RecipeModePanel({
  plant,
  latest,
  onExplain,
}: RecipeModePanelProps) {
  const [narrative, setNarrative] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const targets = STAGE_TARGETS[plant.stage];

  const rangeNotes = useMemo(() => {
    if (!latest) {
      return [] as string[];
    }

    const notes: string[] = [];
    const checks = [
      ["pH", latest.pH, targets.pH],
      ["tds", latest.tds, targets.tds],
      ["do", latest.do, targets.do],
      ["tempC", latest.tempC, targets.tempC],
      ["humidity", latest.humidity, targets.humidity],
    ] as const;

    for (const [name, value, range] of checks) {
      if (value < range[0]) {
        notes.push(
          `${name} is below target (${value.toFixed(2)} < ${range[0]})`,
        );
      } else if (value > range[1]) {
        notes.push(
          `${name} is above target (${value.toFixed(2)} > ${range[1]})`,
        );
      }
    }

    return notes;
  }, [latest, targets]);

  return (
    <GlassCard>
      <h3 className="mb-2 text-sm font-semibold text-white">
        Recipe Mode: {plant.stage}
      </h3>
      <p className="mb-2 text-xs text-white/65">
        Stage targets pH {targets.pH[0]}-{targets.pH[1]} · TDS {targets.tds[0]}-
        {targets.tds[1]} · DO {targets.do[0]}-{targets.do[1]}
      </p>

      {rangeNotes.length > 0 ? (
        <ul className="mb-2 list-disc space-y-1 pl-4 text-xs text-amber-100">
          {rangeNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-2 text-xs text-emerald-100">
          All tracked metrics are currently inside stage-safe margins.
        </p>
      )}

      <button
        type="button"
        className="rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-500/25"
        onClick={async () => {
          setLoading(true);
          try {
            const response = await onExplain(
              `Plant stage ${plant.stage}. ${rangeNotes.join(". ") || "Metrics in range."}`,
              [
                "adjust nutrient recipe",
                "change humidity setpoint",
                "schedule gradual correction",
              ],
            );
            setNarrative(response);
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Generating stage guidance..." : "Explain stage tradeoffs"}
      </button>

      {narrative ? (
        <p className="mt-2 text-sm text-white/80">{narrative}</p>
      ) : null}
    </GlassCard>
  );
}
