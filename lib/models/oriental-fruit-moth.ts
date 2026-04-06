// ---------------------------------------------------------------------------
// Oriental Fruit Moth Pest Model — Degree-day phenology from biofix
//
// Tracks oriental fruit moth development across three generations using
// cumulative degree-days (base 7.2°C) from biofix (first sustained moth
// catch in pheromone traps).
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrientalFruitMothResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Cumulative degree-days base 7.2°C from biofix. */
  cumulativeDD: number;
  /** Current generation (1, 2, or 3). */
  generation: number;
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

const BASE_TEMP = 7.2;

/** Generation windows defined by DD range [start, end]. */
interface GenerationWindow {
  gen: number;
  startDD: number;
  endDD: number;
  label: string;
}

const GENERATION_WINDOWS: readonly GenerationWindow[] = [
  { gen: 1, startDD: 170, endDD: 350, label: "1st generation larval activity" },
  { gen: 2, startDD: 680, endDD: 850, label: "2nd generation larval activity" },
  { gen: 3, startDD: 1400, endDD: Infinity, label: "3rd generation activity" },
];

// ---------------------------------------------------------------------------
// IPM constants
// ---------------------------------------------------------------------------

const ECONOMIC_THRESHOLD =
  "Action threshold: 10+ moths per trap per week during any generation";

const SCOUTING_PROTOCOL =
  "Check pheromone traps weekly. Inspect 20 shoot tips for wilting (flagging) per 50 trees.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Altacor (chlorantraniliprole)",
  "Assail (acetamiprid)",
  "Entrust (spinosad, organic)",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Filter daily data to only include records on or after the biofix date.
 */
function filterFromBiofix(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  biofixDate: string,
): Array<{ date: string; max_temp: number; min_temp: number }> {
  return dailyData.filter((d) => d.date >= biofixDate);
}

/**
 * Determine which generation is active or most recently completed based on
 * cumulative DD.
 */
function getGeneration(cdd: number): number {
  if (cdd >= 1400) return 3;
  if (cdd >= 680) return 2;
  return 1;
}

/**
 * Determine whether the current DD falls within any active generation window.
 */
function getActiveWindow(cdd: number): GenerationWindow | null {
  for (const w of GENERATION_WINDOWS) {
    if (cdd >= w.startDD && cdd <= w.endDD) {
      return w;
    }
  }
  return null;
}

/**
 * Find the next generation window the DD is approaching.
 */
function getNextWindow(cdd: number): GenerationWindow | null {
  for (const w of GENERATION_WINDOWS) {
    if (cdd < w.startDD) {
      return w;
    }
  }
  return null;
}

/**
 * Determine how close we are to the next generation window for moderate
 * risk classification.
 */
function isApproachingWindow(cdd: number): boolean {
  const next = getNextWindow(cdd);
  if (!next) return false;
  const ddUntil = next.startDD - cdd;
  return ddUntil > 0 && ddUntil <= 50;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate oriental fruit moth risk based on degree-day accumulation from
 * biofix.
 *
 * @param dailyData   Daily max/min temperature records covering the season.
 * @param biofixDate  ISO date string for biofix (first sustained moth catch),
 *                    or `null` if biofix has not been set.
 * @returns           Complete oriental fruit moth risk assessment.
 */
export function evaluateOrientalFruitMoth(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  biofixDate: string | null,
): OrientalFruitMothResult {
  // No biofix → return low-risk default
  if (!biofixDate) {
    return {
      riskLevel: "low",
      riskScore: 5,
      cumulativeDD: 0,
      generation: 1,
      details: "Biofix date has not been set.",
      recommendation:
        "Set biofix date (first sustained moth catch) to enable tracking.",
      economicThreshold: ECONOMIC_THRESHOLD,
      scoutingProtocol: SCOUTING_PROTOCOL,
      productSuggestions: PRODUCT_SUGGESTIONS,
    };
  }

  // Filter data from biofix onward and accumulate degree-days
  const biofixData = filterFromBiofix(dailyData, biofixDate);
  const cumulativeDD = calcCumulativeDegreeDays(biofixData, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const generation = getGeneration(cumulativeDD);
  const activeWindow = getActiveWindow(cumulativeDD);
  const approaching = isApproachingWindow(cumulativeDD);

  // Classify risk
  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (activeWindow) {
    riskLevel = "high";
    riskScore = 80;
  } else if (approaching) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 15;
  }

  // Build conversational details
  let details: string;
  if (activeWindow) {
    if (activeWindow.gen === 1) {
      details = `First generation oriental fruit moth larvae are active (${roundedDD} DD from biofix). Primary damage is to shoot tips — look for wilting (flagging) on terminal shoots.`;
    } else if (activeWindow.gen === 2) {
      details = `Second generation larvae are active (${roundedDD} DD from biofix). Fruit entry risk is increasing as larvae shift from shoots to developing fruit.`;
    } else {
      details = `Third generation is active (${roundedDD} DD from biofix). Direct fruit damage is likely — larvae bore into maturing fruit near the stem end.`;
    }
  } else if (approaching) {
    const next = getNextWindow(cumulativeDD)!;
    const ddUntil = Math.round(next.startDD - cumulativeDD);
    details = `Approaching ${next.label} — about ${ddUntil} degree days away (${roundedDD} of ${next.startDD} DD). Prepare spray materials.`;
  } else if (!biofixDate) {
    details = "Biofix date not set. Set the date of first sustained moth catch in pheromone traps to enable degree-day tracking.";
  } else {
    details = `Between generation windows (${roundedDD} DD from biofix). Oriental fruit moth larvae damage shoot tips early in the season and bore into fruit later.`;
  }

  // Build recommendation
  let recommendation: string;
  if (activeWindow) {
    if (activeWindow.gen === 1) {
      recommendation =
        "1st generation larvae active — primary damage to shoot tips. " +
        "Apply insecticide targeting larvae. Monitor for flagging shoots.";
    } else if (activeWindow.gen === 2) {
      recommendation =
        "2nd generation larvae active — fruit entry risk increasing. " +
        "Maintain spray coverage to protect developing fruit.";
    } else {
      recommendation =
        "3rd generation active — direct fruit damage likely. " +
        "Apply protective sprays to late-maturing varieties.";
    }
  } else if (approaching) {
    const next = getNextWindow(cumulativeDD)!;
    recommendation =
      `Approaching ${next.label} (within 50 DD). Prepare spray materials.`;
  } else {
    recommendation =
      "Low risk. Continue monitoring traps and degree-day accumulation.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    generation,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
