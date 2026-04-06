// ---------------------------------------------------------------------------
// Phytophthora Disease Model — Phytophthora spp.
//
// Evaluates crown and root rot risk by tracking consecutive wet days
// (>10mm precip) combined with estimated soil temperature.  Susceptible
// rootstocks (M.9, M.26) receive elevated risk ratings.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PhytophthoraResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Maximum run of consecutive days with >10mm precipitation. */
  consecutiveWetDays: number;
  /** Estimated soil temperature (avg air temp - 2°C). */
  estimatedSoilTemp: number;
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAILY_PRECIP_THRESHOLD = 10; // mm
const SOIL_TEMP_OFFSET = 2;        // °C below mean air temp
const SOIL_TEMP_MIN = 10;          // °C required for active Phytophthora
const SUSCEPTIBLE_ROOTSTOCKS = ["M.9", "M.26", "m.9", "m.26", "M9", "M26"];

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluatePhytophthora(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number; total_precip?: number }>,
  rootstock?: string,
): PhytophthoraResult {
  const isSusceptible = rootstock
    ? SUSCEPTIBLE_ROOTSTOCKS.includes(rootstock)
    : false;

  // Compute average air temperature across all records for soil temp estimate
  let totalMeanTemp = 0;
  let tempCount = 0;
  for (const d of dailyData) {
    totalMeanTemp += (d.max_temp + d.min_temp) / 2;
    tempCount++;
  }
  const avgAirTemp = tempCount > 0 ? totalMeanTemp / tempCount : 15;
  const estimatedSoilTemp = Math.round((avgAirTemp - SOIL_TEMP_OFFSET) * 10) / 10;

  // Track maximum consecutive wet days
  let maxConsecutive = 0;
  let currentRun = 0;

  for (const d of dailyData) {
    const precip = d.total_precip ?? 0;
    if (precip > DAILY_PRECIP_THRESHOLD) {
      currentRun++;
      if (currentRun > maxConsecutive) maxConsecutive = currentRun;
    } else {
      currentRun = 0;
    }
  }

  const soilActive = estimatedSoilTemp >= SOIL_TEMP_MIN;

  // Risk classification
  let riskLevel: PhytophthoraResult["riskLevel"];
  let riskScore: number;

  if (soilActive && maxConsecutive > 3 && isSusceptible) {
    riskLevel = "high";
    riskScore = 90;
  } else if (soilActive && maxConsecutive > 3) {
    riskLevel = "high";
    riskScore = 78;
  } else if (soilActive && maxConsecutive >= 2) {
    riskLevel = "moderate";
    riskScore = isSusceptible ? 55 : 42;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (riskLevel === "high") {
    details = `Prolonged wet soil with warm temperatures (est. ${estimatedSoilTemp}°C) is creating conditions for Phytophthora root and crown rot. ${maxConsecutive} consecutive days with heavy rain.${isSusceptible ? ` Your rootstock (${rootstock}) is especially susceptible — act quickly.` : ""}`;
  } else if (riskLevel === "moderate") {
    details = `Wet soil conditions are building — ${maxConsecutive} days of heavy rain with soil warm enough (est. ${estimatedSoilTemp}°C) for Phytophthora activity.${isSusceptible ? ` Your rootstock (${rootstock}) is susceptible — monitor drainage closely.` : ""}`;
  } else if (!soilActive) {
    details = `Soil temperatures are still too cool (est. ${estimatedSoilTemp}°C) for active Phytophthora. The pathogen needs soil above 10°C to cause root and crown rot.`;
  } else {
    details = `Low risk. Soil is warm enough (est. ${estimatedSoilTemp}°C) but no prolonged wet periods detected. Phytophthora needs multiple consecutive days of saturated soil to infect roots.`;
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Prolonged saturated soil conditions favor Phytophthora. Improve drainage immediately. " +
      "Apply mefenoxam or phosphonate trunk treatment. Avoid irrigation during wet periods.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Wet soil conditions building. Monitor root zone drainage and reduce irrigation. " +
      "Consider preventive phosphonate application on susceptible rootstocks.";
  } else {
    recommendation =
      "Low risk. Maintain proper drainage and avoid over-irrigation in low-lying areas.";
  }

  return {
    riskLevel,
    riskScore,
    consecutiveWetDays: maxConsecutive,
    estimatedSoilTemp,
    details,
    recommendation,
  };
}
