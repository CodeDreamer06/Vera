export interface ErrorContext {
  panel: string;
  plantId?: string;
  timeRange?: string;
  actionId?: string;
  details?: Record<string, unknown>;
}

export const serializeErrorDetails = (
  error: unknown,
  context: ErrorContext,
): string => {
  const e = error as Error;

  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      context,
      error: {
        name: e?.name ?? "Error",
        message: e?.message ?? "Unknown error",
        stack: e?.stack ?? "No stack",
      },
    },
    null,
    2,
  );
};

export const copyDebugDetails = async (payload: string) => {
  await navigator.clipboard.writeText(payload);
};
