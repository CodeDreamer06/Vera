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
        <h3 className="text-sm font-semibold text-black">
          Sentient Plant Persona
        </h3>
        <button
          type="button"
          className="neo-box neo-button neo-button-info"
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
            className={`neo-pill transition ${
              tone === item
                ? "bg-[var(--color-accent)]"
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
          className="neo-inset bg-gray-100 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <Pill>{latest.state}</Pill>
            <span className="text-[11px] text-black/50">
              {formatDateTime(latest.timestamp)}
            </span>
          </div>
          <p className="text-sm text-black/85">{latest.message}</p>
        </motion.div>
      ) : (
        <p className="text-sm text-black/65">
          Generate a persona update to begin message history.
        </p>
      )}
    </GlassCard>
  );
}
