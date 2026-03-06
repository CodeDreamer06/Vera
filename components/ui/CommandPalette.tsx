"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24 backdrop-blur-sm">
      <Command
        label={t("paletteTitle")}
        className="w-full max-w-xl overflow-hidden neo-box bg-white text-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          placeholder={t("palettePlaceholder")}
          className="neo-input w-full border-b-[3px] border-black px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-[60vh] overflow-auto p-2">
          <Command.Empty className="p-3 text-sm text-black/60">
            {t("noResults")}
          </Command.Empty>

          <Command.Group
            heading={t("actions")}
            className="px-2 text-xs text-black/50"
          >
            <Command.Item
              className="cursor-pointer border-2 border-transparent px-3 py-2 text-sm data-[selected=true]:border-black data-[selected=true]:bg-[var(--color-accent)]"
              onSelect={() => {
                onOpenAlerts();
                onOpenChange(false);
              }}
            >
              {t("openAlertsCenter")}
            </Command.Item>
            <Command.Item
              className="cursor-pointer border-2 border-transparent px-3 py-2 text-sm data-[selected=true]:border-black data-[selected=true]:bg-[var(--color-accent)]"
              onSelect={() => {
                onOpenDisease();
                onOpenChange(false);
              }}
            >
              {t("openDiseasePanel")}
            </Command.Item>
            <Command.Item
              className="cursor-pointer border-2 border-transparent px-3 py-2 text-sm data-[selected=true]:border-black data-[selected=true]:bg-[var(--color-accent)]"
              onSelect={() => {
                onRunAnomaly();
                onOpenChange(false);
              }}
            >
              {t("injectDemoAnomaly")}
            </Command.Item>
            <Command.Item
              className="cursor-pointer border-2 border-transparent px-3 py-2 text-sm data-[selected=true]:border-black data-[selected=true]:bg-[var(--color-accent)]"
              onSelect={() => {
                onRunBrief();
                onOpenChange(false);
              }}
            >
              {t("generateOperatorBriefing")}
            </Command.Item>
            <Command.Item
              className="cursor-pointer border-2 border-transparent px-3 py-2 text-sm data-[selected=true]:border-black data-[selected=true]:bg-[var(--color-accent)]"
              onSelect={() => {
                onOpenShortcuts();
                onOpenChange(false);
              }}
            >
              {t("showKeyboardShortcuts")}
            </Command.Item>
            <Command.Item
              className="cursor-pointer border-2 border-transparent px-3 py-2 text-sm data-[selected=true]:border-black data-[selected=true]:bg-[var(--color-accent)]"
              onSelect={() => {
                router.push("/settings");
                onOpenChange(false);
              }}
            >
              {t("openSettings")}
            </Command.Item>
          </Command.Group>

          <Command.Group
            heading={t("plants")}
            className="mt-2 px-2 text-xs text-black/50"
          >
            {plants.map((plant) => (
              <Command.Item
                key={plant.id}
                className="cursor-pointer border-2 border-transparent px-3 py-2 text-sm data-[selected=true]:border-black data-[selected=true]:bg-[var(--color-accent)]"
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
