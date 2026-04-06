// ---------------------------------------------------------------------------
// Post-Harvest Disease Model — Advisory (blue mold, gray mold, mucor)
//
// Advisory model that estimates post-harvest rot risk based on wound risk
// factors: hail events and insect damage increase the entry points for
// Penicillium, Botrytis, and Mucor spp. in storage.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PostHarvestResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  woundRiskFactors: string[];
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluatePostHarvest(
  hailEvents: number,
  insectDamage: boolean,
): PostHarvestResult {
  const woundRiskFactors: string[] = [];

  if (hailEvents > 0) {
    woundRiskFactors.push(`${hailEvents} hail event(s) recorded this season`);
  }
  if (insectDamage) {
    woundRiskFactors.push("Insect feeding damage reported");
  }

  // Risk classification
  let riskLevel: PostHarvestResult["riskLevel"];
  let riskScore: number;

  if (hailEvents > 0 && insectDamage) {
    riskLevel = "high";
    riskScore = 85;
  } else if (hailEvents > 0 || insectDamage) {
    riskLevel = "moderate";
    riskScore = 50;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  let details: string;
  if (riskLevel === "high") {
    details = `Both hail damage and insect feeding have created wound entry points on fruit. Blue mold, gray mold, and mucor can enter through these wounds in storage — sort carefully at harvest and consider a post-harvest fungicide drench.`;
  } else if (riskLevel === "moderate") {
    details = hailEvents > 0
      ? `Hail damage (${hailEvents} event(s)) has created potential entry points for post-harvest rot pathogens. Handle fruit gently at harvest and cull damaged fruit.`
      : "Insect feeding damage has been reported, which creates entry points for storage rots. Inspect fruit carefully during packing.";
  } else {
    details = "No hail or significant insect damage reported this season. With clean fruit and proper cold storage, post-harvest rot risk is low.";
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "High wound load from hail and insect damage increases blue mold, gray mold, and mucor risk in storage. " +
      "Sort fruit carefully at harvest—cull damaged fruit. Apply post-harvest fungicide drench (fludioxonil or pyrimethanil). " +
      "Maintain strict cold storage at 0-1°C and sanitize bins and packing equipment.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Some wound entry points may allow post-harvest decay. Improve harvest handling to minimize bruising. " +
      "Consider post-harvest fungicide treatment for long-term storage lots. Maintain cold chain integrity.";
  } else {
    recommendation =
      "Low wound risk. Standard post-harvest handling and cold storage practices should provide adequate protection. " +
      "Maintain bin sanitation and prompt cooling.";
  }

  return {
    riskLevel,
    riskScore,
    woundRiskFactors,
    details,
    recommendation,
  };
}
