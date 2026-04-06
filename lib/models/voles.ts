// Vole (Meadow & Pine) — seasonal advisory model
import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface VoleResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  season: string;
  details: string;
  recommendation: string;
}

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

export function evaluateVoles(): VoleResult {
  const month = new Date().getMonth() + 1;
  const season = getSeason(month);

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;
  let recommendation: string;

  if (season === "fall") {
    riskLevel = "high";
    riskScore = 70;
    recommendation =
      "Fall prep critical: pull mulch 15–20 cm from trunks, install hardware-cloth guards " +
      "on young trees, mow orchard floor short. Consider zinc phosphide bait stations.";
  } else if (season === "winter") {
    riskLevel = "high";
    riskScore = 75;
    recommendation =
      "Peak girdling period. Check trunk guards after snowfall. " +
      "After snowmelt, inspect trunks for girdling damage. Bridge-graft if found early.";
  } else {
    riskLevel = "low";
    riskScore = 10;
    recommendation = "Low risk during growing season. Maintain short grass around trunks. Repair guards before fall.";
  }

  let details: string;
  if (season === "fall") {
    details = "Fall prep is critical \u2014 voles build nests under mulch and snow cover before winter. They girdle trunks at the soil line where you can\u2019t see damage until spring.";
  } else if (season === "winter") {
    details = "Peak girdling risk. Voles tunnel under snow to feed on bark at the base of trunks. Damage often isn\u2019t discovered until snowmelt.";
  } else {
    details = "Spring vole risk drops as snow melts and predators become active. Check trunks at the base for any winter gnawing damage, especially under mulch rings.";
    recommendation = "Check bait stations. Pull mulch 15 cm away from trunks if you haven\u2019t already. Replace damaged trunk guards.";
  }

  return { riskLevel, riskScore, season, details, recommendation };
}
