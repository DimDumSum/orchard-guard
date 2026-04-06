// ---------------------------------------------------------------------------
// Plum Curculio Pest Model — Degree-day emergence + night temperature
//
// Tracks plum curculio emergence using cumulative degree-days (base 5°C)
// from petal fall.  Activity is strongly influenced by warm nighttime
// temperatures (min temps consistently >16°C).
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlumCurculioResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Cumulative degree-days base 5°C from petal fall. */
  cumulativeDD: number;
  /** True when DD >= emergence threshold. */
  emerged: boolean;
  /** True when recent night temps (min) are consistently >16°C. */
  nightTempsWarm: boolean;
  details: string;
  recommendation: string;
  /** OMAFRA IPM guideline economic threshold. */
  economicThreshold: string | null;
  /** What to look for, how many trees. */
  scoutingProtocol: string;
  /** Specific product name suggestions. */
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_TEMP = 5;
const EMERGENCE_DD = 120;
const APPROACHING_DD = 80;
const WARM_NIGHT_TEMP = 16;

const ECONOMIC_THRESHOLD =
  "Treat if any PC damage found on developing fruit within 2-4 weeks of petal fall";

const SCOUTING_PROTOCOL =
  "Inspect 100 fruit on 10 perimeter trees weekly. Look for crescent-shaped oviposition scars.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Imidan (phosmet)",
  "Assail (acetamiprid)",
  "Surround (kaolin clay, organic)",
];

/**
 * Number of recent nights to consider when evaluating whether nighttime
 * temperatures are "consistently warm".  At least half must be above the
 * warm-night threshold.
 */
const WARM_NIGHT_WINDOW = 5;
const WARM_NIGHT_FRACTION = 0.5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Filter daily data to only include records on or after the petal fall date.
 */
function filterFromPetalFall(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  petalFallDate: string,
): Array<{ date: string; max_temp: number; min_temp: number }> {
  return dailyData.filter((d) => d.date >= petalFallDate);
}

/**
 * Evaluate whether recent nighttime (min) temperatures are consistently
 * above the warm-night threshold.
 */
function areNightsWarm(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): boolean {
  const recent = dailyData.slice(-WARM_NIGHT_WINDOW);
  if (recent.length === 0) return false;

  const warmCount = recent.filter((d) => d.min_temp > WARM_NIGHT_TEMP).length;
  return warmCount / recent.length >= WARM_NIGHT_FRACTION;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate plum curculio risk based on degree-day emergence and night
 * temperatures.
 *
 * @param dailyData      Daily max/min temperature records covering the season.
 * @param petalFallDate  ISO date string for petal fall, or `null` if petal
 *                       fall has not yet occurred.
 * @returns              Complete plum curculio risk assessment.
 */
export function evaluatePlumCurculio(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  petalFallDate: string | null,
): PlumCurculioResult {
  // No petal fall date → return low-risk default
  if (!petalFallDate) {
    return {
      riskLevel: "low",
      riskScore: 5,
      cumulativeDD: 0,
      emerged: false,
      nightTempsWarm: false,
      details: "Petal fall date has not been set.",
      recommendation:
        "Set petal fall date to enable plum curculio tracking.",
      economicThreshold: ECONOMIC_THRESHOLD,
      scoutingProtocol: SCOUTING_PROTOCOL,
      productSuggestions: PRODUCT_SUGGESTIONS,
    };
  }

  // Filter data from petal fall onward and accumulate degree-days
  const pfData = filterFromPetalFall(dailyData, petalFallDate);
  const cumulativeDD = calcCumulativeDegreeDays(pfData, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const emerged = cumulativeDD >= EMERGENCE_DD;
  const nightTempsWarm = areNightsWarm(pfData);

  // Classify risk
  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (emerged && nightTempsWarm) {
    riskLevel = "high";
    riskScore = 85;
  } else if (emerged && !nightTempsWarm) {
    riskLevel = "moderate";
    riskScore = 50;
  } else if (cumulativeDD >= APPROACHING_DD) {
    riskLevel = "moderate";
    riskScore = 40;
  } else {
    riskLevel = "low";
    riskScore = 15;
  }

  // Build conversational details
  let details: string;
  if (riskLevel === "high") {
    details = `Plum curculio has emerged and warm nights (>16°C) mean peak activity — adults are laying eggs in developing fruit. Scout perimeter trees for crescent-shaped scars on fruitlets.`;
  } else if (emerged && !nightTempsWarm) {
    details = `Plum curculio has emerged (${roundedDD} degree days from petal fall) but cool nights are limiting activity. Adults are present but less active — they fly and feed on warm, calm nights above 16°C.`;
  } else if (riskLevel === "moderate") {
    details = `Approaching plum curculio emergence — ${roundedDD} of ${EMERGENCE_DD} degree days accumulated from petal fall. Have spray materials ready for when adults emerge.`;
  } else {
    details = `Too early for plum curculio. Adults emerge around ${EMERGENCE_DD} degree days (base 5°C) after petal fall — you're at ${roundedDD} DD. They damage fruit by cutting crescent-shaped egg-laying scars.`;
  }

  // Build recommendation
  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Plum curculio has emerged and night temperatures are warm — peak activity expected. " +
      "Apply protective spray (e.g., phosmet or carbaryl) immediately after petal fall.";
  } else if (riskLevel === "moderate" && emerged) {
    recommendation =
      "Plum curculio has emerged but cool nights are limiting activity. " +
      "Monitor closely; spray when nighttime lows exceed 16°C.";
  } else if (riskLevel === "moderate") {
    recommendation =
      `Approaching emergence (${roundedDD} of ${EMERGENCE_DD} DD). ` +
      "Prepare materials for protective spray at petal fall.";
  } else {
    recommendation =
      "Low risk. Continue monitoring degree-day accumulation from petal fall.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    emerged,
    nightTempsWarm,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
