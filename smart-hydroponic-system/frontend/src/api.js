import axios from "axios";

const API_BASE = "http://localhost:4000";

export async function fetchLatestReadings() {
  const { data } = await axios.get(`${API_BASE}/api/readings/latest`);
  return data;
}

export async function fetchHistory(deviceId, limit = 50) {
  const { data } = await axios.get(`${API_BASE}/api/readings/history`, {
    params: { deviceId, limit }
  });
  return data;
}

export async function postManualControl({ deviceId, pumpOn, lightOn }) {
  const { data } = await axios.post(`${API_BASE}/api/readings/control/manual`, {
    deviceId,
    pumpOn,
    lightOn
  });
  return data;
}
