import { Router } from "express";
import { SensorReading } from "../models/SensorReading.js";

export function createReadingsRouter({ onManualControl }) {
  const router = Router();

  router.get("/latest", async (_req, res) => {
    try {
      const latest = await SensorReading.aggregate([
        { $sort: { ts: -1 } },
        {
          $group: {
            _id: "$deviceId",
            reading: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$reading" }
        },
        { $sort: { ts: -1 } }
      ]);
      res.json(latest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/history", async (req, res) => {
    try {
      const deviceId = String(req.query.deviceId || "");
      const limit = Math.min(Number(req.query.limit || 100), 500);
      const query = deviceId ? { deviceId } : {};
      const history = await SensorReading.find(query).sort({ ts: -1 }).limit(limit);
      res.json(history.reverse());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/control/manual", async (req, res) => {
    try {
      const { deviceId, pumpOn, lightOn } = req.body;
      if (!deviceId || typeof pumpOn !== "boolean" || typeof lightOn !== "boolean") {
        return res.status(400).json({ error: "deviceId, pumpOn and lightOn are required." });
      }

      onManualControl({
        deviceId,
        control: { pumpOn, lightOn, mode: "manual" }
      });

      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
