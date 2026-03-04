import fs from "node:fs";
import path from "node:path";
import MLR from "ml-regression-multivariate-linear";

const dataPath = path.resolve("src/ml/trainingData.json");
const modelPath = path.resolve("src/ml/model.json");

const samples = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const x = samples.map((s) => {
  const phDeviation = Math.abs(s.ph - 6.0);
  const highTemp = Math.max(0, s.airTempC - 26) / 10;
  const lowHumidity = Math.max(0, 60 - s.humidity) / 60;
  const lowWater = Math.max(0, 35 - s.waterLevelPct) / 35;
  return [phDeviation, highTemp, lowHumidity, lowWater];
});

const y = samples.map((s) => [s.nutrientRiskLabel]);

const regression = new MLR(x, y);
const [wPh, wTemp, wHumidity, wWater] = regression.weights.map((arr) => arr[0]);
const bias = regression.intercept[0];

const output = {
  bias,
  weights: {
    phDeviation: wPh,
    highTemp: wTemp,
    lowHumidity: wHumidity,
    lowWater: wWater
  }
};

fs.writeFileSync(modelPath, JSON.stringify(output, null, 2));
console.log("Model saved to", modelPath);
