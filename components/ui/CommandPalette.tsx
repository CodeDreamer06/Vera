"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { Plant } from "@/types/domain";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plants: Plant[];
  onRunAnomaly: () => void;
  onOpenAlerts: () => void;
  onOpenDisease: () => void;
  onOpenShortcuts: () => void;
  onRunBrief: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  plants,
  onRunAnomaly,
  onOpenAlerts,
  onOpenDisease,
  onOpenShortcuts,
  onRunBrief,
}: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm">
      <Command
        label="Command Palette"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#090d1a] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          placeholder="Type a command or plant name..."
          className="w-full border-b border-white/10 bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-[60vh] overflow-auto p-2">
          <Command.Empty className="p-3 text-sm text-white/60">
            No results.
          </Command.Empty>

          <Command.Group
            heading="Actions"
            className="px-2 text-xs text-white/50"
          >
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-white/10"
              onSelect={() => {
                onOpenAlerts();
                onOpenChange(false);
              }}
            >
              Open alerts center
            </Command.Item>
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-white/10"
              onSelect={() => {
                onOpenDisease();
                onOpenChange(false);
              }}
            >
              Open disease panel
            </Command.Item>
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-white/10"
              onSelect={() => {
                onRunAnomaly();
                onOpenChange(false);
              }}
            >
              Inject demo anomaly
            </Command.Item>
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-white/10"
              onSelect={() => {
                onRunBrief();
                onOpenChange(false);
              }}
            >
              Generate operator briefing
            </Command.Item>
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-white/10"
              onSelect={() => {
                onOpenShortcuts();
                onOpenChange(false);
              }}
            >
              Show keyboard shortcuts
            </Command.Item>
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-white/10"
              onSelect={() => {
                router.push("/settings");
                onOpenChange(false);
              }}
            >
              Open settings
            </Command.Item>
          </Command.Group>

          <Command.Group
            heading="Plants"
            className="mt-2 px-2 text-xs text-white/50"
          >
            {plants.map((plant) => (
              <Command.Item
                key={plant.id}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-white/10"
                onSelect={() => {
                  router.push(`/plants/${plant.id}`);
                  onOpenChange(false);
                }}
              >
                {plant.name} · {plant.species} · {plant.zone}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
