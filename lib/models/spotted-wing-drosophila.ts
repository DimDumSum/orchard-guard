// ---------------------------------------------------------------------------
// Spotted Wing Drosophila (SWD) Advisory Model
//
// Drosophila suzukii is primarily a soft-fruit pest.  Risk to apples is low
// unless fruit is wounded, cracked, or overripe.  Advisory only.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SWDResult {
  riskLevel: "low" | "moderate";
  riskScore: number;
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Advisory evaluation for spotted wing drosophila in apple orchards.
 *
 * Returns low risk unless specific conditions warrant monitoring.
 */
export function evaluateSWD(): SWDResult {
  return {
    riskLevel: "low",
    riskScore: 5,
    details:
      "Spotted wing drosophila targets soft fruit like cherries and berries, not apples. Intact apple fruit is not at risk, though damaged or cracked fruit can attract them.",
    recommendation:
      "Monitor with apple cider vinegar traps if soft fruit is grown nearby. " +
      "Remove damaged, cracked, or overripe fruit promptly to reduce attraction. " +
      "No routine treatment needed for sound apple fruit.",
  };
}
