// Deer Damage — seasonal advisory model
import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface DeerResult {
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

export function evaluateDeer(): DeerResult {
  const month = new Date().getMonth() + 1;
  const season = getSeason(month);

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (month >= 9 && month <= 11) {
    riskLevel = "high";
    riskScore = 70;
  } else if (month === 12 || month <= 3) {
    riskLevel = "high";
    riskScore = 75;
  } else {
    riskLevel = "moderate";
    riskScore = 30;
  }

  let details: string;
  let recommendation: string;

  if (month >= 9 && month <= 11) {
    details = "Antler rub season. Bucks are rubbing velvet off antlers on young tree trunks, which can girdle and kill them.";
    recommendation =
      "Install wire cages or tree guards on young trees. Inspect and repair exclusion fencing before rut season peaks.";
  } else if (month === 12 || month <= 3) {
    details = "Peak browse season \u2014 food is scarce and deer are hungry. Terminal leaders and buds on young trees are most vulnerable.";
    recommendation =
      "Check fencing after storms. Look for terminal leader damage on young trees. Maintain 8 ft exclusion fencing.";
  } else {
    details = "Early spring is peak deer browse time. Buds are starting to swell and deer are hungry after winter. Young trees are most vulnerable.";
    recommendation =
      "Check fencing integrity this week. Inspect young tree blocks for browse damage. Repair trunk guards if damaged.";
  }

  return { riskLevel, riskScore, season, details, recommendation };
}
