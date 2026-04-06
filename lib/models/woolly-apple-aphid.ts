// ---------------------------------------------------------------------------
// Woolly Apple Aphid Pest Model — Temperature-driven activity
//
// Eriosoma lanigerum colonies become active when mean daily temperatures
// consistently exceed 10°C.  The parasitoid Aphelinus mali often provides
// effective biological control.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WoollyAppleAphidResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  details: string;
  recommendation: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTIVE_MEAN_TEMP = 10;
const WARM_WINDOW = 7;
const WARM_FRACTION = 0.7;

const SCOUTING_PROTOCOL =
  "Inspect pruning wounds, root suckers, and graft unions for white waxy colonies. " +
  "Check for Aphelinus mali parasitoid (black mummified aphids).";

const PRODUCT_SUGGESTIONS: string[] = [
  "Admire (imidacloprid)",
  "Movento (spirotetramat)",
];

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateWoollyAppleAphid(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): WoollyAppleAphidResult {
  // Evaluate recent mean temps to determine colony activity
  const recent = dailyData.slice(-WARM_WINDOW);
  const warmDays = recent.filter(
    (d) => (d.max_temp + d.min_temp) / 2 > ACTIVE_MEAN_TEMP,
  ).length;
  const consistentlyWarm =
    recent.length > 0 && warmDays / recent.length >= WARM_FRACTION;

  // Also check for sustained warm period (high risk)
  const extendedRecent = dailyData.slice(-14);
  const extendedWarm = extendedRecent.filter(
    (d) => (d.max_temp + d.min_temp) / 2 > ACTIVE_MEAN_TEMP,
  ).length;
  const sustainedWarm =
    extendedRecent.length > 0 &&
    extendedWarm / extendedRecent.length >= WARM_FRACTION;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (sustainedWarm && consistentlyWarm) {
    riskLevel = "high";
    riskScore = 72;
  } else if (consistentlyWarm) {
    riskLevel = "moderate";
    riskScore = 42;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const meanRecent =
    recent.length > 0
      ? Math.round(
          (recent.reduce((s, d) => s + (d.max_temp + d.min_temp) / 2, 0) /
            recent.length) *
            10,
        ) / 10
      : 0;

  let details: string;
  if (riskLevel === "high") {
    details = `Temperatures have stayed warm (averaging ${meanRecent}°C recently) for an extended stretch, so woolly apple aphid colonies are likely expanding on pruning wounds and graft unions. Check for the Aphelinus mali parasitoid before spraying.`;
  } else if (riskLevel === "moderate") {
    details = `Recent temperatures are averaging ${meanRecent}°C, which is warm enough to get woolly apple aphid colonies moving. Look for white waxy clusters forming on wounds and aerial wood.`;
  } else {
    details = `Temperatures are still too cool (averaging ${meanRecent}°C) for woolly apple aphid colonies to become active. They need consistent daily means above 10°C to get going.`;
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Sustained warm temperatures — woolly apple aphid colonies likely expanding. " +
      "Scout wounds and graft unions. Check for Aphelinus mali parasitoid before treating.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Conditions favor colony activity. Scout for waxy colonies on aerial parts. " +
      "Preserve Aphelinus mali parasitoid — avoid broad-spectrum sprays.";
  } else {
    recommendation =
      "Low risk. Temperatures below activity threshold. Monitor as conditions warm.";
  }

  return {
    riskLevel,
    riskScore,
    details,
    recommendation,
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
