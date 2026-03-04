"use client";

import { useState } from "react";

import {
  copyDebugDetails,
  type ErrorContext,
  serializeErrorDetails,
} from "@/lib/errors/debug";

interface ErrorCardProps {
  error: unknown;
  context: ErrorContext;
  onRetry?: () => void;
  onReset?: () => void;
  onReopen?: () => void;
}

export function ErrorCard({
  error,
  context,
  onRetry,
  onReset,
  onReopen,
}: ErrorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const payload = serializeErrorDetails(error, context);

  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 text-rose-50 backdrop-blur">
      <p className="text-sm font-semibold">Panel Failure: {context.panel}</p>
      <p className="mt-2 text-sm text-rose-100/90">
        We hit an unexpected issue while rendering this panel. You can retry,
        reopen the panel, or reset demo data.
      </p>
      <p className="mt-2 text-xs text-rose-200/80">
        Context: plant={context.plantId ?? "n/a"} range=
        {context.timeRange ?? "n/a"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {onRetry ? (
          <button
            type="button"
            className="rounded-lg bg-rose-400/20 px-3 py-1.5 text-xs font-medium hover:bg-rose-400/30"
            onClick={onRetry}
          >
            Retry
          </button>
        ) : null}
        {onReopen ? (
          <button
            type="button"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
            onClick={onReopen}
          >
            Reopen Panel
          </button>
        ) : null}
        {onReset ? (
          <button
            type="button"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
            onClick={onReset}
          >
            Reset Local Data
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
          onClick={() => copyDebugDetails(payload)}
        >
          Copy Debug Details
        </button>
      </div>

      <button
        type="button"
        className="mt-4 text-xs text-rose-100 underline-offset-2 hover:underline"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Hide technical details" : "Show technical details"}
      </button>

      {expanded ? (
        <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-black/40 p-3 text-[10px] leading-4 text-rose-50">
          {payload}
        </pre>
      ) : null}
    </div>
  );
}
