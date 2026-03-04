"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { GlassCard, Pill } from "@/components/ui/Glass";
import type { PersonaMessage, Plant, SensorReading } from "@/types/domain";

export function PlantCard({
  plant,
  latest,
  persona,
  onFocus,
}: {
  plant: Plant;
  latest?: SensorReading;
  persona?: PersonaMessage;
  onFocus: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <GlassCard className="group relative overflow-hidden">
        <div className="pointer-events-none absolute -top-14 right-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={onFocus}
              className="text-left text-lg font-semibold tracking-tight text-white hover:text-emerald-200"
            >
              {plant.name}
            </button>
            <p className="text-xs text-white/60">
              {plant.species} · {plant.zone} · {plant.stage}
            </p>
          </div>
          <Pill className="border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
            Health {plant.healthScore}
          </Pill>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/85">
          <div className="rounded-lg bg-white/5 p-2">
            pH {latest?.pH.toFixed(2) ?? "--"}
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            TDS {latest ? Math.round(latest.tds) : "--"}
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            DO {latest?.do.toFixed(1) ?? "--"}
          </div>
        </div>

        <p className="mt-4 min-h-12 text-sm text-white/75">
          {persona?.message ?? "No persona insight yet."}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <Link
            href={`/plants/${plant.id}`}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
          >
            Open detail
          </Link>
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,.9)]" />
        </div>
      </GlassCard>
    </motion.div>
  );
}
