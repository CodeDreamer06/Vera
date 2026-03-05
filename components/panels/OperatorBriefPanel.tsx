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
        <h3 className="text-sm font-semibold text-black">
          Operator Mode Briefing
        </h3>
        <button
          type="button"
          className="neo-box neo-button neo-button-accent"
          onClick={onGenerate}
        >
          {loading ? "Generating..." : "Generate Brief"}
        </button>
      </div>

      {latest ? (
        <article className="neo-inset bg-gray-100 p-3">
          <p className="text-[11px] text-black/55">
            {formatDateTime(latest.createdAt)}
          </p>
          <p className="mt-1 text-sm text-black/85">{latest.summary}</p>
          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <p className="mb-1 text-black/65">Top risks</p>
              <ul className="list-disc space-y-1 pl-4 text-black/80">
                {latest.topRisks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-black/65">Action checklist</p>
              <ul className="list-disc space-y-1 pl-4 text-black/80">
                {latest.actionChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ) : (
        <p className="text-sm text-black/65">
          No brief yet. Generate one to summarize fleet risk and next actions.
        </p>
      )}
    </GlassCard>
  );
}
