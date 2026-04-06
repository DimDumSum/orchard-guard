// ---------------------------------------------------------------------------
// Japanese Beetle Pest Model — Degree-day adult emergence from January 1
//
// Tracks Popillia japonica adult emergence using cumulative degree-days
// (base 10°C) from January 1.  Adults become active at 700-1000 DD,
// typically July-August.  Traps are controversial as they may attract
// more beetles to the area.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JapaneseBeetleResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  adultsActive: boolean;
  details: string;
  recommendation: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_TEMP = 10;
const ADULTS_LOW = 700;
const ADULTS_HIGH = 1000;
const APPROACH_DD = 550;
const JAN_1_SUFFIX = "-01-01";

const SCOUTING_PROTOCOL =
  "Walk orchard perimeter and interior weekly July-August. " +
  "Assess defoliation level on 10 trees. Note feeding aggregation sites.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Sevin (carbaryl)",
  "Assail (acetamiprid)",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterFromJan1(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): Array<{ date: string; max_temp: number; min_temp: number }> {
  if (dailyData.length === 0) return [];
  const year = dailyData[0].date.substring(0, 4);
  const jan1 = `${year}${JAN_1_SUFFIX}`;
  return dailyData.filter((d) => d.date >= jan1);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateJapaneseBeetle(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): JapaneseBeetleResult {
  const filtered = filterFromJan1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const adultsActive = cumulativeDD >= ADULTS_LOW;
  const peakActivity = cumulativeDD >= ADULTS_HIGH;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (peakActivity) {
    riskLevel = "high";
    riskScore = 75;
  } else if (adultsActive) {
    riskLevel = "moderate";
    riskScore = 50;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "moderate";
    riskScore = 35;
  } else {
    riskLevel = "low";
    riskScore = 8;
  }

  let details: string;
  if (riskLevel === "high") {
    details = "Japanese beetles are at peak activity and can skeletonize leaves fast. Focus on trees with heavy feeding — treat only if defoliation exceeds 30%.";
  } else if (adultsActive) {
    details = "Adult Japanese beetles are starting to emerge and feed on leaves. Watch for shiny bronze beetles congregating on foliage — damage is usually worst on the sunny side of the canopy.";
  } else if (cumulativeDD >= APPROACH_DD) {
    details = "Degree-days are building toward Japanese beetle emergence, typically in July. These beetles chew leaves between the veins, leaving a lace-like skeleton — but they rarely cause serious damage to established orchards.";
  } else {
    details = "Too early for Japanese beetles. Adults usually don't appear until midsummer when enough heat has accumulated. They feed on leaves and can defoliate trees, but most orchards tolerate light feeding without yield loss.";
  }

  let recommendation: string;
  if (peakActivity) {
    recommendation =
      "Peak adult activity. Scout for defoliation and feeding aggregations. " +
      "Treat only if defoliation exceeds 30% on bearing trees. " +
      "Avoid beetle traps — they attract more beetles than they catch.";
  } else if (adultsActive) {
    recommendation =
      "Adults emerging. Monitor for feeding damage on leaves and fruit. " +
      "Spot-treat heavily infested trees if needed.";
  } else if (riskLevel === "moderate") {
    recommendation =
      `Approaching adult emergence (${roundedDD} of ${ADULTS_LOW} DD). ` +
      "Prepare to scout in July. Do not deploy beetle traps.";
  } else {
    recommendation =
      "Low risk. Adults not expected until 700+ DD (typically July).";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    adultsActive,
    details,
    recommendation,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
