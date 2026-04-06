// ---------------------------------------------------------------------------
// Apple Rust Mite Advisory Model
//
// Usually beneficial — serves as food for predatory mites that control more
// damaging species (e.g., European red mite, two-spotted spider mite).
// Treatment rarely needed unless populations exceed 200/leaf with bronzing.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppleRustMiteResult {
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

const SCOUTING_PROTOCOL =
  "Check 10 leaves per tree on 10 trees using a hand lens (10×). " +
  "Threshold: 200 mites per leaf with visible leaf bronzing.";

const PRODUCT_SUGGESTIONS: string[] = [
  "Sulfur (if severe)",
  "Superior Oil",
];

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Advisory evaluation for apple rust mite (Aculus schlechtendali).
 *
 * Almost always returns low risk. Moderate populations are intentionally
 * maintained to support biological mite control via predatory mites.
 */
export function evaluateAppleRustMite(): AppleRustMiteResult {
  return {
    riskLevel: "low",
    riskScore: 5,
    details:
      "No action needed. Apple rust mites are actually helpful in your orchard because they feed predatory mites that keep more damaging species like European red mite under control.",
    recommendation:
      "Maintain moderate populations to support biological mite control. " +
      "Treat only if counts exceed 200/leaf with visible leaf bronzing and " +
      "no predatory mites are present.",
    scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
