"use client";

import { useState } from "react";
import { AlertTriangle, Brain } from "lucide-react";

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
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-[var(--color-alert)]" />
          <h3 className="panel-title">Anomaly_Feed</h3>
        </div>
        <span className="neo-pill neo-pill-alert">
          {anomalies.length}_ACTIVE
        </span>
      </div>
      
      <div className="space-y-3">
        {anomalies.length === 0 ? (
          <div className="neo-inset bg-gray-100 p-6 text-center">
            <div className="text-3xl mb-2 text-green-500">✓</div>
            <p className="font-mono text-xs uppercase text-black/50">
              No anomalies detected.
            </p>
            <p className="font-mono text-[10px] uppercase text-black/30 mt-1">
              All systems nominal.
            </p>
          </div>
        ) : (
          anomalies
            .slice()
            .reverse()
            .slice(0, 8)
            .map((anomaly, index) => (
              <article
                key={anomaly.id}
                className={`neo-inset p-4 ${index === 0 ? "border-alert-glow" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[var(--color-alert)] font-black text-lg">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm font-black uppercase tracking-tight text-black">
                        {anomaly.patternType}
                      </p>
                    </div>
                    <p className="text-xs text-black/55 font-mono uppercase">
                      {anomaly.metric} // {formatDateTime(anomaly.detectedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="neo-box neo-button px-3 py-1.5 text-[10px] flex items-center gap-1"
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
                    <Brain size={12} />
                    Explain
                  </button>
                </div>
                <p className="mt-2 text-xs text-black/70 font-mono uppercase border-l-2 border-black/20 pl-2">
                  {anomaly.notes}
                </p>

                {expanded === anomaly.id ? (
                  <div className="neo-inset mt-3 bg-white p-3 text-xs">
                    {loadingId === anomaly.id ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-pulse">⏵</span>
                        <span className="font-mono uppercase">Analyzing root cause...</span>
                      </div>
                    ) : explanations[anomaly.id] ? (
                      <>
                        <div className="flex items-center gap-2 mb-2 border-b border-black/20 pb-2">
                          <Brain size={12} className="text-[var(--color-info)]" />
                          <span className="font-bold uppercase">LLM Analysis</span>
                        </div>
                        <p className="font-medium mb-3">
                          {explanations[anomaly.id].summary}
                        </p>
                        <div className="font-mono text-[10px] uppercase text-black/50 mb-1">
                          Ranked Causes:
                        </div>
                        <ul className="space-y-1">
                          {explanations[anomaly.id].rankedCauses.map((cause, i) => (
                            <li key={cause.cause} className="flex items-center gap-2">
                              <span className="text-[var(--color-accent)] font-bold">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span>{cause.cause}</span>
                              <span className="ml-auto font-mono text-[10px] bg-black text-white px-1">
                                {Math.round(cause.confidence * 100)}%
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="font-mono uppercase text-black/50">No explanation available.</p>
                    )}
                  </div>
                ) : null}
              </article>
            ))
        )}
      </div>
    </GlassCard>
  );
}
