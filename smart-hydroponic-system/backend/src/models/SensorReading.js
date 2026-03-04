import mongoose from "mongoose";

const SensorReadingSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    ph: { type: Number, required: true },
    airTempC: { type: Number, required: true },
    humidity: { type: Number, required: true },
    waterLevelPct: { type: Number, required: true },
    nutrientRisk: { type: Number, required: true, min: 0, max: 1 },
    growthHealthScore: { type: Number, required: true, min: 0, max: 100 },
    alerts: { type: [String], default: [] },
    control: {
      pumpOn: { type: Boolean, default: false },
      lightOn: { type: Boolean, default: true },
      mode: { type: String, enum: ["auto", "manual"], default: "auto" }
    },
    ts: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const SensorReading = mongoose.model("SensorReading", SensorReadingSchema);
