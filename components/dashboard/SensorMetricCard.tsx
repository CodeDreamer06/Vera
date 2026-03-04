import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

const statusClass: Record<"good" | "warn" | "critical", string> = {
  good: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  warn: "border-amber-400/35 bg-amber-500/10 text-amber-100",
  critical: "border-rose-400/35 bg-rose-500/10 text-rose-100",
};

export function SensorMetricCard({
  label,
  value,
  unit,
  hint,
  status,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit: string;
  hint: string;
  status: "good" | "warn" | "critical";
  icon: LucideIcon;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        statusClass[status],
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/75">
          {label}
        </p>
        <Icon size={14} className="text-white/80" />
      </div>
      <p className="font-mono text-xl font-semibold leading-none">
        {value}
        <span className="ml-1 text-sm text-white/75">{unit}</span>
      </p>
      <p className="mt-1 text-[11px] text-white/70">{hint}</p>
    </div>
  );
}
