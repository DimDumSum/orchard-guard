// ---------------------------------------------------------------------------
// Codling Moth Pest Model — Degree-day based phenology tracking
//
// Tracks codling moth development using cumulative degree-days (base 10°C)
// from biofix (first sustained moth catch in pheromone traps).  Two
// generations are modelled with key thresholds for egg hatch timing.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CodlingMothThreshold {
  dd: number;
  label: string;
  action: string;
}

export interface CodlingMothResult {
  riskLevel: "low" | "moderate" | "high" | "critical";
  riskScore: number;
  /** Cumulative degree-days base 10°C from biofix. */
  cumulativeDD: number;
  /** Which threshold we are currently at or approaching. */
  currentThreshold: string;
  /** Next upcoming threshold, or null if past all thresholds. */
  nextThreshold: CodlingMothThreshold | null;
  /** Degree-days remaining until the next threshold. */
  ddToNextThreshold: number;
  /** Current generation (1 or 2). */
  generation: number;
  details: string;
  recommendation: string;
  /** OMAFRA IPM guideline economic threshold. */
  economicThreshold: string | null;
  /** What to look for, how many trees. */
  scoutingProtocol: string;
  /** Specific product name suggestions. */
  productSuggestions: string[];
  /** Weekly trap count entries. */
  trapCounts?: number[];
  /** Auto-detected biofix from trap data. */
  autoDetectedBiofix?: string;
  /** Spray program type. */
  sprayProgram: "conventional" | "organic";
  /** Product recommendations for conventional spray program. */
  conventionalProducts: string[];
  /** Product recommendations for organic spray program. */
  organicProducts: string[];
}

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

const BASE_TEMP = 10;

const THRESHOLDS: readonly CodlingMothThreshold[] = [
  { dd: 100, label: "1st gen egg hatch begins", action: "START spray coverage" },
  { dd: 250, label: "1st gen peak egg hatch", action: "Critical spray window — maintain coverage" },
  { dd: 550, label: "1st generation complete", action: "Evaluate need for continued coverage" },
  { dd: 1050, label: "2nd gen egg hatch begins", action: "START second-generation spray coverage" },
  { dd: 1200, label: "2nd gen peak egg hatch", action: "Critical spray window — maintain coverage" },
];

/** DD values that represent egg-hatch events (critical proximity triggers). */
const EGG_HATCH_DDS = [100, 250, 1050, 1200];

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
 * Determine which threshold we are currently at or have most recently passed.
 */
function getCurrentThreshold(cdd: number): CodlingMothThreshold | null {
  let current: CodlingMothThreshold | null = null;
  for (const t of THRESHOLDS) {
    if (cdd >= t.dd) {
      current = t;
    }
  }
  return current;
}

/**
 * Determine the next upcoming threshold.
 */
function getNextThreshold(cdd: number): CodlingMothThreshold | null {
  for (const t of THRESHOLDS) {
    if (cdd < t.dd) {
      return t;
    }
  }
  return null;
}

/**
 * Determine the current generation based on cumulative DD.
 */
function getGeneration(cdd: number): number {
  return cdd >= 1050 ? 2 : 1;
}

/**
 * Determine risk level from cumulative DD relative to thresholds.
 *
 * - critical: within 30 DD of an egg hatch threshold (100, 250, 1050, 1200)
 * - high: within an egg hatch window (100–550 or 1050+)
 * - moderate: 70–100 DD before any egg hatch threshold
 * - low: otherwise or no biofix set
 */
function classifyRisk(
  cdd: number,
): "low" | "moderate" | "high" | "critical" {
  // Check critical — within 30 DD of an egg-hatch threshold
  for (const hatchDD of EGG_HATCH_DDS) {
    if (Math.abs(cdd - hatchDD) <= 30) {
      return "critical";
    }
  }

  // Check high — within active egg-hatch windows
  if ((cdd >= 100 && cdd <= 550) || cdd >= 1050) {
    return "high";
  }

  // Check moderate — 70–100 DD before any egg-hatch threshold
  for (const hatchDD of EGG_HATCH_DDS) {
    const ddBefore = hatchDD - cdd;
    if (ddBefore > 0 && ddBefore <= 100) {
      return "moderate";
    }
  }

  return "low";
}

/** Convert risk level to a 0–100 numeric score. */
function riskToScore(risk: "low" | "moderate" | "high" | "critical"): number {
  switch (risk) {
    case "low":
      return 15;
    case "moderate":
      return 45;
    case "high":
      return 70;
    case "critical":
      return 92;
  }
}

// ---------------------------------------------------------------------------
// Spray program products
// ---------------------------------------------------------------------------

const CONVENTIONAL_PRODUCTS: string[] = [
  "Altacor (chlorantraniliprole)",
  "Assail (acetamiprid)",
  "Imidan (phosmet)",
];

const ORGANIC_PRODUCTS: string[] = [
  "Entrust (spinosad)",
  "Surround (kaolin clay)",
  "Codling moth granulosis virus",
];

const ECONOMIC_THRESHOLD =
  "Action threshold: 5+ moths per trap per week";

const SCOUTING_PROTOCOL =
  "Check pheromone traps weekly. Record total moths caught. Inspect 20 fruit clusters per 50 trees for entry holes and frass.";

