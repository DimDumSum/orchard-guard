// ---------------------------------------------------------------------------
// Apple Clearwing Moth — Degree-day phenology from January 1
//
// Tracks adult emergence of Synanthedon myopaeformis using cumulative
// degree-days (base 10°C) from January 1.  Adults emerge around 400 DD
// and lay eggs near graft unions; larvae bore into trunk wood.
// ---------------------------------------------------------------------------

import { calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface ClearwingMothResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  adultEmergence: boolean;
  details: string;
  recommendation: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const BASE_TEMP = 10;
const EMERGENCE_DD = 400;
const APPROACH_DD = 330;
const SCOUTING_PROTOCOL = "Inspect graft unions for frass and sawdust-like debris. Check pheromone traps weekly from late spring.";
const PRODUCT_SUGGESTIONS = ["Chlorpyrifos (where registered)", "Pheromone mating disruption"];

function filterFromJan1(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
) {
  if (dailyData.length === 0) return [];
  const year = dailyData[0].date.substring(0, 4);
  return dailyData.filter((d) => d.date >= `${year}-01-01`);
}

export function evaluateClearwingMoth(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): ClearwingMothResult {
  const filtered = filterFromJan1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;
  const adultEmergence = cumulativeDD >= EMERGENCE_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (adultEmergence) {
    riskLevel = "high";
    riskScore = 75;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const ddRemaining = adultEmergence ? 0 : Math.round((EMERGENCE_DD - cumulativeDD) * 10) / 10;

  let details: string;
  if (riskLevel === "high") {
    details = "Apple clearwing moth adults have emerged and are laying eggs near graft unions. Larvae bore into trunk wood, weakening trees over time.";
  } else if (riskLevel === "moderate") {
    details = "Adult emergence is approaching. Clearwing moth larvae tunnel into trunk wood around graft unions, so inspect trunks and get pheromone traps ready.";
  } else {
    details = "Too early for clearwing moth activity. This moth lays eggs at graft unions in summer, and the larvae bore into trunk wood. No action needed until temperatures warm up.";
  }

  const recommendation = adultEmergence
    ? "Adults emerged — egg-laying at graft unions underway. Inspect trunks for frass and apply trunk treatments or deploy mating disruption."
    : cumulativeDD >= APPROACH_DD
      ? `Approaching adult emergence (${ddRemaining} DD remaining). Deploy pheromone traps and inspect graft unions.`
      : "Low risk. Monitor degree-day accumulation toward 400 DD emergence threshold.";

  return {
    riskLevel, riskScore, cumulativeDD: roundedDD, adultEmergence,
    details, recommendation, scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
