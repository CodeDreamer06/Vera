"use client";

import { memo, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SensorReading } from "@/types/domain";

const metricColor: Record<string, string> = {
  pH: "#3b82f6",
  tds: "#14b8a6",
  do: "#22c55e",
  tempC: "#fb923c",
  humidity: "#06b6d4",
  soilMoisture: "#a3e635",
};

interface SensorChartProps {
  readings: SensorReading[];
  metric: keyof Pick<
    SensorReading,
    "pH" | "tds" | "do" | "tempC" | "humidity" | "soilMoisture"
  >;
}

export const SensorChart = memo(function SensorChart({
  readings,
  metric,
}: SensorChartProps) {
  const data = useMemo(
    () =>
      readings.map((r) => ({
        t: new Date(r.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        [metric]: Number(r[metric].toFixed(2)),
      })),
    [readings, metric],
  );

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 4, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="t"
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(12,15,27,0.94)",
              color: "#fff",
            }}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={metricColor[metric]}
            dot={false}
            strokeWidth={2}
            isAnimationActive
            animationDuration={280}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
