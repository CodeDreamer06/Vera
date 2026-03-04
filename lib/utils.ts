export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

export const randomId = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const jitter = (value: number, amount: number) =>
  value + randomBetween(-amount, amount);

export const formatPercent = (v: number) => `${Math.round(v * 100)}%`;

export const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatRelativeHours = (hours: number) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }

  return `${hours.toFixed(hours < 10 ? 1 : 0)} hr`;
};

export const isBrowser = typeof window !== "undefined";
