"use client";

import { motion } from "framer-motion";

import { GlassCard, Pill } from "@/components/ui/Glass";
import { formatDateTime } from "@/lib/utils";
import type { PersonaMessage, PersonaTone } from "@/types/domain";

const tones: PersonaTone[] = ["calm", "dramatic", "scientific", "funny"];

export function PersonaPanel({
  messages,
  tone,
  onTone,
  onRefresh,
}: {
  messages: PersonaMessage[];
  tone: PersonaTone;
  onTone: (tone: PersonaTone) => void;
  onRefresh: () => void;
}) {
  const latest = messages.at(-1);

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">
          Sentient Plant Persona
        </h3>
        <button
          type="button"
          className="rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-500/25"
          onClick={onRefresh}
        >
          Refresh Persona
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {tones.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onTone(item)}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              tone === item
                ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {latest ? (
        <motion.div
          key={latest.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <Pill>{latest.state}</Pill>
            <span className="text-[11px] text-white/50">
              {formatDateTime(latest.timestamp)}
            </span>
          </div>
          <p className="text-sm text-white/85">{latest.message}</p>
        </motion.div>
      ) : (
        <p className="text-sm text-white/60">
          Generate a persona update to begin message history.
        </p>
      )}
    </GlassCard>
  );
}
