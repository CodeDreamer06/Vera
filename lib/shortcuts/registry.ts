export interface ShortcutDef {
  id: string;
  keys: string;
  description: string;
}

export const shortcuts: ShortcutDef[] = [
  { id: "palette", keys: "Cmd/Ctrl+K", description: "Open command palette" },
  { id: "shortcuts", keys: "?", description: "Open keyboard shortcuts" },
  { id: "search", keys: "Shift+F", description: "Focus plant switcher" },
  { id: "prev", keys: "[", description: "Previous plant" },
  { id: "next", keys: "]", description: "Next plant" },
  { id: "alerts", keys: "A", description: "Open alerts center" },
  { id: "timetravel", keys: "T", description: "Toggle time travel panel" },
  { id: "range", keys: "R", description: "Focus chart range" },
  { id: "disease", keys: "D", description: "Open disease panel" },
  { id: "anomaly", keys: "Shift+X", description: "Inject demo anomaly" },
  { id: "recipe", keys: "M", description: "Toggle recipe mode" },
  { id: "settings", keys: ",", description: "Open settings" },
];
