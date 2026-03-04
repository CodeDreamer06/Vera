"use client";

import { motion } from "framer-motion";

import { GlassCard, Pill } from "@/components/ui/Glass";
import { formatDateTime } from "@/lib/utils";
import type { Alert, PersonaMessage } from "@/types/domain";

const severityClass: Record<Alert["severity"], string> = {
  low: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
  medium: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  high: "border-orange-400/30 bg-orange-500/10 text-orange-100",
  critical: "border-rose-400/30 bg-rose-500/15 text-rose-100",
};

export function AlertsCenter({
  alerts,
  personaByPlant,
  open,
  onClose,
}: {
  alerts: Alert[];
  personaByPlant: Record<string, PersonaMessage[]>;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg p-4">
      <motion.div
        initial={{ x: 18, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 18, opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        <GlassCard className="h-[calc(100vh-2rem)] overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Alerts Center</h3>
            <button
              type="button"
              className="rounded-lg border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="space-y-2 overflow-auto pb-4">
            {alerts.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                No active alerts.
              </p>
            ) : (
              alerts
                .slice()
                .reverse()
                .map((alert) => (
                  <article
                    key={alert.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Pill className={severityClass[alert.severity]}>
                        {alert.severity}
                      </Pill>
                      <span className="text-[11px] text-white/55">
                        {formatDateTime(alert.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-white">
                      {alert.title}
                    </h4>
                    <p className="mt-1 text-xs text-white/70">
                      {alert.description}
                    </p>
                    {personaByPlant[alert.plantId]?.at(-1) ? (
                      <p className="mt-2 rounded-lg bg-white/5 p-2 text-xs text-cyan-100/90">
                        “{personaByPlant[alert.plantId].at(-1)?.message}”
                      </p>
                    ) : null}
                  </article>
                ))
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
