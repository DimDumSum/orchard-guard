// ---------------------------------------------------------------------------
// Apple Flea Weevil Pest Model — Degree-day activity from April 1
//
// Tracks Rhynchaenus pallicornis activity using cumulative degree-days
// (base 5°C) from April 1.  Adults become active at ~100 DD.  Typically
// a minor pest — monitor only if previous damage observed.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppleFleaWeevilResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  active: boolean;
  details: string;
  recommendation: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_TEMP = 5;
const ACTIVE_DD = 100;
const APPROACH_DD = 65;
const APRIL_1_SUFFIX = "-04-01";
const HIGH_ACTIVITY_DD = 200;

const PRODUCT_SUGGESTIONS: string[] = [
  "Sevin (carbaryl)",
  "Assail (acetamiprid)",
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

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateAppleFleaWeevil(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): AppleFleaWeevilResult {
  const filtered = filterFromApril1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const active = cumulativeDD >= ACTIVE_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (cumulativeDD >= HIGH_ACTIVITY_DD) {
    riskLevel = "high";
    riskScore = 65;
  } else if (active) {
    riskLevel = "moderate";
    riskScore = 38;
  } else if (cumulativeDD >= APPROACH_DD) {
    riskLevel = "low";
    riskScore = 18;
  } else {
    riskLevel = "low";
    riskScore = 8;
  }

  let details: string;
  if (riskLevel === "high") {
    details = "Apple flea weevils are at peak activity, chewing small round holes in leaves. Treatment is only warranted if more than a quarter of leaves show damage.";
  } else if (riskLevel === "moderate") {
    details = "Flea weevil adults are active and may be feeding on leaves. This is usually a minor pest, but check for small shot-hole damage if you've had problems before.";
  } else {
    details = "Too early for apple flea weevil activity. These small weevils chew tiny round holes in leaves but rarely cause economic damage unless populations are unusually high.";
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Peak adult activity. Scout for shot-hole leaf damage. " +
      "Treat only if >25% of leaves show feeding damage.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Adults active. Check leaves for small round feeding holes. " +
      "Treatment rarely needed unless damage is widespread.";
  } else {
    recommendation =
      "Low risk. Typically minor pest. Monitor only if previous seasons had significant damage.";
  }

  return {
    riskLevel,
    riskScore,
    cumulativeDD: roundedDD,
    active,
    details,
    recommendation,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
