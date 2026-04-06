// ---------------------------------------------------------------------------
// San Jose Scale Pest Model — Degree-day crawler emergence from March 1
//
// Tracks Diaspidiotus perniciosus crawler emergence using cumulative
// degree-days (base 10°C) from March 1.  First-generation crawlers emerge
// at 450-500 DD; second generation at ~1100 DD.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SanJoseScaleResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  crawlerEmergence: boolean;
  secondGen: boolean;
  details: string;
  recommendation: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_TEMP = 10;
const CRAWLER_DD_LOW = 450;
const CRAWLER_DD_HIGH = 500;
const SECOND_GEN_DD = 1100;
const APPROACH_DD = 350;
const MARCH_1_SUFFIX = "-03-01";

const SCOUTING_PROTOCOL =
  "Wrap black electrical tape (sticky side out) around infested branches in May. " +
  "Check weekly for tiny yellow crawlers. Inspect fruit at harvest for red halos.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Superior Oil (dormant)",
  "Movento (summer crawlers)",
  "Diazinon (where registered)",
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

export function evaluateSanJoseScale(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): SanJoseScaleResult {
  const filtered = filterFromMarch1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const crawlerEmergence = cumulativeDD >= CRAWLER_DD_LOW;
  const secondGen = cumulativeDD >= SECOND_GEN_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (secondGen) {
    riskLevel = "high";
    riskScore = 82;
  } else if (crawlerEmergence) {
    riskLevel = "high";
    riskScore = 75;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (secondGen) {
    details = "Second-generation San Jose scale crawlers are emerging. These tiny mobile crawlers settle on fruit and wood, causing red halos on fruit and weakening branches. Late-season damage risk is high.";
  } else if (crawlerEmergence) {
    details = "First-generation crawlers are out and moving. San Jose scale crawlers are the vulnerable stage you can actually target with sprays — once they settle under a waxy cover, they're protected.";
  } else if (riskLevel === "moderate") {
    details = "Crawler emergence is approaching. San Jose scale is an armored scale insect that feeds under a waxy shell on bark and fruit, causing red-haloed blemishes at harvest.";
  } else {
    details = "No San Jose scale crawler activity yet. This armored scale feeds on bark and fruit, leaving red halos on apples. Crawlers won't emerge until enough heat accumulates in late spring.";
  }

  let recommendation: string;
  if (secondGen) {
    recommendation =
      "Second-generation crawlers emerging. Apply Movento or targeted crawler spray. " +
      "Late-season fruit damage risk is high.";
  } else if (crawlerEmergence) {
    recommendation =
      "First-generation crawlers emerging — apply crawler-targeted spray (Movento). " +
      "Use tape traps to monitor crawler activity.";
  } else if (riskLevel === "moderate") {
    recommendation =
      `Approaching crawler emergence (${roundedDD} of ${CRAWLER_DD_LOW} DD). ` +
      "Set up tape traps on infested branches. Ensure dormant oil was applied.";
  } else {
    recommendation =
      "Low risk. Apply superior oil at dormant stage if SJS history present. " +
      "Monitor DD accumulation toward 450 DD crawler emergence.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    crawlerEmergence,
    secondGen,
    details,
    recommendation,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
