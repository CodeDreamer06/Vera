"use client";

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
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Operator Mode Briefing
        </h3>
        <button
          type="button"
          className="rounded-lg border border-amber-300/35 bg-amber-500/15 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-500/25"
          onClick={onGenerate}
        >
          {loading ? "Generating..." : "Generate Brief"}
        </button>
      </div>

      {latest ? (
        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] text-white/55">
            {formatDateTime(latest.createdAt)}
          </p>
          <p className="mt-1 text-sm text-white/85">{latest.summary}</p>
          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <p className="mb-1 text-white/60">Top risks</p>
              <ul className="list-disc space-y-1 pl-4 text-white/80">
                {latest.topRisks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-white/60">Action checklist</p>
              <ul className="list-disc space-y-1 pl-4 text-white/80">
                {latest.actionChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ) : (
        <p className="text-sm text-white/60">
          No brief yet. Generate one to summarize fleet risk and next actions.
        </p>
      )}
    </GlassCard>
  );
}
