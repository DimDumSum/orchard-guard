// ---------------------------------------------------------------------------
// Black Rot Disease Model — Wet-period infection criteria
//
// Evaluates black rot (Botryosphaeria obtusa) infection risk by counting
// qualifying wet periods in the last 7 days.  An infection period requires
// leaf wetness >= 9 hours at temperatures between 15°C and 30°C.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlackRotResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Count of qualifying wet periods in the last 7 days. */
  infectionPeriods: number;
  /** Specific product recommendations. */
  productSuggestions: string[];
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum consecutive wet hours required for an infection period. */
const MIN_WET_HOURS = 9;

/** Temperature range for infection (°C). */
const TEMP_MIN = 15;
const TEMP_MAX = 30;

/**
 * Number of hours to look back from the most recent data point (7 days).
 */
const LOOKBACK_HOURS = 7 * 24;

/**
 * Maximum gap (dry hours) allowed within a wet period before it is
 * considered broken.
 */
const MAX_DRY_GAP = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Determine whether a single hour counts as "wet" (leaf wetness proxy). */
function isWetHour(record: {
  temp_c: number;
  humidity_pct: number;
  precip_mm: number;
}): boolean {
  return record.precip_mm > 0.1 || record.humidity_pct >= 90;
}

/**
 * A detected wet period with its temperature context.
 */
interface WetSpan {
  durationHours: number;
  meanTemp: number;
}

/**
 * Identify continuous wet periods from hourly data.
 *
 * A wet period is a stretch of consecutive wet hours.  Gaps of up to
 * {@link MAX_DRY_GAP} dry hours within an otherwise wet sequence are
 * tolerated (the period is considered unbroken).
 */
function findWetSpans(
  hourlyData: Array<{
    timestamp: string;
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
  }>,
): WetSpan[] {
  if (hourlyData.length === 0) return [];

  const spans: WetSpan[] = [];

  let spanStart: number | null = null;
  let spanTemps: number[] = [];
  let consecutiveDry = 0;

  function finalizeSpan(endIndex: number): void {
    if (spanStart === null || spanTemps.length === 0) return;
    const durationHours = endIndex - spanStart + 1;
    const meanTemp =
      spanTemps.reduce((sum, t) => sum + t, 0) / spanTemps.length;
    spans.push({
      durationHours,
      meanTemp: Math.round(meanTemp * 10) / 10,
    });
  }

  for (let i = 0; i < hourlyData.length; i++) {
    if (isWetHour(hourlyData[i])) {
      if (spanStart === null) {
        spanStart = i;
        spanTemps = [];
      }
      // If bridging dry hours exist, include their temperatures too
      if (consecutiveDry > 0 && consecutiveDry <= MAX_DRY_GAP) {
        for (let j = i - consecutiveDry; j < i; j++) {
          spanTemps.push(hourlyData[j].temp_c);
        }
      }
      spanTemps.push(hourlyData[i].temp_c);
      consecutiveDry = 0;
    } else {
      consecutiveDry++;
      if (consecutiveDry > MAX_DRY_GAP && spanStart !== null) {
        // End of wet period — finalize at the last wet index
        const lastWetIndex = i - consecutiveDry;
        finalizeSpan(lastWetIndex);
        spanStart = null;
        spanTemps = [];
      }
    }
  }

  // Finalize any trailing wet period
  if (spanStart !== null) {
    finalizeSpan(hourlyData.length - 1 - consecutiveDry);
  }

  return spans;
}

/** Get product suggestions based on risk level. */
function getProductSuggestions(
  riskLevel: "low" | "moderate" | "high",
): string[] {
  if (riskLevel === "moderate" || riskLevel === "high") {
    return ["Captan", "Mancozeb"];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate black rot infection risk by counting qualifying wet periods in
 * the last 7 days.
 *
 * @param hourlyData  Hourly weather observations (ideally covering at least
 *                    the last 7 days).
 * @returns           Complete black rot risk assessment.
 */
export function evaluateBlackRot(
  hourlyData: Array<{
    timestamp: string;
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
  }>,
): BlackRotResult {
  // Limit analysis to the last 7 days
  const recentData = hourlyData.slice(-LOOKBACK_HOURS);

  // Find wet spans within recent data
  const wetSpans = findWetSpans(recentData);

  // Count qualifying infection periods: duration >= 9 h AND mean temp 15-30°C
  const qualifyingPeriods = wetSpans.filter(
    (s) =>
      s.durationHours >= MIN_WET_HOURS &&
      s.meanTemp >= TEMP_MIN &&
      s.meanTemp <= TEMP_MAX,
  );
  const infectionPeriods = qualifyingPeriods.length;

  // Classify risk based on number of infection periods
  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (infectionPeriods >= 3) {
    riskLevel = "high";
    riskScore = 88;
  } else if (infectionPeriods >= 1) {
    riskLevel = "moderate";
    riskScore = 35 + infectionPeriods * 15;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  // Product suggestions
  const productSuggestions = getProductSuggestions(riskLevel);

  // Build conversational details
  let details: string;
  if (riskLevel === "high") {
    details = `Multiple warm wet periods this week are creating conditions for black rot infection. ${infectionPeriods} extended wet periods at 15–30°C detected — remove mummified fruit and cankers to reduce inoculum.`;
  } else if (riskLevel === "moderate") {
    details = `A warm wet period this week could allow black rot to develop. The fungus needs 9+ hours of continuous leaf wetness at 15–30°C to infect, and ${infectionPeriods} qualifying period(s) occurred.`;
  } else {
    details = "No significant warm wet periods detected recently. Black rot needs 9+ hours of leaf wetness at 15–30°C to infect — conditions haven't aligned.";
  }

  // Build recommendation
  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Multiple infection periods detected. " +
      "Apply fungicide (captan or myclobutanil) and remove mummified fruit and cankers. " +
      "Ensure good canopy airflow through pruning.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Infection period(s) detected. " +
      "Scout for leaf spots and fruit rot symptoms. " +
      "Apply protective fungicide if not already covered.";
  } else {
    recommendation =
      "Low risk. Continue monitoring; maintain sanitation by removing infected material.";
  }

  return {
    riskLevel,
    riskScore,
    infectionPeriods,
    productSuggestions,
    details,
    recommendation,
  };
}
