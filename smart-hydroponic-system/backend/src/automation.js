export function evaluateAlerts(reading, nutrientRisk) {
  const alerts = [];

  if (reading.ph < 5.5 || reading.ph > 6.5) {
    alerts.push("pH out of optimal range (5.5 - 6.5)");
  }
  if (reading.airTempC < 18 || reading.airTempC > 30) {
    alerts.push("Air temperature out of range (18C - 30C)");
  }
  if (reading.humidity < 45 || reading.humidity > 80) {
    alerts.push("Humidity out of range (45% - 80%)");
  }
  if (reading.waterLevelPct < 25) {
    alerts.push("Water level critically low");
  }
  if (nutrientRisk >= 0.65) {
    alerts.push(`High nutrient deficiency risk (${nutrientRisk.toFixed(2)})`);
  }

  return alerts;
}

export function getAutomaticControl(reading, now = new Date()) {
  const hour = now.getHours();
  const withinLightSchedule = hour >= 6 && hour < 22;

  let pumpOn = reading.waterLevelPct < 25;
  let lightOn = withinLightSchedule;

  if (reading.airTempC > 30) {
    lightOn = false;
  }

  return { pumpOn, lightOn, mode: "auto" };
}
