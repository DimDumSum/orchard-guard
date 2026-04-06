// ---------------------------------------------------------------------------
// Apple Maggot Pest Model — Degree-day phenology from January 1
//
// Tracks apple maggot fly emergence and peak activity using cumulative
// degree-days (base 5°C) from January 1.  Emergence begins around 900 DD
// with peak activity between 1200 and 1700 DD.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppleMaggotResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Cumulative degree-days base 5°C from January 1. */
  cumulativeDD: number;
  /** True when DD >= emergence threshold (900 DD). */
  emerged: boolean;
  /** True when DD is within peak activity range (1200–1700 DD). */
  peakActivity: boolean;
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
const EMERGENCE_DD = 900;
const PRE_EMERGENCE_DD = 800;
const PEAK_START_DD = 1200;
const PEAK_END_DD = 1700;

// ---------------------------------------------------------------------------
// IPM constants
// ---------------------------------------------------------------------------

const ECONOMIC_THRESHOLD =
  "Action threshold: 1 fly per trap (red sticky sphere)";

const SCOUTING_PROTOCOL =
  "Hang red sticky sphere traps at eye level in perimeter trees by late June. Check traps weekly.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Imidan (phosmet)",
  "Sevin (carbaryl)",
  "Surround (kaolin clay, organic)",
];

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate apple maggot risk based on degree-day accumulation from Jan 1.
 *
 * @param dailyData  Daily max/min temperature records from January 1 of the
 *                   current year.
 * @returns          Complete apple maggot risk assessment.
 */
export function evaluateAppleMaggot(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): AppleMaggotResult {
  const cumulativeDD = calcCumulativeDegreeDays(dailyData, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const emerged = cumulativeDD >= EMERGENCE_DD;
  const peakActivity =
    cumulativeDD >= PEAK_START_DD && cumulativeDD <= PEAK_END_DD;

  // Classify risk
  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (emerged) {
    if (peakActivity) {
      riskLevel = "high";
      riskScore = 90;
    } else if (cumulativeDD > PEAK_END_DD) {
      // Past peak — still emerged but declining activity
      riskLevel = "moderate";
      riskScore = 50;
    } else {
      // Emerged but not yet at peak (900–1200 DD)
      riskLevel = "high";
      riskScore = 75;
    }
  } else if (cumulativeDD >= PRE_EMERGENCE_DD) {
    riskLevel = "moderate";
    riskScore = 40;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  // Build conversational details
  let details: string;
  if (peakActivity) {
    details = `Peak apple maggot activity — flies are laying eggs in fruit. Check red sphere traps weekly and maintain protective sprays on susceptible varieties. At ${roundedDD} degree days, you're in the heart of the activity window.`;
  } else if (emerged && cumulativeDD > PEAK_END_DD) {
    details = `Past peak apple maggot activity (${roundedDD} DD). Pressure is declining but some flies may still be active. Continue monitoring traps and reduce spray frequency if catches drop off.`;
  } else if (emerged) {
    details = `Apple maggot flies have emerged (${roundedDD} DD). Peak activity begins around ${PEAK_START_DD} DD — about ${Math.round(PEAK_START_DD - cumulativeDD)} DD away. Deploy red sphere traps now if not already out.`;
  } else if (riskLevel === "moderate") {
    details = `Approaching apple maggot emergence — ${roundedDD} of ${EMERGENCE_DD} degree days. Set red sticky sphere traps at canopy edge in perimeter trees now to catch first flies.`;
  } else {
    details = `Too early for apple maggot. Flies emerge around ${EMERGENCE_DD} degree days (base 5°C from January 1) — you're at ${roundedDD} DD. They lay eggs directly in fruit, causing wormy apples.`;
  }

  // Build recommendation
  let recommendation: string;
  if (peakActivity) {
    recommendation =
      "Peak apple maggot activity. Maintain trap monitoring and protective sprays on susceptible varieties.";
  } else if (emerged) {
    if (cumulativeDD > PEAK_END_DD) {
      recommendation =
        "Past peak emergence. Continue monitoring traps; reduce spray frequency if catches decline.";
    } else {
      recommendation =
        "Apple maggot flies are emerging. Deploy red sphere traps and begin protective sprays on early-maturing varieties.";
    }
  } else if (riskLevel === "moderate") {
    recommendation =
      "Approaching emergence. Set traps now — red sticky spheres at canopy periphery, 1 per 100 trees minimum.";
  } else {
    recommendation =
      "Low risk. Monitor degree-day accumulation toward the 900 DD emergence threshold.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    emerged,
    peakActivity,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
