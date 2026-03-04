import http from "node:http";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { config } from "./config.js";
import { connectMqtt, publishControl } from "./mqttClient.js";
import { SensorReading } from "./models/SensorReading.js";
import { evaluateAlerts, getAutomaticControl } from "./automation.js";
import { createReadingsRouter } from "./routes/readings.js";
import { loadModel, predictGrowthHealthScore, predictNutrientRisk } from "./ml/model.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const model = loadModel();
const manualControlByDevice = new Map();

function sanitizeReading(payload) {
  const reading = {
    deviceId: String(payload.deviceId || config.defaultDeviceId),
    ph: Number(payload.ph),
    airTempC: Number(payload.airTempC),
    humidity: Number(payload.humidity),
    waterLevelPct: Number(payload.waterLevelPct),
    ts: payload.ts ? new Date(payload.ts) : new Date()
  };

  const values = [reading.ph, reading.airTempC, reading.humidity, reading.waterLevelPct];
  if (values.some((v) => Number.isNaN(v))) {
    throw new Error("Sensor payload contains invalid numeric values.");
  }
  return reading;
}

async function processTelemetry(payload) {
  const reading = sanitizeReading(payload);
  const nutrientRisk = predictNutrientRisk(reading, model);
  const growthHealthScore = predictGrowthHealthScore(reading, nutrientRisk);
  const autoControl = getAutomaticControl(reading);
  const manualControl = manualControlByDevice.get(reading.deviceId);
  const control = manualControl || autoControl;
  const alerts = evaluateAlerts(reading, nutrientRisk);
  if (growthHealthScore < 45) {
    alerts.push(`Plant growth health is low (${growthHealthScore}/100)`);
  }

  const saved = await SensorReading.create({
    ...reading,
    nutrientRisk,
    growthHealthScore,
    alerts,
    control
  });

  publishControl(reading.deviceId, control);

  io.emit("reading:update", {
    _id: saved._id,
    ...reading,
    nutrientRisk,
    growthHealthScore,
    alerts,
    control
  });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(
  "/api/readings",
  createReadingsRouter({
    onManualControl({ deviceId, control }) {
      manualControlByDevice.set(deviceId, control);
      publishControl(deviceId, control);
      io.emit("control:update", { deviceId, control });
    }
  })
);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

async function bootstrap() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");

    connectMqtt({
      onTelemetry: async (_topic, payload) => {
        try {
          await processTelemetry(payload);
        } catch (error) {
          console.error("Telemetry processing failed:", error.message);
        }
      }
    });

    server.listen(config.port, () => {
      console.log(`Backend running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

bootstrap();
