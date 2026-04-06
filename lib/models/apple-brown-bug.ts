// ---------------------------------------------------------------------------
// Apple Brown Bug Pest Model — Degree-day egg hatch from March 1
//
// Tracks Atractotomus mali egg hatch using cumulative degree-days (base 5°C)
// from March 1.  Egg hatch occurs at ~170 DD (around bloom).  Often
// controlled incidentally by petal fall insecticide targeting plum curculio.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppleBrownBugResult {
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

const BASE_TEMP = 5;
const EGG_HATCH_DD = 170;
const APPROACH_DD = 120;
const MARCH_1_SUFFIX = "-03-01";

const ECONOMIC_THRESHOLD = "2 nymphs per 25 tapped clusters";

const SCOUTING_PROTOCOL =
  "Tap 25 clusters onto white tray per block. Count brown bug nymphs (small, fast-moving).";

const PRODUCT_SUGGESTIONS: string[] = [
  "Assail (acetamiprid)",
  "Sevin (carbaryl)",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

export function evaluateAppleBrownBug(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): AppleBrownBugResult {
  const filtered = filterFromMarch1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const eggHatch = cumulativeDD >= EGG_HATCH_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (eggHatch) {
    riskLevel = "high";
    riskScore = 72;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "moderate";
    riskScore = 42;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (riskLevel === "high") {
    details = `Apple brown bug eggs have hatched at ${roundedDD} degree-days and nymphs are active around bloom. The good news is that your petal fall spray for plum curculio usually takes care of these too.`;
  } else if (riskLevel === "moderate") {
    details = `Getting close to egg hatch at ${roundedDD} of ${EGG_HATCH_DD} degree-days. Apple brown bug nymphs feed on developing fruitlets, but they are usually controlled by the petal fall insecticide you apply for plum curculio.`;
  } else {
    details = `Too early for apple brown bug at ${roundedDD} degree-days. Eggs hatch around ${EGG_HATCH_DD} degree-days from March 1, roughly around bloom time.`;
  }

  let recommendation: string;
  if (eggHatch) {
    recommendation =
      "Egg hatch has occurred — nymphs active around bloom. " +
      "Scout by limb-tapping. Often controlled by petal fall spray for plum curculio.";
  } else if (riskLevel === "moderate") {
    recommendation =
      `Approaching egg hatch (${roundedDD} of ${EGG_HATCH_DD} DD). ` +
      "Scout for nymphs at bloom. Petal fall spray typically provides control.";
  } else {
    recommendation =
      "Low risk. Monitor degree-day accumulation toward 170 DD hatch threshold.";
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
