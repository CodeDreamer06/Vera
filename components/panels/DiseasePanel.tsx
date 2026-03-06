"use client";

import { AlertTriangle, Scan, Upload } from "lucide-react";
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
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Scan size={15} className="text-[var(--color-alert)]" />
          <h3 className="panel-title">Disease_Triage</h3>
        </div>
        <Pill className="neo-pill">{plantId.slice(-6)}</Pill>
      </div>

      <label className="neo-inset mb-3 flex cursor-pointer items-center justify-center border-dashed border-2 bg-gray-100 p-4 text-sm hover:bg-gray-200 transition-colors group">
        <div className="flex flex-col items-center gap-2 text-black/70">
          <Upload size={24} className="group-hover:text-[var(--color-accent)] transition-colors" />
          <span className="font-mono text-xs uppercase">Upload or capture leaf image</span>
        </div>
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
        <div className="mb-3 overflow-hidden neo-inset border-2">
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
        className="neo-box neo-button neo-button-accent w-full disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
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
        <Scan size={14} />
        {loading ? "ANALYZING..." : "Analyze Image"}
      </button>

      <div className="mt-4 space-y-3">
        {scans.length === 0 ? (
          <div className="neo-inset bg-gray-100 p-4 text-center">
            <p className="font-mono text-xs uppercase text-black/50">
              No scans yet.
            </p>
          </div>
        ) : (
          scans
            .slice()
            .reverse()
            .slice(0, 3)
            .map((scan, index) => (
              <article
                key={scan.id}
                className={`neo-inset p-3 ${scan.confidence > 0.7 ? "border-alert-glow" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[var(--color-alert)] font-black">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {scan.confidence > 0.7 && (
                    <AlertTriangle size={14} className="text-[var(--color-alert)]" />
                  )}
                  <p className="font-black uppercase text-sm">
                    {scan.label || scan.mockLabel || "Unknown"}
                  </p>
                  <span className="ml-auto font-mono text-[10px] bg-black text-white px-2 py-1">
                    {Math.round(scan.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm text-black/75 mb-2 font-mono text-xs uppercase">{scan.llmNarrative}</p>
                <div className="border-t border-black/20 pt-2">
                  <p className="text-[10px] font-mono uppercase text-black/50 mb-1">Treatment Plan:</p>
                  <ul className="space-y-1">
                    {scan.treatmentPlan.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs">
                        <span className="text-[var(--color-accent)] font-bold">☐</span>
                        <span className="uppercase">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))
        )}
      </div>
    </GlassCard>
  );
}
