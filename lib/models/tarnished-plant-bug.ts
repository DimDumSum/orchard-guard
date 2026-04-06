// ---------------------------------------------------------------------------
// Tarnished Plant Bug Pest Model — Degree-day activity from April 1
//
// Tracks Lygus lineolaris activity using cumulative degree-days (base 5°C)
// from April 1.  Adults become active at ~150 DD.  Critical damage window
// is petal fall through 3 weeks post-bloom.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TarnishedPlantBugResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  active: boolean;
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
const ACTIVE_DD = 150;
const APPROACH_DD = 100;
const APRIL_1_SUFFIX = "-04-01";
const POST_BLOOM_DAYS = 21;

const ECONOMIC_THRESHOLD = "4-5 per 25 tapped clusters";

const SCOUTING_PROTOCOL =
  "Tap 5 clusters per tree on 10 trees onto white tray. Count adults and nymphs.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Assail (acetamiprid)",
  "Sevin (carbaryl)",
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

function isInCriticalWindow(
  bloomStage: string,
  petalFallDate: string | null,
  lastDate: string | null,
): boolean {
  if (bloomStage === "petal-fall" || bloomStage === "fruit-set") return true;
  if (!petalFallDate || !lastDate) return false;
  const pfTime = new Date(petalFallDate).getTime();
  const curTime = new Date(lastDate).getTime();
  const daysSincePF = (curTime - pfTime) / (1000 * 60 * 60 * 24);
  return daysSincePF >= 0 && daysSincePF <= POST_BLOOM_DAYS;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateTarnishedPlantBug(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  bloomStage: string,
  petalFallDate: string | null,
): TarnishedPlantBugResult {
  const filtered = filterFromApril1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const active = cumulativeDD >= ACTIVE_DD;
  const lastDate = dailyData.length > 0 ? dailyData[dailyData.length - 1].date : null;
  const criticalWindow = isInCriticalWindow(bloomStage, petalFallDate, lastDate);

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (active && criticalWindow) {
    riskLevel = "high";
    riskScore = 82;
  } else if (active || (criticalWindow && cumulativeDD >= APPROACH_DD)) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (riskLevel === "high") {
    details = `Tarnished plant bugs are active (${roundedDD} degree-days) and you are in the critical damage window from petal fall through three weeks post-bloom. Do not mow the orchard floor right now — it drives them into the trees.`;
  } else if (riskLevel === "moderate") {
    details = `Adults are becoming active or the critical window is approaching at ${roundedDD} degree-days. Tarnished plant bug causes dimpling and cat-facing on young fruitlets, so start limb-tap scouting soon.`;
  } else {
    details = `Too early for tarnished plant bug activity at ${roundedDD} degree-days. Adults become active around ${ACTIVE_DD} degree-days from April 1, and the real damage window is petal fall through three weeks after bloom.`;
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Tarnished plant bug active during critical damage window. " +
      "Scout by limb-tapping. Apply insecticide if threshold exceeded. " +
      "Avoid mowing orchard floor during this period.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Adults active or approaching critical window. Begin limb-tap scouting. " +
      "Delay mowing until after critical period.";
  } else {
    recommendation =
      "Low risk. Monitor degree-day accumulation toward 150 DD activity threshold.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    active,
    criticalWindow,
    details,
    recommendation,
    economicThreshold: ECONOMIC_THRESHOLD,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
