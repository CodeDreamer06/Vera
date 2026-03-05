"use client";

import { ErrorCard } from "@/components/ui/ErrorCard";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid-bg text-black">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
          <ErrorCard
            error={error}
            context={{
              panel: "global-error",
              details: { digest: error.digest },
            }}
            onRetry={reset}
          />
        </main>
      </body>
    </html>
  );
}
