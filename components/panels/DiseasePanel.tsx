"use client";

import Image from "next/image";
import { useState } from "react";

import { GlassCard, Pill } from "@/components/ui/Glass";
import type { DiseaseScan } from "@/types/domain";

export function DiseasePanel({
  plantId,
  scans,
  onAnalyze,
}: {
  plantId: string;
  scans: DiseaseScan[];
  onAnalyze: (args: {
    plantId: string;
    imageDataUrlOrBlobKey: string;
    imageMeta: {
      width?: number;
      height?: number;
      size?: number;
      type?: string;
    };
  }) => Promise<void>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    width?: number;
    height?: number;
    size?: number;
    type?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Disease Triage (Mocked model + LLM plan)
        </h3>
        <Pill>{plantId.slice(-6)}</Pill>
      </div>

      <label className="mb-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/70 hover:bg-white/10">
        Upload or capture leaf image
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) {
              return;
            }

            const reader = new FileReader();
            const url = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(String(reader.result ?? ""));
              reader.readAsDataURL(file);
            });
            setPreview(url);
            setMeta({ size: file.size, type: file.type });
          }}
        />
      </label>

      {preview ? (
        <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
          <Image
            src={preview}
            alt="Plant sample"
            width={640}
            height={360}
            className="h-44 w-full object-cover"
          />
        </div>
      ) : null}

      <button
        type="button"
        disabled={!preview || loading}
        className="rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={async () => {
          if (!preview) {
            return;
          }
          setLoading(true);
          try {
            await onAnalyze({
              plantId,
              imageDataUrlOrBlobKey: preview,
              imageMeta: meta,
            });
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Running mocked analysis..." : "Analyze image"}
      </button>

      <div className="mt-4 space-y-2">
        {scans
          .slice()
          .reverse()
          .slice(0, 3)
          .map((scan) => (
            <article
              key={scan.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <p className="font-medium text-white">{scan.mockLabel}</p>
                <p className="text-white/60">
                  Confidence {Math.round(scan.confidence * 100)}%
                </p>
              </div>
              <p className="text-sm text-white/75">{scan.llmNarrative}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-white/70">
                {scan.treatmentPlan.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
      </div>
    </GlassCard>
  );
}
