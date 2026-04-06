// ---------------------------------------------------------------------------
// Rosy Apple Aphid Pest Model — Degree-day hatch from March 1
//
// Tracks Dysaphis plantaginea egg hatch using cumulative degree-days
// (base 5°C) from March 1.  Hatch occurs at 80-120 DD.  Critical window
// is green tip through pink — post-bloom control is futile.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RosyAppleAphidResult {
  riskLevel: "low" | "moderate" | "high" | "critical";
  riskScore: number;
  cumulativeDD: number;
  hatchExpected: boolean;
  criticalWindow: boolean;
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
const HATCH_LOW = 80;
const HATCH_HIGH = 120;
const MARCH_1_SUFFIX = "-03-01";

const CRITICAL_STAGES = ["green-tip", "tight-cluster", "pink"];
const BLOOM_STAGES = ["bloom", "petal-fall", "fruit-set"];

const ECONOMIC_THRESHOLD = "1-2% infested clusters at pink";

const SCOUTING_PROTOCOL =
  "Inspect 20 clusters per tree on 10 trees. Look for curled leaves with grey-pink aphid colonies.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Assail (acetamiprid)",
  "Admire (imidacloprid)",
  "Movento (spirotetramat)",
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

export function evaluateRosyAppleAphid(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  bloomStage: string,
): RosyAppleAphidResult {
  const filtered = filterFromMarch1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const hatchExpected = cumulativeDD >= HATCH_LOW;
  const criticalWindow = CRITICAL_STAGES.includes(bloomStage);
  const pastBloom = BLOOM_STAGES.includes(bloomStage);

  let riskLevel: "low" | "moderate" | "high" | "critical";
  let riskScore: number;

  if (hatchExpected && pastBloom) {
    riskLevel = "critical";
    riskScore = 90;
  } else if (hatchExpected && bloomStage === "pink") {
    riskLevel = "high";
    riskScore = 78;
  } else if (criticalWindow && cumulativeDD >= HATCH_LOW * 0.6) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (riskLevel === "critical") {
    details = `Rosy apple aphid has hatched and trees are past bloom — control is very difficult now. Colonies curl inside leaves where sprays can't reach. Focus on monitoring damage and planning for next year.`;
  } else if (riskLevel === "high") {
    details = `Eggs have hatched and trees are at pink — this is the last effective spray window. Aphids are still exposed on developing leaves. Apply insecticide now before colonies curl leaves shut.`;
  } else if (riskLevel === "moderate") {
    details = `Approaching rosy apple aphid hatch (${roundedDD} of ${HATCH_LOW} DD from March 1) during the critical window. Scout developing buds for tiny grey-pink aphids (fundatrices). Pre-bloom treatment is most effective.`;
  } else {
    details = `Too early for rosy apple aphid. Eggs hatch around ${HATCH_LOW}–${HATCH_HIGH} degree days (base 5°C from March 1) — you're at ${roundedDD} DD. Control must happen before bloom when aphids are still exposed.`;
  }

  let recommendation: string;
  if (riskLevel === "critical") {
    recommendation =
      "Post-bloom — rosy apple aphid control is largely futile. " +
      "Colonies are curled inside leaves and protected from sprays.";
  } else if (riskLevel === "high") {
    recommendation =
      "Hatch has occurred and trees are at pink — last effective spray window. " +
      "Apply neonicotinoid or spirotetramat immediately.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Approaching hatch during critical window. Scout for fundatrices on developing buds. " +
      "Plan pre-bloom application if colonies found.";
  } else {
    recommendation =
      "Low risk. Monitor degree-day accumulation toward 80 DD hatch threshold.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    hatchExpected,
    criticalWindow,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
