"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
      <ErrorCard
        error={error}
        context={{ panel: "route-error", details: { digest: error.digest } }}
        onRetry={reset}
      />
    </main>
  );
}
