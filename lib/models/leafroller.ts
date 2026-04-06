// ---------------------------------------------------------------------------
// Leafroller Pest Model — Degree-day phenology from March 1
//
// Tracks oblique-banded leafroller (OBLR) summer emergence using cumulative
// degree-days (base 6°C) from March 1.  Summer generation adults emerge
// around 700 DD.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeafrollerResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Cumulative degree-days base 6°C from March 1. */
  cumulativeDD: number;
  /** True when DD >= summer emergence threshold (700 DD). */
  emerged: boolean;
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

const BASE_TEMP = 6;
const EMERGENCE_DD = 700;

/** DD range for approaching emergence (moderate risk). */
const APPROACH_LOW = 600;

const ECONOMIC_THRESHOLD =
  "Treat when >3% of fruit clusters infested";

const SCOUTING_PROTOCOL =
  "Inspect 50 fruit clusters per block. Look for webbed or rolled leaves with feeding damage.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Altacor (chlorantraniliprole)",
  "Entrust (spinosad, organic)",
];

/** March 1 date string prefix for filtering. */
const MARCH_1_SUFFIX = "-03-01";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Filter daily data to only include records on or after March 1 of the
 * earliest year present in the data.
 */
function filterFromMarch1(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): Array<{ date: string; max_temp: number; min_temp: number }> {
  if (dailyData.length === 0) return [];

  // Determine the year from the first record
  const year = dailyData[0].date.substring(0, 4);
  const march1 = `${year}${MARCH_1_SUFFIX}`;

  return dailyData.filter((d) => d.date >= march1);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate leafroller risk based on degree-day accumulation from March 1.
 *
 * @param dailyData  Daily max/min temperature records covering the season
 *                   (ideally from January 1 or earlier).
 * @returns          Complete leafroller risk assessment.
 */
export function evaluateLeafroller(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): LeafrollerResult {
  const march1Data = filterFromMarch1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(march1Data, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const emerged = cumulativeDD >= EMERGENCE_DD;

  // Classify risk
  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (emerged) {
    riskLevel = "high";
    riskScore = 78;
  } else if (cumulativeDD >= APPROACH_LOW) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 12;
  }

  // Build conversational details
  let details: string;
  if (emerged) {
    details = `Summer generation leafroller adults have emerged (${roundedDD} DD from March 1). Scout for rolled or webbed leaves with feeding damage inside. Larvae feed on leaves and can damage fruit surfaces.`;
  } else if (riskLevel === "moderate") {
    const ddRemaining = Math.round(EMERGENCE_DD - cumulativeDD);
    details = `Approaching summer leafroller emergence — ${roundedDD} of ${EMERGENCE_DD} degree days. About ${ddRemaining} DD away. Begin scouting for overwintering larvae in leaf shelters.`;
  } else {
    details = `Too early for summer leafroller emergence. Adults emerge around ${EMERGENCE_DD} degree days (base 6°C from March 1) — you're at ${roundedDD} DD. Larvae roll leaves into shelters and feed inside.`;
  }

  // Build recommendation
  let recommendation: string;
  if (emerged) {
    recommendation =
      "Summer generation leafroller adults have emerged. " +
      "Scout for leaf-rolling damage and egg masses. " +
      "Apply Bt (Bacillus thuringiensis) or spinosad targeting young larvae.";
  } else if (riskLevel === "moderate") {
    recommendation =
      `Approaching summer emergence (${roundedDD} of ${EMERGENCE_DD} DD). ` +
      "Begin scouting for overwintering larvae in leaf shelters.";
  } else {
    recommendation =
      "Low risk. Monitor degree-day accumulation toward 700 DD emergence threshold.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    emerged,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
