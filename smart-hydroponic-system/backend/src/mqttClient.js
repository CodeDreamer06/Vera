import mqtt from "mqtt";
import { config } from "./config.js";

let mqttClient;

export function connectMqtt({ onTelemetry }) {
  mqttClient = mqtt.connect(config.mqttUrl, {
    clientId: config.mqttClientId,
    username: config.mqttUsername || undefined,
    password: config.mqttPassword || undefined
  });

  mqttClient.on("connect", () => {
    console.log("MQTT connected");
    mqttClient.subscribe("hydroponics/+/telemetry", (err) => {
      if (err) {
        console.error("MQTT subscribe error:", err.message);
      }
    });
  });

  mqttClient.on("message", (topic, payloadBuffer) => {
    try {
      const payload = JSON.parse(payloadBuffer.toString());
      onTelemetry(topic, payload);
    } catch (error) {
      console.error("Invalid MQTT message:", error.message);
    }
  });

  mqttClient.on("error", (error) => {
    console.error("MQTT error:", error.message);
  });
}

export function publishControl(deviceId, controlPayload) {
  if (!mqttClient || !mqttClient.connected) return;
  const controlTopic = `hydroponics/${deviceId}/control`;
  mqttClient.publish(controlTopic, JSON.stringify(controlPayload), { qos: 1 });
}
