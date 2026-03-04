"use client";

import { useState } from "react";

import { GlassCard } from "@/components/ui/Glass";
import { formatDateTime } from "@/lib/utils";
import type { Anomaly } from "@/types/domain";
import type { RootCauseResponse } from "@/types/llm";

export function AnomalyFeed({
  anomalies,
  onExplain,
}: {
  anomalies: Anomaly[];
  onExplain: (anomaly: Anomaly) => Promise<RootCauseResponse>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<
    Record<string, RootCauseResponse>
  >({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  return (
    <GlassCard>
      <h3 className="mb-3 text-sm font-semibold text-white">
        Anomaly Feed + Root-Cause Ranking
      </h3>
      <div className="space-y-2">
        {anomalies
          .slice()
          .reverse()
          .slice(0, 8)
          .map((anomaly) => (
            <article
              key={anomaly.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-white">{anomaly.patternType}</p>
                  <p className="text-xs text-white/55">
                    {anomaly.metric} · {formatDateTime(anomaly.detectedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-white/15 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
                  onClick={async () => {
                    setExpanded(anomaly.id);
                    if (!explanations[anomaly.id]) {
                      setLoadingId(anomaly.id);
                      try {
                        const response = await onExplain(anomaly);
                        setExplanations((prev) => ({
                          ...prev,
                          [anomaly.id]: response,
                        }));
                      } finally {
                        setLoadingId(null);
                      }
                    }
                  }}
                >
                  Explain spike
                </button>
              </div>
              <p className="mt-2 text-xs text-white/70">{anomaly.notes}</p>

              {expanded === anomaly.id ? (
                <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-white/80">
                  {loadingId === anomaly.id ? (
                    <p>Generating root-cause narrative...</p>
                  ) : explanations[anomaly.id] ? (
                    <>
                      <p className="font-medium">
                        {explanations[anomaly.id].summary}
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {explanations[anomaly.id].rankedCauses.map((cause) => (
                          <li key={cause.cause}>
                            {cause.cause} ({Math.round(cause.confidence * 100)}
                            %)
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>No explanation yet.</p>
                  )}
                </div>
              ) : null}
            </article>
          ))}
      </div>
    </GlassCard>
  );
}
