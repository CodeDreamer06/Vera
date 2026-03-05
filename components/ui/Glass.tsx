import { clsx } from "clsx";
import type { ReactNode } from "react";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={clsx("neo-box neo-card bg-white p-4", className)}>
      {children}
    </section>
  );
}

export function Pill({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <span className={clsx("neo-pill", className)}>{children}</span>;
}
