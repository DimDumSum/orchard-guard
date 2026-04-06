// ---------------------------------------------------------------------------
// Replant Disease Model — Advisory
//
// Simple advisory model: if the site is a replant site, recommend fumigation
// or biofumigation practices.  No weather inputs required.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReplantDiseaseResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  isReplantSite: boolean;
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateReplantDisease(
  isReplantSite: boolean,
): ReplantDiseaseResult {
  if (isReplantSite) {
    return {
      riskLevel: "moderate",
      riskScore: 50,
      isReplantSite: true,
      details:
        "This is a replant site. Apple replant disease complex (fungi, oomycetes, and nematodes) " +
        "may suppress growth and yield of newly planted trees.",
      recommendation:
        "Consider pre-plant soil fumigation or biofumigation with Brassica cover crops. " +
        "Apply mycorrhizal inoculants at planting. Use vigorous rootstocks (e.g., G.41, G.935) " +
        "with some tolerance. Monitor first-year growth closely and supplement with fertigation if needed.",
    };
  }

  return {
    riskLevel: "low",
    riskScore: 5,
    isReplantSite: false,
    details: "Site is not flagged as a replant site. Replant disease risk is minimal.",
    recommendation:
      "No replant-specific action needed. If planting into a site previously in apple or stone fruit, " +
      "consider soil testing for pathogen load before planting.",
  };
}
