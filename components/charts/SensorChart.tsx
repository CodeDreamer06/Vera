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
  pH: "#2a2aff",
  tds: "#000000",
  do: "#00a652",
  tempC: "#ff7a00",
  humidity: "#0b8cff",
  soilMoisture: "#6b8500",
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
            stroke="rgba(0,0,0,0.18)"
            strokeDasharray="2 2"
          />
          <XAxis
            dataKey="t"
            tick={{ fill: "rgba(0,0,0,0.8)", fontSize: 10 }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fill: "rgba(0,0,0,0.8)", fontSize: 10 }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0",
              border: "3px solid #000",
              boxShadow: "6px 6px 0 #000",
              background: "#fff",
              color: "#000",
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
