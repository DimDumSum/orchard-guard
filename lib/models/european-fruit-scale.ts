// ---------------------------------------------------------------------------
// European Fruit Scale Pest Model — Degree-day crawler emergence from March 1
//
// Tracks Quadraspidiotus ostreaeformis crawler emergence using cumulative
// degree-days (base 10°C) from March 1.  Crawlers emerge at ~550 DD,
// slightly later than San Jose scale.  Management is similar.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EuropeanFruitScaleResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  crawlerEmergence: boolean;
  details: string;
  recommendation: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_TEMP = 10;
const CRAWLER_DD = 550;
const APPROACH_DD = 430;
const MARCH_1_SUFFIX = "-03-01";

const PRODUCT_SUGGESTIONS: string[] = [
  "Superior Oil (dormant)",
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

export function evaluateEuropeanFruitScale(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): EuropeanFruitScaleResult {
  const filtered = filterFromMarch1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const crawlerEmergence = cumulativeDD >= CRAWLER_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (crawlerEmergence) {
    riskLevel = "high";
    riskScore = 74;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "moderate";
    riskScore = 42;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (riskLevel === "high") {
    details = "European fruit scale crawlers are emerging and settling on bark and fruit. Like San Jose scale, crawlers are the only stage vulnerable to contact sprays, so timing matters.";
  } else if (riskLevel === "moderate") {
    details = "Crawler emergence is building. European fruit scale is similar to San Jose scale but emerges a bit later. It feeds under a protective shell on branches and fruit.";
  } else {
    details = "No European fruit scale crawler activity yet. This armored scale behaves like San Jose scale and is managed the same way, but its crawlers emerge slightly later in the season.";
  }

  let recommendation: string;
  if (crawlerEmergence) {
    recommendation =
      "Crawlers emerging — apply Movento or targeted crawler spray. " +
      "Management is the same as for San Jose scale.";
  } else if (riskLevel === "moderate") {
    recommendation =
      `Approaching crawler emergence (${roundedDD} of ${CRAWLER_DD} DD). ` +
      "Ensure dormant oil was applied. Monitor with tape traps.";
  } else {
    recommendation =
      "Low risk. Apply superior oil at dormant stage if scale history present. " +
      "Monitor DD accumulation toward 550 DD crawler emergence.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    crawlerEmergence,
    details,
    recommendation,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
