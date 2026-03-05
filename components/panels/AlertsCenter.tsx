"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Bell, X } from "lucide-react";

import { GlassCard, Pill } from "@/components/ui/Glass";
import { formatDateTime } from "@/lib/utils";
import type { Alert, PersonaMessage } from "@/types/domain";

const severityClass: Record<Alert["severity"], string> = {
  low: "neo-pill bg-[#b8fff4]",
  medium: "neo-pill neo-pill-accent",
  high: "neo-pill bg-[#ffd290]",
  critical: "neo-pill neo-pill-alert",
};

const severityIcon = (severity: Alert["severity"]) => {
  if (severity === "critical" || severity === "high") {
    return <AlertTriangle size={12} className="mr-1" />;
  }
  return null;
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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg p-4">
      <motion.div
        initial={{ x: 18, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 18, opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        <GlassCard className="h-[calc(100vh-2rem)] overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[var(--color-alert)]" />
              <h3 className="text-lg font-black uppercase tracking-tight">Alerts_Center</h3>
              <span className="neo-pill neo-pill-alert">
                {alerts.length}_ACTIVE
              </span>
            </div>
            <button
              type="button"
              className="neo-box neo-button px-3 py-2"
              onClick={onClose}
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto pb-4 max-h-[calc(100vh-8rem)]">
            {alerts.length === 0 ? (
              <div className="neo-inset bg-gray-100 p-6 text-center">
                <div className="text-4xl mb-2 text-green-500">✓</div>
                <p className="font-mono text-xs uppercase text-black/50">
                  No active alerts.
                </p>
                <p className="font-mono text-[10px] uppercase text-black/30 mt-1">
                  All systems nominal.
                </p>
              </div>
            ) : (
              alerts
                .slice()
                .reverse()
                .map((alert, index) => (
                  <article
                    key={alert.id}
                    className={`neo-inset p-4 ${alert.severity === "critical" ? "border-alert-glow" : ""}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Pill className={`${severityClass[alert.severity]} flex items-center`}>
                        {severityIcon(alert.severity)}
                        {alert.severity}
                      </Pill>
                      <span className="text-[11px] font-mono uppercase text-black/55">
                        {formatDateTime(alert.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-black mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-black/70 font-mono uppercase">
                      {alert.description}
                    </p>
                    {personaByPlant[alert.plantId]?.at(-1) ? (
                      <div className="mt-3 border-l-2 border-[var(--color-info)] bg-white p-2">
                        <p className="text-[10px] font-mono uppercase text-[var(--color-info)] mb-1">
                          Unit Feedback:
                        </p>
                        <p className="text-xs text-black/80 italic">
                          "{personaByPlant[alert.plantId].at(-1)?.message}"
                        </p>
                      </div>
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
