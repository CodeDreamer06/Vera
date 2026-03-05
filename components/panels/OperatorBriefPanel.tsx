"use client";

import { FileText } from "lucide-react";

import { GlassCard } from "@/components/ui/Glass";
import { formatDateTime } from "@/lib/utils";
import type { OpsBrief } from "@/types/domain";

export function OperatorBriefPanel({
  briefs,
  onGenerate,
  loading,
}: {
  briefs: OpsBrief[];
  onGenerate: () => void;
  loading: boolean;
}) {
  const latest = briefs[0];

  return (
    <GlassCard>
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-[var(--color-info)]" />
          <h3 className="panel-title">Ops_Briefing</h3>
        </div>
        <button
          type="button"
          className="neo-box neo-button neo-button-accent text-xs"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? "PROCESSING..." : "Generate"}
        </button>
      </div>

      {latest ? (
        <article className="neo-inset bg-gray-100 p-4">
          <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
            <span className="font-mono text-[10px] uppercase text-black/50">
              {formatDateTime(latest.createdAt)}
            </span>
            <span className="neo-pill neo-pill-accent">ACTIVE</span>
          </div>
          <p className="text-sm text-black/85 font-medium mb-4">{latest.summary}</p>
          
          <div className="grid gap-3 text-xs">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase text-black/50 border-b border-black/20 pb-1">
                Top_Risks
              </p>
              <ul className="space-y-1">
                {latest.topRisks.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-black/80">
                    <span className="text-[var(--color-alert)] font-bold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="uppercase">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase text-black/50 border-b border-black/20 pb-1">
                Actions
              </p>
              <ul className="space-y-1">
                {latest.actionChecklist.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-black/80">
                    <span className="text-[var(--color-accent)] font-bold">☐</span>
                    <span className="uppercase">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ) : (
        <div className="neo-inset bg-gray-100 p-6 text-center">
          <div className="text-3xl mb-2">◉</div>
          <p className="font-mono text-xs uppercase text-black/50">
            No brief available.
          </p>
          <p className="font-mono text-[10px] uppercase text-black/30 mt-1">
            Generate to receive fleet briefing.
          </p>
        </div>
      )}
    </GlassCard>
  );
}