// ---------------------------------------------------------------------------
// Biofix auto-detection
// ---------------------------------------------------------------------------

/**
 * Auto-detect biofix from trap data.  Biofix is defined as the first week
 * where 2 or more moths are caught in consecutive weeks.
 *
 * @param trapEntries  Array of weekly trap observations with ISO date and count.
 * @returns            ISO date string of the detected biofix, or `null` if the
 *                     pattern is not found.
 */
export function detectBiofix(
  trapEntries: Array<{ date: string; count: number }>,
): string | null {
  if (trapEntries.length < 2) return null;

  // Sort by date ascending
  const sorted = [...trapEntries].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].count >= 2 && sorted[i].count >= 2) {
      return sorted[i - 1].date;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate codling moth risk based on degree-day accumulation from biofix.
 *
 * @param dailyData   Daily max/min temperature records covering the season.
 * @param biofixDate  ISO date string for biofix (first sustained moth catch),
 *                    or `null` if biofix has not been set.
 * @returns           Complete codling moth risk assessment.
 */
export function evaluateCodlingMoth(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  biofixDate: string | null,
): CodlingMothResult {
  // No biofix → return low-risk default
  if (!biofixDate) {
    return {
      riskLevel: "low",
      riskScore: 5,
      cumulativeDD: 0,
      currentThreshold: "Biofix not set",
      nextThreshold: THRESHOLDS[0],
      ddToNextThreshold: 0,
      generation: 1,
      details: "Biofix date has not been set.",
      recommendation:
        "Set biofix date (first sustained moth catch) to enable tracking.",
      economicThreshold: ECONOMIC_THRESHOLD,
      scoutingProtocol: SCOUTING_PROTOCOL,
      productSuggestions: [...CONVENTIONAL_PRODUCTS, ...ORGANIC_PRODUCTS],
      sprayProgram: "conventional",
      conventionalProducts: CONVENTIONAL_PRODUCTS,
      organicProducts: ORGANIC_PRODUCTS,
    };
  }

  // Filter data from biofix onward and accumulate degree-days
  const biofixData = filterFromBiofix(dailyData, biofixDate);
  const cumulativeDD = calcCumulativeDegreeDays(biofixData, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const current = getCurrentThreshold(cumulativeDD);
  const next = getNextThreshold(cumulativeDD);
  const ddToNext = next ? Math.round((next.dd - cumulativeDD) * 10) / 10 : 0;
  const generation = getGeneration(cumulativeDD);
  const riskLevel = classifyRisk(cumulativeDD);
  const riskScore = riskToScore(riskLevel);

  // Build details string
  let details: string;
  if (riskLevel === "critical") {
    details = `Codling moth egg hatch is imminent or underway — larvae will bore into fruit within hours of hatching. This is the most critical spray timing of the season. Generation ${generation}.`;
  } else if (riskLevel === "high") {
    details = `Codling moth eggs are actively hatching (generation ${generation}). Larvae tunnel into fruit, leaving frass-filled entry holes at the calyx or side of the apple. Spray coverage must be in place now.`;
  } else if (riskLevel === "moderate") {
    details = `Degree-days are building toward the next codling moth egg hatch (${ddToNext} DD away). This is the time to get spray materials ready. Codling moth is the most damaging apple pest — larvae bore into the core, making fruit unmarketable.`;
  } else if (!current) {
    details = "Biofix is set but no development thresholds have been reached yet. Codling moth larvae are the classic 'worm in the apple' — tracking degree-days from first moth catch lets you time sprays to hit egg hatch precisely.";
  } else {
    details = "Low codling moth risk right now. Continue monitoring pheromone traps weekly and tracking degree-day accumulation so you're ready when the next egg hatch window approaches.";
  }

  // Build recommendation
  let recommendation: string;
  if (riskLevel === "critical") {
    const nearestHatch = EGG_HATCH_DDS.reduce((closest, dd) =>
      Math.abs(cumulativeDD - dd) < Math.abs(cumulativeDD - closest)
        ? dd
        : closest,
    );
    recommendation =
      `Egg hatch ${cumulativeDD >= nearestHatch ? "in progress" : "imminent"} ` +
      `(${nearestHatch} DD threshold). Ensure spray coverage is in place.`;
  } else if (riskLevel === "high") {
    recommendation =
      generation === 1
        ? "Active egg hatch window (1st generation). Maintain spray coverage."
        : "Active egg hatch window (2nd generation). Maintain spray coverage.";
  } else if (riskLevel === "moderate") {
    recommendation = next
      ? `Approaching ${next.label} (${ddToNext} DD away). Prepare spray materials.`
      : "Monitor degree-day accumulation.";
  } else {
    recommendation = "Low risk. Continue monitoring traps and degree-day accumulation.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    currentThreshold: current ? current.label : "Pre-emergence",
    nextThreshold: next ?? null,
    ddToNextThreshold: ddToNext,
    generation,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: [...CONVENTIONAL_PRODUCTS, ...ORGANIC_PRODUCTS],
    sprayProgram: "conventional",
    conventionalProducts: CONVENTIONAL_PRODUCTS,
    organicProducts: ORGANIC_PRODUCTS,
  };
}
