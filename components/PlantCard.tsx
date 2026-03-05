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
        <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rotate-12 border-2 border-black bg-[var(--color-accent)] opacity-35 transition-transform duration-300 group-hover:rotate-45" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={onFocus}
              className="glitch text-left text-lg font-semibold tracking-tight text-black"
            >
              {plant.name}
            </button>
            <p className="font-mono text-xs uppercase text-black/65">
              {plant.species} · {plant.zone} · {plant.stage}
            </p>
          </div>
          <Pill className="bg-[var(--color-accent)]">
            Health {plant.healthScore}
          </Pill>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-xs text-black/90">
          <div className="neo-inset p-2">
            pH {latest?.pH.toFixed(2) ?? "--"}
          </div>
          <div className="neo-inset p-2 bg-[var(--color-accent)]">
            TDS {latest ? Math.round(latest.tds) : "--"}
          </div>
          <div className="neo-inset p-2">
            DO {latest?.do.toFixed(1) ?? "--"}
          </div>
        </div>

        <p className="mt-4 min-h-12 border-l-2 border-black pl-2 text-sm text-black/75">
          {persona?.message ?? "No persona insight yet."}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <Link
            href={`/plants/${plant.id}`}
            className="neo-box neo-button px-3 py-1.5 text-xs"
          >
            Open detail
          </Link>
          <span className="status-dot active" />
        </div>
      </GlassCard>
    </motion.div>
  );
}
