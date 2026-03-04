# Smart Hydroponic System (ESP32 + Node.js + MongoDB + React)

Complete starter project for a smart hydroponic setup with:
- ESP32 firmware for pH, temperature, humidity, water level
- Node.js + Express backend
- MongoDB data storage
- MQTT real-time telemetry + control
- React dashboard for live monitoring
- Automation for pump/lights
- Simple ML model for nutrient deficiency prediction

## Folder Structure

```text
smart-hydroponic-system/
  firmware/
    esp32_hydroponics.ino
  backend/
    src/
      app.js
      config.js
      mqttClient.js
      automation.js
      ml/
        model.js
        train.js
      models/
        SensorReading.js
      routes/
        readings.js
    package.json
    .env.example
  frontend/
    src/
      App.jsx
      main.jsx
      api.js
      styles.css
      components/
        MetricCard.jsx
        AlertList.jsx
    index.html
    package.json
    vite.config.js
  infra/
    docker-compose.yml
    mosquitto/
      mosquitto.conf
```

## Architecture

1. ESP32 reads sensors every 5-10s and publishes telemetry to MQTT topic:
   - `hydroponics/<deviceId>/telemetry`
2. Backend MQTT consumer:
   - Validates payload
   - Stores readings in MongoDB
   - Runs ML prediction (nutrient deficiency risk)
   - Applies automation rules for water pump and grow lights
   - Publishes control command:
     - `hydroponics/<deviceId>/control`
   - Emits live update to dashboard using Socket.IO
3. React dashboard:
   - Shows live sensor data and control states
   - Shows alerts and predicted risk
   - Supports manual control override

## Sensor Wiring (Example ESP32 Pins)

- `DHT22` data -> `GPIO 4`
- `pH` analog output -> `GPIO 34` (ADC)
- `Water level` analog output -> `GPIO 35` (ADC)
- `Pump relay` -> `GPIO 26`
- `Light relay` -> `GPIO 27`
- Relays are configured as active-low in code.

Adjust pins in firmware to match your board.

## Setup Instructions

## 1) Start Infrastructure (MongoDB + Mosquitto)

```bash
cd smart-hydroponic-system/infra
docker compose up -d
```

Services:
- MongoDB: `mongodb://localhost:27017`
- MQTT broker: `mqtt://localhost:1883`

## 2) Backend

```bash
cd ../backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

Optional: train/update the ML model

```bash
npm run train
```

## 3) Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Dashboard runs on `http://localhost:5173`.

## 4) ESP32 Firmware

1. Open `firmware/esp32_hydroponics.ino` in Arduino IDE.
2. Install libraries:
   - `PubSubClient`
   - `ArduinoJson`
   - `DHT sensor library`
3. Update:
   - Wi-Fi SSID/password
   - `MQTT_HOST` to your backend/broker machine IP
4. Select ESP32 board + port and upload.

## API Endpoints

- `GET /api/readings/latest` - latest reading per device
- `GET /api/readings/history?deviceId=hydro-esp32-01&limit=100` - recent history
- `POST /api/control/manual` - manual control override

Example manual control payload:

```json
{
  "deviceId": "hydro-esp32-01",
  "pumpOn": true,
  "lightOn": false
}
```

## Automation Rules

Current default rules:
- Pump ON when water level `< 25%`
- Lights ON from `06:00` to `22:00` local server time
- If temperature `> 30 C`, lights OFF (heat safety)

## ML Prediction

Simple model predicts nutrient deficiency risk (`0.0 - 1.0`) from:
- pH
- air temperature
- humidity
- water level

If risk is high (`>= 0.65`), backend creates an alert in the live stream.

Additional demo prediction:
- `growthHealthScore` (`0 - 100`) estimates plant growth health from sensor quality + nutrient risk.
- `80-100`: Excellent
- `60-79`: Good
- `40-59`: Fair
- `<40`: Critical

## Notes

- pH probes need calibration; sample equation is approximate.
- For production: enable MQTT auth/TLS, add user auth on dashboard, and implement alert channels (email/SMS/Telegram).
