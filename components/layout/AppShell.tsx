"use client";

import { Bell, Command, Leaf, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Pill } from "@/components/ui/Glass";
import { useI18n } from "@/lib/i18n";

export function AppShell({
  children,
  rightActions,
  sidebarActions,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  rightActions?: React.ReactNode;
  sidebarActions?: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const nav = [
    { href: "/", label: t("navCommand"), icon: Leaf, slot: "01" },
    { href: "/settings", label: t("navSettings"), icon: Settings, slot: "02" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-black">
      <div className="scanlines" />
      <div className="crt-flicker" />

      <div className="flex min-h-[calc(100vh-42px)]">
        {/* Brutalist Sidebar */}
        <aside className="fixed top-[42px] z-40 hidden h-[calc(100vh-42px)] w-72 flex-col overflow-y-auto border-r-[3px] border-black bg-white lg:flex">
          {/* Logo Block */}
          <div className="relative overflow-hidden border-b-[3px] border-black bg-black p-8 text-white">
            <div className="absolute -right-10 -top-10 h-20 w-20 rotate-45 bg-white opacity-10" />
            <h1 className="glitch mb-1 cursor-default text-5xl font-black tracking-tighter">
              VERA
            </h1>
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-[var(--color-accent)]">
              <span className="status-dot active animate-pulse" />
              v2.0.4_brutalist
            </div>
          </div>

          {/* Navigation Blocks */}
          <nav className="flex-1 space-y-0 py-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`m-0 mb-[3px] flex w-full items-center justify-between border-b-[3px] border-black px-6 py-5 text-left font-black uppercase tracking-wide transition-colors ${
                    active
                      ? "neo-box rounded-none border-0 bg-[var(--color-accent)] shadow-none hover:translate-0 hover:shadow-none"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl leading-none">
                      {active ? "◉" : <Icon size={18} />}
                    </span>
                    {item.label}
                  </span>
                  <span className="font-mono text-xs opacity-45">{item.slot}</span>
                </Link>
              );
            })}
          </nav>

          {/* Terminal Shortcut Block */}
          <div className="border-t-[3px] border-black bg-gray-200 p-6">
            <div className="mb-3 font-mono text-xs font-bold uppercase opacity-60">
              {t("shortcuts")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Pill className="justify-center border-2 px-0 py-2 text-sm">
                <Command size={13} className="mr-1" />K
              </Pill>
              <Pill className="justify-center border-2 px-0 py-2 text-sm text-gray-400">
                <Bell size={13} className="mr-1" />A
              </Pill>
            </div>
            {sidebarActions ? (
              <div className="mt-3 flex flex-col gap-2">{sidebarActions}</div>
            ) : null}
            <div className="mt-4 font-mono text-[10px] uppercase leading-normal text-gray-600">
              {t("pressCmdK")}
              <br />
              {t("commandPalette")}
            </div>
          </div>

          {/* Footer Status */}
          <div className="border-t-[3px] border-[var(--color-accent)] bg-black p-4 font-mono text-[10px] uppercase text-white">
            <div className="mb-1 flex justify-between">
              <span>Mem</span>
              <span>64TB</span>
            </div>
            <div className="h-2 w-full border border-white">
              <div className="h-full w-3/4 border-r border-white bg-[var(--color-accent)]" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="grid-bg relative flex-1 p-4 md:p-8 lg:ml-72">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--color-bg)] via-transparent to-[var(--color-bg)] opacity-70" />

          <div className="relative z-10 mx-auto max-w-[1450px] space-y-6">
            {/* Aggressive Header Section */}
            <header className="neo-box neo-card relative overflow-hidden bg-white p-6 md:p-8 group">
              <div className="absolute left-0 top-0 h-2 w-full bg-black" />
              <div className="absolute -right-10 -top-10 h-40 w-40 rotate-12 border-4 border-black bg-[var(--color-accent)] opacity-20 transition-transform duration-700 group-hover:rotate-45" />

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="lg:w-2/3">
                  <div className="mb-4 inline-block border-2 border-white bg-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    {t("hydroponicDivision")}
                  </div>
                  <h2 className="font-display text-4xl font-black uppercase leading-[0.88] tracking-tighter md:text-6xl">
                    {title}
                  </h2>
                  <p className="mt-3 border-l-4 border-black pl-4 font-mono text-xs uppercase leading-relaxed text-black/75 md:text-sm">
                    {subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:w-1/3 lg:justify-end">
                  {rightActions}
                </div>
              </div>
            </header>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
