"use client";

import { Bell, Command, Leaf, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Pill } from "@/components/ui/Glass";

export function AppShell({
  children,
  rightActions,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  rightActions?: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();

  const nav = [
    { href: "/", label: "Command Center", icon: Leaf },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_32%),radial-gradient(circle_at_top_left,rgba(34,197,94,0.1),transparent_28%),#060913] text-white">
      <div className="mx-auto grid w-full max-w-[1500px] gap-4 p-4 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
          <h1 className="mb-4 font-display text-lg font-semibold tracking-tight">
            Vera
          </h1>
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "text-white/75 hover:bg-white/10"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 space-y-2 text-xs text-white/65">
            <p>Command shortcuts:</p>
            <Pill className="w-full justify-center gap-1">
              <Command size={11} /> Ctrl/Cmd+K
            </Pill>
            <Pill className="w-full justify-center gap-1">
              <Bell size={11} /> A
            </Pill>
          </div>
        </aside>

        <main className="space-y-4">
          <header className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                  Hydroponic Command Center
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="text-sm text-white/65">{subtitle}</p>
              </div>
              <div className="flex items-center gap-2">{rightActions}</div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
