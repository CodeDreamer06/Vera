import type { OnboardingStep } from "@/lib/onboarding/types";

export const STARTER_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "seed-demo",
    title: "Fill your field with demo plants",
    summary:
      "Think of this like sowing seeds in empty beds. Press one button and the app creates sample plants so you can practice safely.",
    actionLabel: "Start demo mode",
    doneLabel: "Field is ready",
  },
  {
    id: "choose-plant",
    title: "Pick one plant to watch",
    summary:
      "Like choosing one crop row for close check. Select a plant card so all charts and panels follow that plant.",
    actionLabel: "Focus first plant",
    doneLabel: "Plant selected",
  },
  {
    id: "check-alerts",
    title: "Open alerts and see risky signals",
    summary:
      "This is your early warning board. You can quickly catch problems before leaves droop or roots suffer.",
    actionLabel: "Open alerts center",
    doneLabel: "Alerts checked",
  },
  {
    id: "force-issue",
    title: "Practice with a fake problem",
    summary:
      "Like a fire drill on a farm. Inject one demo anomaly so you learn where warnings appear and how to respond.",
    actionLabel: "Inject anomaly",
    doneLabel: "Drill complete",
  },
  {
    id: "open-disease",
    title: "Try disease scan panel",
    summary:
      "Open the disease panel, just like taking a photo of a leaf spot and asking for quick treatment guidance.",
    actionLabel: "Open disease panel",
    doneLabel: "Panel opened",
  },
  {
    id: "run-brief",
    title: "Generate the morning task list",
    summary:
      "This gives you a simple daily work list, like deciding which beds need water, feed, or inspection first.",
    actionLabel: "Generate ops brief",
    doneLabel: "Brief generated",
  },
  {
    id: "open-palette",
    title: "Use quick command search",
    summary:
      "Press command palette to jump fast, like using a farm control room shortcut instead of walking to every board.",
    actionLabel: "Open command palette",
    doneLabel: "Shortcut learned",
  },
];
