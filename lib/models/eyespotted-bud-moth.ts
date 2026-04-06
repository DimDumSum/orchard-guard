// ---------------------------------------------------------------------------
// Eyespotted Bud Moth (Spilonota ocellana) — Degree-day phenology from April 1
//
// Tracks overwintering larval activity using cumulative degree-days (base 5°C)
// from April 1.  One generation per year.  Larvae become active around 100 DD
// and damage expanding buds at tight cluster.
// ---------------------------------------------------------------------------

import { calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface EyespottedBudMothResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  larvaeActive: boolean;
  details: string;
  recommendation: string;
  economicThreshold: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const BASE_TEMP = 5;
const LARVAE_ACTIVE_DD = 100;
const APPROACH_DD = 70;
const ECONOMIC_THRESHOLD = ">5% buds infested at tight cluster";
const SCOUTING_PROTOCOL = "Inspect 50 flower buds per block at tight cluster. Look for webbed buds with feeding damage and frass.";
const PRODUCT_SUGGESTIONS = ["Altacor (chlorantraniliprole)", "Entrust (spinosad, organic)"];

function filterFromApril1(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
) {
  if (dailyData.length === 0) return [];
  const year = dailyData[0].date.substring(0, 4);
  return dailyData.filter((d) => d.date >= `${year}-04-01`);
}

export function evaluateEyespottedBudMoth(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): EyespottedBudMothResult {
  const filtered = filterFromApril1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;
  const larvaeActive = cumulativeDD >= LARVAE_ACTIVE_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (larvaeActive) {
    riskLevel = "high";
    riskScore = 75;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "moderate";
    riskScore = 42;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const ddRemaining = larvaeActive ? 0 : Math.round((LARVAE_ACTIVE_DD - cumulativeDD) * 10) / 10;

  let details: string;
  if (riskLevel === "high") {
    details = "Eyespotted bud moth larvae are active and feeding inside expanding buds. Look for webbed-together buds with frass at tight cluster.";
  } else if (riskLevel === "moderate") {
    details = "Larval activity is approaching as temperatures warm. These caterpillars web into opening buds and chew on developing flowers, so start checking buds soon.";
  } else {
    details = "Too early for eyespotted bud moth activity. Overwintering larvae become active around tight cluster and feed inside expanding buds, but conditions haven't warmed enough yet.";
  }

  const recommendation = larvaeActive
    ? "Larvae active in expanding buds. Scout at tight cluster and treat if threshold exceeded."
    : cumulativeDD >= APPROACH_DD
      ? `Approaching larval activity (${ddRemaining} DD remaining). Begin scouting buds.`
      : "Low risk. Monitor degree-day accumulation toward 100 DD larval activity threshold.";

  return {
    riskLevel, riskScore, cumulativeDD: roundedDD, larvaeActive, details,
    recommendation, economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL, productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
