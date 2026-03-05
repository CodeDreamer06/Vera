"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[var(--color-accent)]" />
          <h3 className="panel-title">
            Sentient_Persona
          </h3>
        </div>
        <button
          type="button"
          className="neo-box neo-button neo-button-info"
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tones.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onTone(item)}
            className={`neo-pill transition ${
              tone === item
                ? "neo-pill-accent border-black"
                : "bg-white"
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
          className="neo-inset bg-gray-100 p-4"
        >
          <div className="mb-3 flex items-center justify-between border-b-2 border-black pb-2">
            <Pill className="neo-pill-info">{latest.state}</Pill>
            <span className="text-[11px] font-mono uppercase text-black/50">
              {formatDateTime(latest.timestamp)}
            </span>
          </div>
          <p className="text-sm text-black/85 font-medium leading-relaxed">
            "{latest.message}"
          </p>
        </motion.div>
      ) : (
        <div className="neo-inset bg-gray-100 p-6 text-center">
          <div className="text-3xl mb-2">◉</div>
          <p className="font-mono text-xs uppercase text-black/50">
            No persona data available.
          </p>
          <p className="font-mono text-[10px] uppercase text-black/30 mt-1">
            Click refresh to initialize.
          </p>
        </div>
      )}
    </GlassCard>
  );
}
