// ---------------------------------------------------------------------------
// Green Apple Aphid Pest Model — Season-long presence model
//
// Aphis pomi is present all season and usually controlled by natural
// enemies.  This simple model flags moderate risk only when warm-season
// degree-day accumulation is high, suggesting rapid population growth.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GreenAppleAphidResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
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
const WARM_SEASON_DD = 1200;
const HIGH_DD = 1800;
const MARCH_1_SUFFIX = "-03-01";

const ECONOMIC_THRESHOLD = "50% of terminals infested";

const SCOUTING_PROTOCOL =
  "Check 10 terminal shoots per tree on 10 trees. Record percentage with active aphid colonies.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Assail (acetamiprid)",
  "Admire (imidacloprid)",
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

export function evaluateGreenAppleAphid(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): GreenAppleAphidResult {
  const filtered = filterFromMarch1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (cumulativeDD >= HIGH_DD) {
    riskLevel = "high";
    riskScore = 70;
  } else if (cumulativeDD >= WARM_SEASON_DD) {
    riskLevel = "moderate";
    riskScore = 40;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (riskLevel === "high") {
    details = `With ${roundedDD} degree-days accumulated, green apple aphids are reproducing rapidly and colonies may be outpacing natural enemies like ladybeetles and lacewings. Check terminals for honeydew and sooty mold.`;
  } else if (riskLevel === "moderate") {
    details = `Degree-day accumulation has reached ${roundedDD}, and warm conditions are starting to favor aphid buildup. Natural enemies are usually still in control, but watch for colonies expanding on shoot tips.`;
  } else {
    details = `No significant aphid pressure expected yet at ${roundedDD} degree-days. Green apple aphids are present all season but are typically kept in check by ladybeetles, lacewings, and syrphid flies.`;
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "High degree-day accumulation — rapid aphid reproduction likely. " +
      "Scout terminals for honeydew and sooty mold. Treat only if natural enemies absent and threshold exceeded.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Warm conditions favor aphid buildup. Scout for natural enemy presence before treating. " +
      "Avoid broad-spectrum sprays that disrupt biological control.";
  } else {
    recommendation =
      "Low risk. Natural enemies typically keep green apple aphid below threshold. Monitor terminals.";
  }

  return {
    riskLevel,
    riskScore,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
