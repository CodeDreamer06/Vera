"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { GlassCard, Pill } from "@/components/ui/Glass";
import { projectFutureState } from "@/lib/mock/forecast";
import type { SensorReading, TimeTravelControls } from "@/types/domain";

const VisualState = ({ status }: { status: "wilted" | "stable" | "lush" }) => {
  const color =
    status === "lush" ? "#22c55e" : status === "stable" ? "#f59e0b" : "#fb7185";
  const leafTilt = status === "wilted" ? 28 : status === "stable" ? 6 : -8;

  return (
    <svg
      viewBox="0 0 200 140"
      className="h-36 w-full rounded-xl bg-gradient-to-b from-white/5 to-transparent"
      role="img"
      aria-label={`Projected plant state ${status}`}
    >
      <title>{`Projected plant state: ${status}`}</title>
      <defs>
        <radialGradient id="glow" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="140" fill="url(#glow)" />
      <path
        d="M98 128 C100 105, 102 90, 100 62"
        stroke="#a3e635"
        strokeWidth="4"
        fill="none"
      />
      <ellipse
        cx="88"
        cy="64"
        rx="28"
        ry="12"
        transform={`rotate(${leafTilt} 88 64)`}
        fill={color}
      />
      <ellipse
        cx="118"
        cy="74"
        rx="24"
        ry="11"
        transform={`rotate(${-leafTilt} 118 74)`}
        fill={color}
      />
      <rect x="70" y="126" width="60" height="10" rx="4" fill="#334155" />
    </svg>
  );
};

export function TimeTravelPanel({
  latest,
  onNarrate,
}: {
  latest?: SensorReading;
  onNarrate: (controls: TimeTravelControls, summary: string) => Promise<string>;
}) {
  const [controls, setControls] = useState<TimeTravelControls>({
    day: 3,
    increaseAeration: false,
    reduceTemp: false,
    rebalanceNutrients: false,
  });
  const [narrative, setNarrative] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const projection = useMemo(() => {
    if (!latest) {
      return null;
    }

    return projectFutureState(latest, controls);
  }, [latest, controls]);

  if (!latest) {
    return (
      <GlassCard>
        <p className="text-sm text-white/70">
          No telemetry yet for time travel simulation.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Time Travel Simulation
        </h3>
        {projection ? <Pill>Day +{controls.day}</Pill> : null}
      </div>

      {projection ? (
        <div className="space-y-3">
          <VisualState status={projection.status} />

          <div className="space-y-2">
            <label className="text-xs text-white/70" htmlFor="time-travel-day">
              Horizon (days)
            </label>
            <input
              id="time-travel-day"
              type="range"
              min={0}
              max={7}
              value={controls.day}
              onChange={(e) =>
                setControls((prev) => ({
                  ...prev,
                  day: Number(e.currentTarget.value),
                }))
              }
              className="w-full accent-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
            {[
              { key: "increaseAeration", label: "Increase aeration" },
              { key: "reduceTemp", label: "Reduce temp 2°C" },
              { key: "rebalanceNutrients", label: "Rebalance nutrients" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-2"
              >
                <input
                  type="checkbox"
                  checked={
                    controls[item.key as keyof TimeTravelControls] as boolean
                  }
                  onChange={(e) =>
                    setControls((prev) => ({
                      ...prev,
                      [item.key]: e.currentTarget.checked,
                    }))
                  }
                />
                {item.label}
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-white/60">Projected vitality score</p>
            <p className="text-2xl font-semibold text-white">
              {projection.score}
            </p>
            <p className="mt-1 text-sm text-white/70">
              {projection.explanation}
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-500/25"
            onClick={async () => {
              const summary = `Status ${projection.status}, vitality ${projection.score}, day ${controls.day}.`;
              setLoading(true);
              try {
                const text = await onNarrate(controls, summary);
                setNarrative(text);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading
              ? "Generating forecast narrative..."
              : "Narrate future outcome"}
          </button>

          {narrative ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80"
            >
              {narrative}
            </motion.p>
          ) : null}
        </div>
      ) : null}
    </GlassCard>
  );
}
