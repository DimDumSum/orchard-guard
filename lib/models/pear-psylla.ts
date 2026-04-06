// ---------------------------------------------------------------------------
// Pear Psylla Advisory Model
//
// Pear psylla (Cacopsylla pyricola) is primarily a pear pest but can be
// relevant where apple and pear blocks are adjacent.  It vectors
// phytoplasma diseases.  Advisory only for apple orchards.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PearPsyllaResult {
  riskLevel: "low" | "moderate";
  riskScore: number;
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Advisory evaluation for pear psylla risk in apple orchards.
 *
 * Returns low risk by default. Relevant only when pear trees are nearby.
 */
export function evaluatePearPsylla(): PearPsyllaResult {
  return {
    riskLevel: "low",
    riskScore: 5,
    details:
      "Pear psylla is not really an apple pest. It only matters if you have pear trees nearby, since it can drift over from adjacent pear blocks.",
    recommendation:
      "Monitor only if pear trees are nearby. Pear psylla is a vector of " +
      "phytoplasma (pear decline). No apple-specific treatment needed.",
  };
}
