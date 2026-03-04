#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHT_PIN 4
#define DHT_TYPE DHT22
#define PH_PIN 34
#define WATER_LEVEL_PIN 35
#define PUMP_RELAY_PIN 26
#define LIGHT_RELAY_PIN 27

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_HOST = "192.168.1.100";
const int MQTT_PORT = 1883;

String deviceId = "hydro-esp32-01";

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastTelemetryMs = 0;
const unsigned long telemetryIntervalMs = 5000;

float readPh() {
  int raw = analogRead(PH_PIN);
  float voltage = raw * (3.3 / 4095.0);
  // Example pH conversion. Calibrate with standard pH buffer solutions.
  float ph = 7.0 + ((2.5 - voltage) / 0.18);
  return ph;
}

float readWaterLevelPct() {
  int raw = analogRead(WATER_LEVEL_PIN);
  float pct = (raw / 4095.0) * 100.0;
  return pct;
}

void applyControl(bool pumpOn, bool lightOn) {
  // Active-low relay
  digitalWrite(PUMP_RELAY_PIN, pumpOn ? LOW : HIGH);
  digitalWrite(LIGHT_RELAY_PIN, lightOn ? LOW : HIGH);
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) return;

  bool pumpOn = doc["pumpOn"] | false;
  bool lightOn = doc["lightOn"] | true;
  applyControl(pumpOn, lightOn);
}

void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void ensureMqtt() {
  if (mqttClient.connected()) return;
  String clientId = "esp32-client-" + deviceId;
  while (!mqttClient.connected()) {
    if (mqttClient.connect(clientId.c_str())) {
      String controlTopic = "hydroponics/" + deviceId + "/control";
      mqttClient.subscribe(controlTopic.c_str());
    } else {
      delay(1500);
    }
  }
}

void publishTelemetry() {
  float humidity = dht.readHumidity();
  float airTempC = dht.readTemperature();
  float ph = readPh();
  float waterLevelPct = readWaterLevelPct();

  if (isnan(humidity) || isnan(airTempC)) {
    return;
  }

  StaticJsonDocument<256> payload;
  payload["deviceId"] = deviceId;
  payload["ph"] = ph;
  payload["airTempC"] = airTempC;
  payload["humidity"] = humidity;
  payload["waterLevelPct"] = waterLevelPct;
  payload["ts"] = millis();

  char buffer[256];
  size_t len = serializeJson(payload, buffer);

  String telemetryTopic = "hydroponics/" + deviceId + "/telemetry";
  mqttClient.publish(telemetryTopic.c_str(), buffer, len);
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(PUMP_RELAY_PIN, OUTPUT);
  pinMode(LIGHT_RELAY_PIN, OUTPUT);
  applyControl(false, true);

  ensureWiFi();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(onMqttMessage);
}

void loop() {
  ensureWiFi();
  ensureMqtt();
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastTelemetryMs >= telemetryIntervalMs) {
    lastTelemetryMs = now;
    publishTelemetry();
  }
}
