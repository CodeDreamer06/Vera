"use client";

import { motion } from "framer-motion";

import { GlassCard, Pill } from "@/components/ui/Glass";
import { formatDateTime } from "@/lib/utils";
import type { Alert, PersonaMessage } from "@/types/domain";

const severityClass: Record<Alert["severity"], string> = {
  low: "bg-[#b8fff4]",
  medium: "bg-[var(--color-accent)]",
  high: "bg-[#ffd290]",
  critical: "bg-[var(--color-alert)] text-white",
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
            <h3 className="text-lg font-semibold text-black">Alerts Center</h3>
            <button
              type="button"
              className="neo-box neo-button"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="space-y-2 overflow-auto pb-4">
            {alerts.length === 0 ? (
              <p className="neo-inset bg-gray-100 p-4 text-sm text-black/70">
                No active alerts.
              </p>
            ) : (
              alerts
                .slice()
                .reverse()
                .map((alert) => (
                  <article
                    key={alert.id}
                    className="neo-inset bg-gray-100 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Pill className={severityClass[alert.severity]}>
                        {alert.severity}
                      </Pill>
                      <span className="text-[11px] text-black/55">
                        {formatDateTime(alert.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-black">
                      {alert.title}
                    </h4>
                    <p className="mt-1 text-xs text-black/70">
                      {alert.description}
                    </p>
                    {personaByPlant[alert.plantId]?.at(-1) ? (
                      <p className="mt-2 border-l-2 border-black bg-white p-2 text-xs text-black/80">
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
