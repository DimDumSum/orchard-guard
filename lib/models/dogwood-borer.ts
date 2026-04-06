// ---------------------------------------------------------------------------
// Dogwood Borer (Synanthedon scitula) — Degree-day phenology from January 1
//
// Tracks adult emergence using cumulative degree-days (base 10°C) from
// January 1.  Peak adult activity around 800 DD.  Primarily a problem on
// trees with dwarfing rootstocks (M.9, M.26) that develop burr knots.
// ---------------------------------------------------------------------------

import { calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface DogwoodBorerResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  adultPeak: boolean;
  details: string;
  recommendation: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const BASE_TEMP = 10;
const PEAK_DD = 800;
const APPROACH_DD = 650;
const SCOUTING_PROTOCOL = "Inspect burr knots on M.9/M.26 rootstocks for entry holes and frass. Check graft unions and exposed root tissue.";
const PRODUCT_SUGGESTIONS = ["Chlorpyrifos (where registered)"];

function filterFromJan1(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
) {
  if (dailyData.length === 0) return [];
  const year = dailyData[0].date.substring(0, 4);
  return dailyData.filter((d) => d.date >= `${year}-01-01`);
}

export function evaluateDogwoodBorer(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): DogwoodBorerResult {
  const filtered = filterFromJan1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;
  const adultPeak = cumulativeDD >= PEAK_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (adultPeak && cumulativeDD <= 1100) {
    riskLevel = "high";
    riskScore = 75;
  } else if (cumulativeDD >= APPROACH_DD && !adultPeak) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const ddRemaining = adultPeak ? 0 : Math.round((PEAK_DD - cumulativeDD) * 10) / 10;

  let details: string;
  if (riskLevel === "high") {
    details = "Dogwood borer adults are at peak activity and laying eggs on burr knots. Trees on dwarfing rootstocks like M.9 and M.26 are especially vulnerable because larvae bore into exposed root tissue.";
  } else if (riskLevel === "moderate") {
    details = "Adult emergence is building toward peak activity. Dogwood borer targets burr knots on dwarfing rootstocks, so inspect trunks and consider painting burr knots with white latex.";
  } else {
    details = "Too early for dogwood borer activity. This moth lays eggs on burr knots of dwarfing rootstocks, and larvae tunnel into trunk wood. No action needed yet.";
  }

  const recommendation = adultPeak
    ? "Peak adult emergence — egg-laying on burr knots underway. Apply trunk sprays. Paint burr knots with white latex. Mound soil over graft union."
    : cumulativeDD >= APPROACH_DD
      ? `Approaching peak adult emergence (${ddRemaining} DD remaining). Inspect burr knots. Paint burr knots with white latex. Mound soil over graft union.`
      : "Low risk. Monitor degree-day accumulation. Paint burr knots with white latex and mound soil over graft union as preventive measures.";

  return {
    riskLevel, riskScore, cumulativeDD: roundedDD, adultPeak,
    details, recommendation, scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
