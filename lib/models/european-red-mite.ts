// ---------------------------------------------------------------------------
// European Red Mite Pest Model — Degree-day egg hatch from March 1
//
// Tracks European red mite (Panonychus ulmi) overwintering egg hatch using
// cumulative degree-days (base 5°C) from March 1.  Egg hatch begins at
// approximately 185 DD.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EuropeanRedMiteResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Cumulative degree-days base 5°C from March 1. */
  cumulativeDD: number;
  /** True when DD >= egg hatch threshold (185 DD). */
  eggHatch: boolean;
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
const EGG_HATCH_DD = 185;

/** DD range for approaching egg hatch (moderate risk). */
const APPROACH_DD = 140;

const ECONOMIC_THRESHOLD =
  "Treat when cumulative mite-days exceed 500 per leaf, or average >5 mites per leaf";

const SCOUTING_PROTOCOL =
  "Check 10 leaves per tree on 10 trees. Count all mites (adults + nymphs). Calculate mite-days.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Superior Oil (dormant or summer rate)",
  "Nexter (pyridaben)",
  "Acramite (bifenazate)",
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

  const year = dailyData[0].date.substring(0, 4);
  const march1 = `${year}${MARCH_1_SUFFIX}`;

  return dailyData.filter((d) => d.date >= march1);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate European red mite risk based on degree-day accumulation from
 * March 1.
 *
 * @param dailyData  Daily max/min temperature records covering the season
 *                   (ideally from January 1 or earlier).
 * @returns          Complete European red mite risk assessment.
 */
export function evaluateEuropeanRedMite(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): EuropeanRedMiteResult {
  const march1Data = filterFromMarch1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(march1Data, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const eggHatch = cumulativeDD >= EGG_HATCH_DD;

  // Classify risk
  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (eggHatch) {
    riskLevel = "high";
    riskScore = 80;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  // Build details and recommendation with conversational text
  let details: string;
  let recommendation: string;

  if (eggHatch) {
    details =
      `Overwintering eggs are hatching (${roundedDD} degree days, threshold was ${EGG_HATCH_DD}). Mites are emerging and will start feeding on lower leaf surfaces.`;
    recommendation =
      "Scout for mites on lower leaf surfaces. Apply miticide if populations exceed 2.5 mites per leaf.";
  } else if (riskLevel === "moderate") {
    const ddRemaining = Math.round((EGG_HATCH_DD - cumulativeDD) * 10) / 10;
    details =
      `Approaching egg hatch \u2014 ${roundedDD} of ${EGG_HATCH_DD} degree days accumulated (${ddRemaining} remaining). Scout for red egg masses on twigs now.`;
    recommendation =
      "Consider superior oil spray before green tip if mite pressure was high last season. Oil smothers overwintering eggs.";
  } else {
    const ddRemaining = Math.round((EGG_HATCH_DD - cumulativeDD) * 10) / 10;
    details =
      `Overwintering eggs haven\u2019t hatched yet. Egg hatch begins around ${EGG_HATCH_DD} degree days (base ${BASE_TEMP}\u00B0C) \u2014 you\u2019re at ${roundedDD}, roughly ${ddRemaining} DD away.`;
    recommendation =
      "Plan dormant oil spray before green tip if mite pressure was high last season. Oil smothers overwintering eggs.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    eggHatch,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
