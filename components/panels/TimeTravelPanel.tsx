"use client";

import { motion } from "framer-motion";
import { Clock, Leaf } from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, Pill } from "@/components/ui/Glass";
import { projectFutureState } from "@/lib/mock/forecast";
import type { SensorReading, TimeTravelControls } from "@/types/domain";

const VisualState = ({ status }: { status: "wilted" | "stable" | "lush" }) => {
  const color =
    status === "lush" ? "#ccff00" : status === "stable" ? "#f59e0b" : "#ff2a2a";
  const leafTilt = status === "wilted" ? 28 : status === "stable" ? 6 : -8;

  return (
    <svg
      viewBox="0 0 200 140"
      className="h-36 w-full border-2 border-black bg-gray-100"
      role="img"
      aria-label={`Projected plant state ${status}`}
    >
      <title>{`Projected plant state: ${status}`}</title>
      <defs>
        <radialGradient id={`glow-${status}`} cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="140" fill={`url(#glow-${status})`} />
      <path
        d="M98 128 C100 105, 102 90, 100 62"
        stroke="#000"
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
        stroke="#000"
        strokeWidth="2"
      />
      <ellipse
        cx="118"
        cy="74"
        rx="24"
        ry="11"
        transform={`rotate(${-leafTilt} 118 74)`}
        fill={color}
        stroke="#000"
        strokeWidth="2"
      />
      <rect x="70" y="126" width="60" height="10" fill="#000" />
      
      {/* Status label */}
      <text x="100" y="20" textAnchor="middle" className="font-mono text-[14px] font-black uppercase" fill="#000">
        {status}
      </text>
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
        <div className="neo-inset bg-gray-100 p-6 text-center">
          <div className="text-3xl mb-2">◉</div>
          <p className="font-mono text-xs uppercase text-black/50">
            No telemetry available.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-[var(--color-info)]" />
          <h3 className="panel-title">Time_Travel</h3>
        </div>
        {projection ? (
          <Pill className="neo-pill-accent">DAY+{controls.day}</Pill>
        ) : null}
      </div>

      {projection ? (
        <div className="space-y-4">
          <VisualState status={projection.status} />

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono uppercase">
              <span className="text-black/50">Horizon (days)</span>
              <span className="font-bold">{controls.day}D</span>
            </div>
            <input
              id="time-travel-day"
              type="range"
              min={0}
              max={7}
              value={controls.day}
              onChange={(e) => {
                const val = Number(e.currentTarget.value);
                setControls((prev) => ({
                  ...prev,
                  day: val,
                }));
              }}
              className="w-full accent-[var(--color-accent)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {[
              { key: "increaseAeration", label: "Increase aeration" },
              { key: "reduceTemp", label: "Reduce temp 2°C" },
              { key: "rebalanceNutrients", label: "Rebalance nutrients" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={
                    controls[item.key as keyof TimeTravelControls] as boolean
                  }
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setControls((prev) => ({
                      ...prev,
                      [item.key]: checked,
                    }));
                  }}
                  className="w-4 h-4 accent-[var(--color-accent)]"
                />
                <span className="font-mono uppercase">{item.label}</span>
              </label>
            ))}
          </div>

          <div className="neo-inset bg-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[10px] uppercase text-black/50">Projected Vitality</p>
              <span className="text-2xl font-black seven-seg">{projection.score}</span>
            </div>
            <div className="w-full bg-black h-2 mb-3">
              <div 
                className="h-full bg-[var(--color-accent)]" 
                style={{ width: `${Math.max(0, Math.min(100, projection.score))}%` }}
              />
            </div>
            <p className="text-sm text-black/70 font-mono uppercase">{projection.explanation}</p>
          </div>

          <button
            type="button"
            className="neo-box neo-button neo-button-info w-full"
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
            {loading ? "GENERATING..." : "Narrate Future"}
          </button>

          {narrative ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="neo-inset bg-gray-100 p-3 text-sm text-black/80 font-mono"
            >
              <span className="text-[var(--color-accent)]">&gt;</span> {narrative}
            </motion.div>
          ) : null}
        </div>
      ) : null}
    </GlassCard>
  );
}
