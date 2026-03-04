import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import MetricCard from "./components/MetricCard";
import AlertList from "./components/AlertList";
import { fetchHistory, fetchLatestReadings, postManualControl } from "./api";

const socket = io("http://localhost:4000", { transports: ["websocket"] });

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString();
}

function getHealthLabel(score) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Critical";
}

export default function App() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const deviceId = current?.deviceId || "hydro-esp32-01";
  const healthScore = Number(current?.growthHealthScore ?? 0);
  const healthLabel = getHealthLabel(healthScore);

  useEffect(() => {
    async function init() {
      const latest = await fetchLatestReadings();
      if (latest?.length) {
        setCurrent(latest[0]);
        const hist = await fetchHistory(latest[0].deviceId, 60);
        setHistory(hist);
      }
      setLoading(false);
    }

    init().catch(() => setLoading(false));

    socket.on("reading:update", (reading) => {
      setCurrent(reading);
      setHistory((prev) => [...prev.slice(-59), reading]);
    });

    return () => {
      socket.off("reading:update");
    };
  }, []);

  const chartData = useMemo(
    () =>
      history.map((item) => ({
        time: formatTime(item.ts),
        ph: Number(item.ph.toFixed(2)),
        temp: Number(item.airTempC.toFixed(1)),
        humidity: Number(item.humidity.toFixed(1)),
        water: Number(item.waterLevelPct.toFixed(1))
      })),
    [history]
  );

  async function setManualControl(pumpOn, lightOn) {
    await postManualControl({ deviceId, pumpOn, lightOn });
  }

  if (loading) {
    return <main className="app"><p>Loading dashboard...</p></main>;
  }

  if (!current) {
    return <main className="app"><p>No telemetry yet. Start ESP32 to stream data.</p></main>;
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Smart Hydroponic Dashboard</h1>
        <p className="muted">Device: {current.deviceId}</p>
      </header>

      <section className="grid metrics">
        <MetricCard label="pH" value={current.ph.toFixed(2)} warning={current.ph < 5.5 || current.ph > 6.5} />
        <MetricCard label="Air Temp" value={current.airTempC.toFixed(1)} unit="C" warning={current.airTempC > 30} />
        <MetricCard label="Humidity" value={current.humidity.toFixed(1)} unit="%" warning={current.humidity < 45} />
        <MetricCard
          label="Water Level"
          value={current.waterLevelPct.toFixed(1)}
          unit="%"
          warning={current.waterLevelPct < 25}
        />
        <MetricCard
          label="Nutrient Risk"
          value={(current.nutrientRisk * 100).toFixed(0)}
          unit="%"
          warning={current.nutrientRisk >= 0.65}
        />
        <MetricCard
          label="Growth Health"
          value={healthScore.toFixed(0)}
          unit="/100"
          warning={healthScore < 45}
        />
      </section>

      <section className="panel">
        <h3>Live Trends</h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" minTickGap={24} />
              <YAxis />
              <Tooltip />
              <Line dataKey="ph" stroke="#3b82f6" dot={false} />
              <Line dataKey="temp" stroke="#ef4444" dot={false} />
              <Line dataKey="humidity" stroke="#16a34a" dot={false} />
              <Line dataKey="water" stroke="#f59e0b" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid controls">
        <div className="panel">
          <h3>Automation Status</h3>
          <p>Pump: {current.control?.pumpOn ? "ON" : "OFF"}</p>
          <p>Lights: {current.control?.lightOn ? "ON" : "OFF"}</p>
          <p>Mode: {current.control?.mode || "auto"}</p>
          <p>
            Growth Health: <strong>{healthLabel}</strong>
          </p>
          <div className="health-bar">
            <div
              className={`health-fill ${
                healthScore >= 80 ? "excellent" : healthScore >= 60 ? "good" : healthScore >= 40 ? "fair" : "critical"
              }`}
              style={{ width: `${Math.max(4, Math.min(100, healthScore))}%` }}
            />
          </div>
        </div>
        <div className="panel">
          <h3>Manual Control</h3>
          <div className="control-buttons">
            <button type="button" onClick={() => setManualControl(true, true)}>
              Pump ON / Light ON
            </button>
            <button type="button" onClick={() => setManualControl(true, false)}>
              Pump ON / Light OFF
            </button>
            <button type="button" onClick={() => setManualControl(false, true)}>
              Pump OFF / Light ON
            </button>
            <button type="button" onClick={() => setManualControl(false, false)}>
              Pump OFF / Light OFF
            </button>
          </div>
        </div>
      </section>

      <AlertList alerts={current.alerts || []} />
    </main>
  );
}
