// ---------------------------------------------------------------------------
// Bitter Rot Disease Model — Colletotrichum spp.
//
// Evaluates bitter rot risk by tracking degree-days (base 15°C) from petal
// fall and counting warm wet events (>5h wetness at >21°C).  Latent
// infections are estimated from warm wet events since June.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BitterRotResult {
  riskLevel: "low" | "moderate" | "high" | "extreme";
  riskScore: number;
  /** Cumulative degree-days base 15°C from petal fall. */
  cumulativeDD15: number;
  /** Wet periods >5h at >21°C. */
  warmWetEvents: number;
  /** Estimated latent infections from warm wet events since June. */
  latentInfections: number;
  details: string;
  recommendation: string;
  productSuggestions: string[];
  scoutingProtocol: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DD_BASE = 15;
const DD_THRESHOLD = 200;
const WET_HOUR_TEMP_MIN = 21;
const WET_DURATION_MIN = 5;
const SCOUTING =
  "Inspect fruit for small tan circular lesions with pink spore masses, especially July-September.";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isWetHour(r: { humidity_pct: number; precip_mm: number }): boolean {
  return r.precip_mm > 0.1 || r.humidity_pct >= 90;
}

function countWarmWetEvents(
  hourlyData: Array<{ timestamp: string; temp_c: number; humidity_pct: number; precip_mm: number }>,
  afterDate?: Date,
): number {
  let events = 0;
  let consecutiveWetHot = 0;

  for (const r of hourlyData) {
    const ts = new Date(r.timestamp);
    if (afterDate && ts < afterDate) continue;

    if (isWetHour(r) && r.temp_c > WET_HOUR_TEMP_MIN) {
      consecutiveWetHot++;
    } else {
      if (consecutiveWetHot >= WET_DURATION_MIN) events++;
      consecutiveWetHot = 0;
    }
  }
  if (consecutiveWetHot >= WET_DURATION_MIN) events++;
  return events;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateBitterRot(
  hourlyData: Array<{ timestamp: string; temp_c: number; humidity_pct: number; precip_mm: number }>,
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  petalFallDate: string | null,
): BitterRotResult {
  // Degree-days from petal fall
  let cumulativeDD15 = 0;
  if (petalFallDate) {
    const pfDate = new Date(petalFallDate);
    const relevantDays = dailyData.filter((d) => new Date(d.date) >= pfDate);
    cumulativeDD15 = Math.round(calcCumulativeDegreeDays(relevantDays, DD_BASE));
  }

  // Warm wet events across full hourly record
  const warmWetEvents = countWarmWetEvents(hourlyData);

  // Latent infections — warm wet events since June 1
  const year = hourlyData.length > 0
    ? new Date(hourlyData[0].timestamp).getFullYear()
    : new Date().getFullYear();
  const juneFirst = new Date(year, 5, 1);
  const latentInfections = countWarmWetEvents(hourlyData, juneFirst);

  // Risk classification
  const ddActive = cumulativeDD15 >= DD_THRESHOLD;
  let riskLevel: BitterRotResult["riskLevel"];
  let riskScore: number;

  if (ddActive && latentInfections > 5) {
    riskLevel = "extreme";
    riskScore = 95;
  } else if (ddActive && latentInfections >= 3) {
    riskLevel = "high";
    riskScore = 75;
  } else if (latentInfections >= 1) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const products =
    riskLevel === "low"
      ? []
      : ["Captan", "Pristine (pyraclostrobin+boscalid)", "Merivon"];

  let details: string;
  if (riskLevel === "extreme" || riskLevel === "high") {
    details = `Hot, wet weather is driving bitter rot risk. ${latentInfections} warm wet events since June could harbor latent fruit infections. Degree days from petal fall: ${cumulativeDD15} (past the ${DD_THRESHOLD} DD activation threshold).`;
  } else if (riskLevel === "moderate") {
    details = `Some warm wet conditions have occurred that could lead to bitter rot infections. ${latentInfections} potential latent infection event(s) since June. Keep protectant sprays current.`;
  } else if (!petalFallDate) {
    details = "Too early to assess — bitter rot risk is tracked from petal fall onward. Set your petal fall date when it occurs.";
  } else {
    details = `Low risk so far. Bitter rot needs sustained hot wet weather (>21°C with prolonged wetness). Degree days from petal fall: ${cumulativeDD15} of ${DD_THRESHOLD} needed to activate risk.`;
  }

  let recommendation: string;
  if (riskLevel === "extreme") {
    recommendation =
      "Sustained hot wet conditions with many latent infections. Apply protectant fungicide immediately and shorten spray interval to 7-10 days.";
  } else if (riskLevel === "high") {
    recommendation =
      "Multiple warm wet events detected. Apply fungicide cover spray and scout fruit closely for early lesions.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Some warm wet conditions observed. Maintain protectant cover spray program and monitor fruit.";
  } else {
    recommendation =
      "Low risk. Continue regular scouting and standard cover spray schedule.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD15,
    warmWetEvents,
    latentInfections,
    details,
    recommendation,
    productSuggestions: products,
    scoutingProtocol: SCOUTING,
  };
}
