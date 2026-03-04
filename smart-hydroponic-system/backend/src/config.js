import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/hydroponics",
  mqttUrl: process.env.MQTT_URL || "mqtt://localhost:1883",
  mqttUsername: process.env.MQTT_USERNAME || "",
  mqttPassword: process.env.MQTT_PASSWORD || "",
  mqttClientId: process.env.MQTT_CLIENT_ID || "hydro-backend",
  defaultDeviceId: process.env.DEFAULT_DEVICE_ID || "hydro-esp32-01"
};
