// ---------------------------------------------------------------------------
// Mullein Bug Pest Model — Degree-day egg hatch from April 1
//
// Tracks Campylomma verbasci egg hatch using cumulative degree-days
// (base 7°C) from April 1.  Egg hatch occurs at ~200 DD (during bloom).
// This species is both a predator (mites) and pest (fruit dimpling) —
// treatment decisions must weigh both roles.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MulleinBugResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  eggHatch: boolean;
  details: string;
  recommendation: string;
  economicThreshold: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_TEMP = 7;
const EGG_HATCH_DD = 200;
const APPROACH_DD = 140;
const APRIL_1_SUFFIX = "-04-01";

const ECONOMIC_THRESHOLD = "2 per tray of 25 tapped clusters during bloom";

const SCOUTING_PROTOCOL =
  "Tap 25 clusters onto white tray per block during bloom. Count mullein bug nymphs (tiny, pale green).";

const PRODUCT_SUGGESTIONS: string[] = [
  "Assail (acetamiprid)",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterFromApril1(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): Array<{ date: string; max_temp: number; min_temp: number }> {
  if (dailyData.length === 0) return [];
  const year = dailyData[0].date.substring(0, 4);
  const april1 = `${year}${APRIL_1_SUFFIX}`;
  return dailyData.filter((d) => d.date >= april1);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateMulleinBug(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): MulleinBugResult {
  const filtered = filterFromApril1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const eggHatch = cumulativeDD >= EGG_HATCH_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (eggHatch) {
    riskLevel = "high";
    riskScore = 70;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "moderate";
    riskScore = 42;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (riskLevel === "high") {
    details = "Mullein bug eggs have hatched and nymphs are active during bloom. These tiny bugs cause dimpling on fruit, but they also eat mites, so weigh the trade-off before spraying.";
  } else if (riskLevel === "moderate") {
    details = "Egg hatch is approaching as degree-days build toward bloom. Mullein bug nymphs can dimple fruit but also provide valuable mite control, so get ready to scout and decide whether treatment is worthwhile.";
  } else {
    details = "Too early for mullein bug activity. This insect hatches during bloom and can dimple fruit, though it also feeds on mites, making it both pest and beneficial.";
  }

  let recommendation: string;
  if (eggHatch) {
    recommendation =
      "Egg hatch has occurred — nymphs active during bloom. " +
      "Scout by limb-tapping. Weigh mite predation benefit against fruit damage risk. " +
      "Treat only if threshold exceeded and mite pressure is low.";
  } else if (riskLevel === "moderate") {
    recommendation =
      `Approaching egg hatch (${roundedDD} of ${EGG_HATCH_DD} DD). ` +
      "Prepare for bloom-period scouting. Assess mite pressure to inform treatment decision.";
  } else {
    recommendation =
      "Low risk. Monitor degree-day accumulation toward 200 DD hatch threshold.";
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
