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
    <div className="neo-box bg-[#ffd8d8] p-4 text-black">
      <p className="text-sm font-semibold">Panel Failure: {context.panel}</p>
      <p className="mt-2 text-sm text-black/85">
        We hit an unexpected issue while rendering this panel. You can retry,
        reopen the panel, or reset demo data.
      </p>
      <p className="mt-2 text-xs text-black/70">
        Context: plant={context.plantId ?? "n/a"} range=
        {context.timeRange ?? "n/a"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {onRetry ? (
          <button
            type="button"
            className="neo-box neo-button neo-button-alert"
            onClick={onRetry}
          >
            Retry
          </button>
        ) : null}
        {onReopen ? (
          <button
            type="button"
            className="neo-box neo-button"
            onClick={onReopen}
          >
            Reopen Panel
          </button>
        ) : null}
        {onReset ? (
          <button
            type="button"
            className="neo-box neo-button"
            onClick={onReset}
          >
            Reset Local Data
          </button>
        ) : null}
        <button
          type="button"
          className="neo-box neo-button"
          onClick={() => copyDebugDetails(payload)}
        >
          Copy Debug Details
        </button>
      </div>

      <button
        type="button"
        className="mt-4 text-xs text-black/80 underline-offset-2 hover:underline"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Hide technical details" : "Show technical details"}
      </button>

      {expanded ? (
        <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-black p-3 text-[10px] leading-4 text-white">
          {payload}
        </pre>
      ) : null}
    </div>
  );
}
