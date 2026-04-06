// ---------------------------------------------------------------------------
// Dagger Nematode (Xiphinema) Advisory Model
//
// Dagger nematodes feed on roots and vector Tomato Ringspot Virus (ToRSV)
// which causes apple union necrosis.  Advisory-level model — soil testing
// determines actual risk.
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DaggerNematodeResult {
  riskLevel: "low" | "moderate";
  riskScore: number;
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Advisory evaluation for dagger nematode risk.
 *
 * @param hasHighNematodeCounts  True if soil sampling has detected high
 *                               Xiphinema spp. counts (>50 per 100 cm³ soil).
 */
export function evaluateDaggerNematode(
  hasHighNematodeCounts: boolean,
): DaggerNematodeResult {
  if (hasHighNematodeCounts) {
    return {
      riskLevel: "moderate",
      riskScore: 45,
      details:
        "Soil tests show elevated dagger nematode levels. These root-feeding nematodes can carry Tomato Ringspot Virus, which causes apple union necrosis and gradual tree decline.",
      recommendation:
        "For new plantings: fumigate soil before planting (Vapam or Telone). " +
        "Use nematode-resistant rootstocks where available. " +
        "Remove old roots thoroughly before replanting. " +
        "Retest soil 6 months after fumigation.",
    };
  }

  return {
    riskLevel: "low",
    riskScore: 5,
    details:
      "No dagger nematode concerns detected. These soil-dwelling nematodes mainly matter when replanting on old orchard sites, where they can carry viruses to new trees.",
    recommendation:
      "Soil-test before planting new blocks, especially replant sites. " +
      "Request Xiphinema spp. counts from your soil lab. " +
      "No action needed for established trees with low counts.",
  };
}
